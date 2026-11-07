import { audienceShare } from "./audience";
import type { StatsProvider } from "./types";

/**
 * YouTube Data API v3 (stats publiques, clé API ou jeton du clippeur)
 * + YouTube Analytics (pays des spectateurs) si le clippeur a connecté sa chaîne.
 */
export const youtubeProvider: StatsProvider = async ({ externalId, account }) => {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key && !account) return null;
  const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${encodeURIComponent(externalId)}${key ? `&key=${key}` : ""}`;
  const res = await fetch(url, { cache: "no-store", headers: !key && account ? { Authorization: `Bearer ${account.accessToken}` } : {} });
  if (!res.ok) throw new Error(`YouTube API ${res.status}`);
  const data = (await res.json()) as {
    items?: { statistics?: Record<string, string>; snippet?: { publishedAt?: string; channelId?: string; title?: string; description?: string; channelTitle?: string; thumbnails?: Record<string, { url: string }> } }[];
  };
  const item = data.items?.[0];
  if (!item) throw new Error("Vidéo YouTube introuvable (supprimée ou privée).");
  const st = item.statistics ?? {};
  const owned = account ? item.snippet?.channelId === account.externalUserId : null;

  let share: number | null = null;
  if (account && owned) {
    try {
      share = await youtubeAudience(externalId, account.accessToken);
    } catch {
      share = null; // l'analytique est un bonus : on ne bloque pas le relevé
    }
  }
  return {
    stats: {
      views: Number(st.viewCount ?? 0),
      likes: Number(st.likeCount ?? 0),
      comments: Number(st.commentCount ?? 0),
      shares: 0,
      postedAt: item.snippet?.publishedAt ? new Date(item.snippet.publishedAt) : null,
      source: "API",
    },
    ownershipVerified: owned,
    audienceShare: share,
    meta: {
      caption: `${item.snippet?.title ?? ""}\n${item.snippet?.description ?? ""}`.trim() || null,
      author: item.snippet?.channelTitle ?? null,
      thumbnailUrl: item.snippet?.thumbnails?.maxres?.url ?? item.snippet?.thumbnails?.high?.url ?? `https://i.ytimg.com/vi/${externalId}/hqdefault.jpg`,
    },
  };
};

export async function youtubeAudience(videoId: string, token: string) {
  const params = new URLSearchParams({
    ids: "channel==MINE",
    startDate: "2015-01-01",
    endDate: new Date().toISOString().slice(0, 10),
    metrics: "views",
    dimensions: "country",
    filters: `video==${videoId}`,
    sort: "-views",
    maxResults: "50",
  });
  const r = await fetch(`https://youtubeanalytics.googleapis.com/v2/reports?${params}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) throw new Error(`YouTube Analytics ${r.status}`);
  const d = (await r.json()) as { rows?: [string, number][] };
  return audienceShare(d.rows ?? []);
}
