import type { Platform } from "../platforms";
import { demoProvider } from "./demo";
import type { StatsContext, StatsProvider } from "./types";
import { youtubeProvider } from "./youtube";

/**
 * Branchement des plateformes.
 * - YouTube : API publique (clé), opérationnel.
 * - TikTok / Instagram / X : à brancher une fois les accès API obtenus (voir docs/ACCES-API-PLATEFORMES.md).
 *   En attendant : mode démo en local, ou saisie manuelle des stats par le créateur.
 */
const providers: Partial<Record<Platform, StatsProvider>> = {
  YOUTUBE: youtubeProvider,
};

export const demoMode = () => process.env.VIEWS_DEMO_MODE === "true";

export async function fetchClipStats(ctx: StatsContext) {
  const provider = providers[ctx.platform];
  const real = provider ? await provider(ctx) : null;
  if (real) return real;
  if (demoMode()) return demoProvider(ctx);
  return null;
}

export type { ClipStats } from "./types";
