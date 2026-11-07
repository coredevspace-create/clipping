import { IG_VERSION } from "../oauth/providers";
import type { StatsProvider } from "./types";

type Media = { id: string; caption?: string; thumbnail_url?: string; media_url?: string; shortcode?: string; permalink?: string; timestamp?: string; like_count?: number; comments_count?: number };
type Insight = { name: string; values?: { value: number }[]; total_value?: { value: number } };

const G = () => `https://graph.instagram.com/${IG_VERSION()}`;

/**
 * API Instagram (compte professionnel du clippeur) : on retrouve le Reel parmi ses publications
 * (preuve de propriété), puis on lit ses statistiques (vues, likes, commentaires, partages).
 */
export const instagramProvider: StatsProvider = async ({ externalId, account }) => {
  if (!account) return null;
  const media = await findMedia(externalId, account.accessToken);
  if (!media) return { stats: null, ownershipVerified: false, audienceShare: null };

  const r = await fetch(`${G()}/${media.id}/insights?metric=views,likes,comments,shares&access_token=${encodeURIComponent(account.accessToken)}`, { cache: "no-store" });
  const d = (await r.json().catch(() => ({}))) as { data?: Insight[]; error?: { message?: string } };
  if (!r.ok || d.error) throw new Error(`Instagram API : ${d.error?.message ?? r.status}`);
  const metric = (name: string) => {
    const m = d.data?.find((x) => x.name === name);
    return m?.total_value?.value ?? m?.values?.[0]?.value ?? 0;
  };
  return {
    stats: {
      views: metric("views"),
      likes: metric("likes") || media.like_count || 0,
      comments: metric("comments") || media.comments_count || 0,
      shares: metric("shares"),
      postedAt: media.timestamp ? new Date(media.timestamp) : null,
      source: "API",
    },
    ownershipVerified: true,
    audienceShare: null,
    meta: { caption: media.caption ?? null, thumbnailUrl: media.thumbnail_url ?? media.media_url ?? null },
  };
};

/** Parcourt les publications récentes du compte (jusqu'à 200) pour retrouver le code du Reel. */
export async function findMedia(shortcode: string, token: string): Promise<Media | null> {
  let url: string | undefined = `${G()}/me/media?fields=id,caption,thumbnail_url,media_url,shortcode,permalink,timestamp,like_count,comments_count&limit=50&access_token=${encodeURIComponent(token)}`;
  for (let page = 0; url && page < 4; page++) {
    const r: Response = await fetch(url, { cache: "no-store" });
    const d = (await r.json().catch(() => ({}))) as { data?: Media[]; paging?: { next?: string }; error?: { message?: string } };
    if (!r.ok || d.error) throw new Error(`Instagram API : ${d.error?.message ?? r.status}`);
    const hit = d.data?.find((m) => m.shortcode === shortcode || m.permalink?.includes(`/${shortcode}`));
    if (hit) return hit;
    url = d.paging?.next;
  }
  return null;
}
