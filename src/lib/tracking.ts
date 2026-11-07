import { db } from "./db";
import { analyzeClip, median, nextStatus } from "./fraud";
import { getAccess } from "./oauth/accounts";
import { OAUTH_PLATFORMS, PROVIDERS, type OAuthPlatform } from "./oauth/providers";
import type { Platform } from "./platforms";
import { containsCode, previewClip, type ClipPreview } from "./verify";
import { fetchClipStats } from "./views";
import type { LinkedAccount } from "./views/types";

type StatsInput = { views: number; likes: number; comments: number; shares: number; postedAt?: Date | null };
type Verification = { ownershipVerified?: boolean | null; audienceShare?: number | null; meta?: Partial<ClipPreview> | null };

/** Compte connecté du clippeur pour la plateforme du clip (jeton rafraîchi si besoin). */
async function linkedAccount(userId: string, platform: string): Promise<LinkedAccount> {
  if (!OAUTH_PLATFORMS.includes(platform as OAuthPlatform) || !PROVIDERS[platform as OAuthPlatform].configured()) return null;
  return getAccess(userId, platform as OAuthPlatform);
}

/** Récupère les stats d'un clip via l'API, enregistre un relevé et relance l'analyse anti-fraude. */
export async function refreshClip(clipId: string, now = new Date()) {
  const clip = await db.clip.findUniqueOrThrow({ where: { id: clipId }, include: { membership: { select: { userId: true } } } });
  if (clip.status === "REJECTED") return { skipped: true as const };
  // aperçu public (miniatures TikTok signées : elles expirent, on les rafraîchit)
  const preview = clip.platform === "TIKTOK" || clip.platform === "X" || !clip.thumbnailUrl
    ? await previewClip(clip.platform as Platform, clip.externalId, clip.url).catch(() => null)
    : null;
  if (preview) await applyPreview(clipId, preview);
  const result = await fetchClipStats({
    platform: clip.platform as Platform,
    externalId: clip.externalId,
    submittedAt: clip.createdAt,
    now,
    account: await linkedAccount(clip.membership.userId, clip.platform),
  });
  if (!result) return { skipped: true as const };
  if (result.meta) await applyPreview(clipId, result.meta);
  const verification = { ownershipVerified: result.ownershipVerified, audienceShare: result.audienceShare };
  if (result.stats) {
    await recordStats(clipId, result.stats, result.stats.source, now, verification);
  } else {
    // pas de stats mais une information de propriété (ex. vidéo absente du compte connecté)
    await reevaluate(clipId, verification);
  }
  return { skipped: false as const };
}

/** Enregistre des stats (API, démo ou saisie manuelle), puis recalcule le score de fraude et le statut. */
export async function recordStats(clipId: string, stats: StatsInput, source: string, now = new Date(), verification: Verification = {}) {
  await db.viewSnapshot.create({
    data: { clipId, views: stats.views, likes: stats.likes, comments: stats.comments, shares: stats.shares, capturedAt: now },
  });
  await reevaluate(clipId, verification, { ...stats, source, now });
}

/** Enregistre l'aperçu (miniature, légende, auteur) et valide la propriété si le code du clippeur est dans la description. */
async function applyPreview(clipId: string, p: Partial<ClipPreview>) {
  const clip = await db.clip.findUniqueOrThrow({ where: { id: clipId }, include: { membership: { select: { user: { select: { verifyCode: true } } } } } });
  const code = clip.membership.user.verifyCode;
  const proven = !!code && containsCode(p.caption, code);
  await db.clip.update({
    where: { id: clipId },
    data: {
      ...(p.thumbnailUrl ? { thumbnailUrl: p.thumbnailUrl } : {}),
      ...(p.caption ? { caption: p.caption.slice(0, 2000) } : {}),
      ...(p.author ? { authorHandle: p.author } : {}),
      ...(proven && clip.ownershipMethod !== "CODE" ? { ownershipVerified: true, ownershipMethod: "CODE" } : {}),
    },
  });
}

/** Recalcule le score anti-fraude d'un clip à partir de ses relevés et des vérifications disponibles. */
async function reevaluate(clipId: string, verification: Verification, fresh?: StatsInput & { source: string; now: Date }) {
  const clip = await db.clip.findUniqueOrThrow({ where: { id: clipId }, include: { workspace: true } });
  // une preuve par code dans la description est définitive ; sinon on prend le résultat du compte connecté
  const ownershipVerified =
    clip.ownershipMethod === "CODE" ? true : verification.ownershipVerified !== undefined ? verification.ownershipVerified : clip.ownershipVerified;
  const ownershipMethod = clip.ownershipMethod === "CODE" ? "CODE" : verification.ownershipVerified === true ? "OAUTH" : clip.ownershipMethod;
  const audience = verification.audienceShare ?? clip.audienceShare;
  const stats: StatsInput = fresh ?? { views: clip.views, likes: clip.likes, comments: clip.comments, shares: clip.shares, postedAt: clip.postedAt };

  const [snapshots, otherClips] = await Promise.all([
    db.viewSnapshot.findMany({ where: { clipId }, orderBy: { capturedAt: "asc" } }),
    db.clip.findMany({
      where: { membershipId: clip.membershipId, id: { not: clipId }, status: { not: "REJECTED" } },
      select: { views: true },
    }),
  ]);

  const postedAt = stats.postedAt ?? clip.postedAt;
  const result = analyzeClip({
    views: stats.views,
    likes: stats.likes,
    comments: stats.comments,
    shares: stats.shares,
    snapshots,
    postedAt,
    submittedAt: clip.createdAt,
    clipperMedianViews: otherClips.length >= 3 ? median(otherClips.map((c) => c.views)) : null,
    expectedAudienceShare: audience,
    ownershipVerified,
  });

  await db.clip.update({
    where: { id: clipId },
    data: {
      views: stats.views,
      likes: stats.likes,
      comments: stats.comments,
      shares: stats.shares,
      postedAt,
      ...(fresh ? { lastFetchedAt: fresh.now, statsSource: fresh.source } : {}),
      ownershipVerified,
      ownershipMethod,
      audienceShare: audience,
      fraudScore: result.score,
      fraudReasons: JSON.stringify(result.reasons),
      status: nextStatus(clip.status, result.score, clip.workspace.fraudThreshold, clip.approvedOverride),
    },
  });
}

/**
 * Rafraîchit les clips actifs. Cadence : chaque heure les 3 premiers jours (là où se joue la fraude),
 * puis toutes les 12 h jusqu'à 30 jours.
 */
export async function refreshDueClips(now = new Date()) {
  const since = new Date(now.getTime() - 30 * 86_400_000);
  const clips = await db.clip.findMany({
    where: { status: { not: "REJECTED" }, createdAt: { gte: since } },
    select: { id: true, createdAt: true, lastFetchedAt: true },
  });
  let refreshed = 0;
  const errors: string[] = [];
  for (const c of clips) {
    const ageH = (now.getTime() - c.createdAt.getTime()) / 3_600_000;
    const everyH = ageH < 72 ? 1 : 12;
    if (c.lastFetchedAt && now.getTime() - c.lastFetchedAt.getTime() < everyH * 3_600_000 - 5 * 60_000) continue;
    try {
      const r = await refreshClip(c.id, now);
      if (!r.skipped) refreshed++;
    } catch (e) {
      errors.push(`${c.id}: ${(e as Error).message}`);
    }
  }
  return { checked: clips.length, refreshed, errors };
}
