import type { StatsProvider } from "./types";

/** YouTube Data API v3 : statistiques publiques d'une vidéo (clé API simple, aucun OAuth requis). */
export const youtubeProvider: StatsProvider = async ({ externalId }) => {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return null;
  const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${encodeURIComponent(externalId)}&key=${key}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`YouTube API ${res.status}`);
  const data = (await res.json()) as {
    items?: { statistics?: Record<string, string>; snippet?: { publishedAt?: string } }[];
  };
  const item = data.items?.[0];
  if (!item) throw new Error("Vidéo YouTube introuvable (supprimée ou privée).");
  const st = item.statistics ?? {};
  return {
    views: Number(st.viewCount ?? 0),
    likes: Number(st.likeCount ?? 0),
    comments: Number(st.commentCount ?? 0),
    shares: 0, // non exposé par l'API publique
    postedAt: item.snippet?.publishedAt ? new Date(item.snippet.publishedAt) : null,
    source: "API",
  };
};
