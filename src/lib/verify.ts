import { randomBytes } from "node:crypto";
import { db } from "./db";
import type { Platform } from "./platforms";

/**
 * Preuve de propriété sans connexion de compte : chaque clippeur a un code personnel (ex. « cs7k2p »)
 * à mettre dans la description de ses vidéos. Seul le propriétaire du compte peut modifier une description,
 * donc retrouver le code prouve que la vidéo est bien la sienne.
 */
export async function ensureVerifyCode(userId: string): Promise<string> {
  const u = await db.user.findUniqueOrThrow({ where: { id: userId }, select: { verifyCode: true } });
  if (u.verifyCode) return u.verifyCode;
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  for (let i = 0; i < 5; i++) {
    const code = "cs" + Array.from(randomBytes(4), (b) => alphabet[b % alphabet.length]).join("");
    try {
      await db.user.update({ where: { id: userId }, data: { verifyCode: code } });
      return code;
    } catch {
      // collision très improbable : on réessaie
    }
  }
  throw new Error("Impossible de générer un code de vérification.");
}

/** Le texte contient-il le code (avec ou sans #, insensible à la casse) ? */
export function containsCode(text: string | null | undefined, code: string): boolean {
  if (!text || !code) return false;
  return new RegExp(`(^|[^a-z0-9])#?${code.toLowerCase()}([^a-z0-9]|$)`).test(text.toLowerCase());
}

export type ClipPreview = { caption: string | null; author: string | null; thumbnailUrl: string | null };

const stripHtml = (html: string) =>
  html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(6000) });
    return r.ok ? ((await r.json()) as T) : null;
  } catch {
    return null;
  }
}

/**
 * Aperçu public d'une vidéo, sans connexion de compte : légende/description, auteur, miniature.
 * YouTube : API Data (clé) ; TikTok et X : oEmbed public. Instagram : non disponible sans compte connecté.
 */
export async function previewClip(platform: Platform, externalId: string, url: string): Promise<ClipPreview | null> {
  if (platform === "YOUTUBE") {
    const thumb = `https://i.ytimg.com/vi/${encodeURIComponent(externalId)}/hqdefault.jpg`;
    const key = process.env.YOUTUBE_API_KEY;
    if (!key) return { caption: null, author: null, thumbnailUrl: thumb };
    const d = await getJson<{ items?: { snippet?: { title?: string; description?: string; channelTitle?: string; thumbnails?: Record<string, { url: string }> } }[] }>(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${encodeURIComponent(externalId)}&key=${key}`,
    );
    const s = d?.items?.[0]?.snippet;
    if (!s) return null;
    return {
      caption: `${s.title ?? ""}\n${s.description ?? ""}`.trim(),
      author: s.channelTitle ?? null,
      thumbnailUrl: s.thumbnails?.maxres?.url ?? s.thumbnails?.high?.url ?? thumb,
    };
  }
  if (platform === "TIKTOK") {
    const d = await getJson<{ title?: string; author_name?: string; author_unique_id?: string; thumbnail_url?: string }>(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
    );
    if (!d) return null;
    return { caption: d.title ?? "", author: d.author_unique_id ? `@${d.author_unique_id}` : d.author_name ?? null, thumbnailUrl: d.thumbnail_url ?? null };
  }
  if (platform === "X") {
    const d = await getJson<{ html?: string; author_name?: string; author_url?: string }>(
      `https://publish.twitter.com/oembed?omit_script=1&url=${encodeURIComponent(url)}`,
    );
    if (!d) return null;
    const handle = d.author_url?.split("/").pop();
    return { caption: d.html ? stripHtml(d.html) : "", author: handle ? `@${handle}` : d.author_name ?? null, thumbnailUrl: null };
  }
  return null;
}
