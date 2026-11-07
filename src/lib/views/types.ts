import type { Platform } from "../platforms";

export type ClipStats = {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  postedAt?: Date | null;
  source: "API" | "DEMO";
};

/** Compte connecté du clippeur pour cette plateforme (jeton déchiffré), s'il existe. */
export type LinkedAccount = { accessToken: string; externalUserId: string } | null;

export type StatsContext = { platform: Platform; externalId: string; submittedAt: Date; now: Date; account?: LinkedAccount };

export type FetchResult = {
  stats: ClipStats | null;
  /** true : vidéo trouvée sur le compte connecté ; false : absente ; null : non vérifiable */
  ownershipVerified: boolean | null;
  /** part des vues venant des pays ciblés (0..1), si disponible */
  audienceShare: number | null;
};

/** Renvoie null si la plateforme ne peut pas être interrogée dans ce contexte (pas de clé, pas de compte…). */
export type StatsProvider = (ctx: StatsContext) => Promise<FetchResult | null>;
