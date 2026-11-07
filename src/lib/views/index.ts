import type { Platform } from "../platforms";
import { demoProvider } from "./demo";
import { instagramProvider } from "./instagram";
import { tiktokProvider } from "./tiktok";
import type { FetchResult, StatsContext, StatsProvider } from "./types";
import { youtubeProvider } from "./youtube";

/**
 * Branchement des plateformes :
 *  - YouTube : clé API (stats publiques) et/ou chaîne connectée (propriété + pays des spectateurs)
 *  - TikTok, Instagram : compte connecté du clippeur (stats + preuve de propriété)
 *  - X : saisie manuelle (API payante, voir docs/ACCES-API-PLATEFORMES.md)
 * Sans source réelle : mode démo en local, sinon saisie manuelle par le créateur.
 */
const providers: Partial<Record<Platform, StatsProvider>> = {
  YOUTUBE: youtubeProvider,
  TIKTOK: tiktokProvider,
  INSTAGRAM: instagramProvider,
};

export const demoMode = () => process.env.VIEWS_DEMO_MODE === "true";

export async function fetchClipStats(ctx: StatsContext): Promise<FetchResult | null> {
  const provider = providers[ctx.platform];
  const real = provider ? await provider(ctx) : null;
  if (real) return real;
  if (demoMode()) {
    const stats = await demoProvider(ctx);
    return stats ? { stats, ownershipVerified: null, audienceShare: null } : null;
  }
  return null;
}

export type { ClipStats, FetchResult } from "./types";
