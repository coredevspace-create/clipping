import type { Platform } from "../platforms";

export type ClipStats = {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  postedAt?: Date | null;
  source: "API" | "DEMO";
};

export type StatsContext = { platform: Platform; externalId: string; submittedAt: Date; now: Date };

/** Un fournisseur de statistiques par plateforme. Renvoie null si la plateforme n'est pas (encore) branchée. */
export type StatsProvider = (ctx: StatsContext) => Promise<ClipStats | null>;
