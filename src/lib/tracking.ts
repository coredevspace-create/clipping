import { db } from "./db";
import { analyzeClip, median, nextStatus } from "./fraud";
import type { Platform } from "./platforms";
import { fetchClipStats } from "./views";

type StatsInput = { views: number; likes: number; comments: number; shares: number; postedAt?: Date | null };

/** Récupère les stats d'un clip via l'API, enregistre un relevé et relance l'analyse anti-fraude. */
export async function refreshClip(clipId: string, now = new Date()) {
  const clip = await db.clip.findUniqueOrThrow({ where: { id: clipId } });
  if (clip.status === "REJECTED") return { skipped: true as const };
  const stats = await fetchClipStats({
    platform: clip.platform as Platform,
    externalId: clip.externalId,
    submittedAt: clip.createdAt,
    now,
  });
  if (!stats) return { skipped: true as const };
  await recordStats(clipId, stats, stats.source, now);
  return { skipped: false as const };
}

/** Enregistre des stats (API, démo ou saisie manuelle), puis recalcule le score de fraude et le statut. */
export async function recordStats(clipId: string, stats: StatsInput, source: string, now = new Date()) {
  const clip = await db.clip.findUniqueOrThrow({ where: { id: clipId }, include: { workspace: true } });

  await db.viewSnapshot.create({
    data: { clipId, views: stats.views, likes: stats.likes, comments: stats.comments, shares: stats.shares, capturedAt: now },
  });

  const [snapshots, otherClips] = await Promise.all([
    db.viewSnapshot.findMany({ where: { clipId }, orderBy: { capturedAt: "asc" } }),
    db.clip.findMany({
      where: { membershipId: clip.membershipId, id: { not: clipId }, status: { not: "REJECTED" } },
      select: { views: true },
    }),
  ]);

  const postedAt = stats.postedAt ?? clip.postedAt;
  const result = analyzeClip({
    ...stats,
    snapshots,
    postedAt,
    submittedAt: clip.createdAt,
    clipperMedianViews: otherClips.length >= 3 ? median(otherClips.map((c) => c.views)) : null,
  });

  await db.clip.update({
    where: { id: clipId },
    data: {
      views: stats.views,
      likes: stats.likes,
      comments: stats.comments,
      shares: stats.shares,
      postedAt,
      lastFetchedAt: now,
      statsSource: source,
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
