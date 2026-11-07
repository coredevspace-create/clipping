import type { StatsProvider } from "./types";

type TikTokVideo = { id: string; title?: string; video_description?: string; cover_image_url?: string; create_time?: number; view_count?: number; like_count?: number; comment_count?: number; share_count?: number };

/**
 * TikTok Display API : statistiques d'une vidéo du clippeur connecté.
 * La requête ne renvoie que les vidéos du compte connecté : si la vidéo n'y est pas, elle ne lui appartient pas.
 */
export const tiktokProvider: StatsProvider = async ({ externalId, account }) => {
  if (!account) return null;
  const r = await fetch(
    "https://open.tiktokapis.com/v2/video/query/?fields=id,title,video_description,cover_image_url,create_time,view_count,like_count,comment_count,share_count",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${account.accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ filters: { video_ids: [externalId] } }),
      cache: "no-store",
    },
  );
  const d = (await r.json().catch(() => ({}))) as { data?: { videos?: TikTokVideo[] }; error?: { code?: string; message?: string } };
  if (!r.ok || (d.error?.code && d.error.code !== "ok")) throw new Error(`TikTok API : ${d.error?.message || d.error?.code || r.status}`);
  const v = d.data?.videos?.find((x) => x.id === externalId);
  if (!v) return { stats: null, ownershipVerified: false, audienceShare: null };
  return {
    stats: {
      views: v.view_count ?? 0,
      likes: v.like_count ?? 0,
      comments: v.comment_count ?? 0,
      shares: v.share_count ?? 0,
      postedAt: v.create_time ? new Date(v.create_time * 1000) : null,
      source: "API",
    },
    ownershipVerified: true,
    audienceShare: null,
    meta: { caption: v.video_description ?? v.title ?? null, thumbnailUrl: v.cover_image_url ?? null },
  };
};
