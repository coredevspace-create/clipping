/**
 * Spécialisation « logiciels grand public » : type de produit, vocabulaire des conversions
 * et lien intelligent qui envoie chaque visiteur vers le bon store.
 */
export const PRODUCT_TYPES = {
  APP: { label: "App mobile", conversion: "téléchargement", conversions: "téléchargements", kind: "INSTALL" },
  GAME: { label: "Jeu mobile", conversion: "téléchargement", conversions: "téléchargements", kind: "INSTALL" },
  WEB: { label: "SaaS / site web", conversion: "inscription", conversions: "inscriptions", kind: "SIGNUP" },
  DESKTOP: { label: "Logiciel", conversion: "téléchargement", conversions: "téléchargements", kind: "INSTALL" },
  EXTENSION: { label: "Extension navigateur", conversion: "installation", conversions: "installations", kind: "INSTALL" },
} as const;

export type ProductType = keyof typeof PRODUCT_TYPES;
export const productOf = (t: string) => PRODUCT_TYPES[(t in PRODUCT_TYPES ? t : "APP") as ProductType];

export const CONVERSION_KINDS = { INSTALL: "Téléchargement", SIGNUP: "Inscription", PURCHASE: "Achat / abonnement" } as const;

export type Device = "IOS" | "ANDROID" | "DESKTOP";

export function detectDevice(ua: string): Device {
  if (/iPhone|iPad|iPod/i.test(ua)) return "IOS";
  if (/Android/i.test(ua)) return "ANDROID";
  return "DESKTOP";
}

type Links = { productUrl: string | null; appStoreUrl: string | null; playStoreUrl: string | null; appStoreProviderToken: string | null };

/**
 * Destination du lien d'un clippeur selon l'appareil du visiteur, avec le marquage qui permet
 * d'attribuer les téléchargements au clippeur dans App Store Connect (ct) et la Play Console (referrer).
 */
export function smartLinkTarget(w: Links, device: Device, code: string): string | null {
  const withParams = (raw: string, params: Record<string, string>) => {
    const u = new URL(raw);
    for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
    return u.toString();
  };
  if (device === "IOS" && w.appStoreUrl) {
    return withParams(w.appStoreUrl, { ...(w.appStoreProviderToken ? { pt: w.appStoreProviderToken } : {}), ct: `clipsquad-${code}`, mt: "8" });
  }
  if (device === "ANDROID" && w.playStoreUrl) {
    return withParams(w.playStoreUrl, { referrer: `utm_source=clipsquad&utm_medium=clip&utm_content=${code}` });
  }
  const web = w.productUrl ?? w.appStoreUrl ?? w.playStoreUrl;
  if (!web) return null;
  return web === w.productUrl ? withParams(web, { utm_source: "clipsquad", utm_medium: "clip", utm_content: code }) : web;
}

/** Coût par conversion (centimes) : ce qui a été gagné par le clippeur ÷ conversions. */
export const costPer = (cents: number, conversions: number) => (conversions > 0 ? Math.round(cents / conversions) : null);
