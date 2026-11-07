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

/**
 * Adresse publique du site (liens d'invitation, liens traqués).
 * Ordre : APP_URL si défini (ex. nom de domaine perso), sinon l'adresse de production fournie
 * automatiquement par Vercel, sinon localhost en développement.
 */
export function appUrl(env: Record<string, string | undefined> = process.env) {
  const vercel = env.VERCEL_PROJECT_PRODUCTION_URL ?? env.VERCEL_URL;
  const url = env.APP_URL || (vercel ? `https://${vercel}` : "http://localhost:3000");
  return url.replace(/\/$/, "");
}

/**
 * Informations légales affichées dans les mentions légales, la politique de confidentialité et les CGU.
 * ⚠️ À COMPLÉTER avant de soumettre les demandes d'accès aux API (TikTok, Meta, Google les vérifient).
 * Modifiables aussi par variables d'environnement sur Vercel.
 */
export const LEGAL = {
  company: process.env.LEGAL_COMPANY || "[Nom de la société — à compléter]",
  form: process.env.LEGAL_FORM || "[Forme juridique et capital — à compléter]",
  address: process.env.LEGAL_ADDRESS || "[Adresse du siège — à compléter]",
  siren: process.env.LEGAL_SIREN || "[SIREN / RCS — à compléter]",
  director: process.env.LEGAL_DIRECTOR || "[Directeur de la publication — à compléter]",
  email: process.env.LEGAL_EMAIL || "[contact@ton-domaine.fr — à compléter]",
  updatedAt: "7 novembre 2026",
};
