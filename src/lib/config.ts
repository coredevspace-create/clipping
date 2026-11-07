/** Nom provisoire du produit : à changer ici uniquement. */
export const APP_NAME = "Clipsquad";

export const PLANS = {
  STARTER: { label: "Starter", priceEur: 49, maxClippers: 10 },
  PRO: { label: "Pro", priceEur: 99, maxClippers: 40 },
  AGENCE: { label: "Agence", priceEur: 199, maxClippers: Infinity },
} as const;

export type PlanKey = keyof typeof PLANS;

export function planOf(plan: string) {
  return PLANS[(plan in PLANS ? plan : "STARTER") as PlanKey];
}

export function appUrl() {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
