/**
 * Images du site (générées avec ChatGPT, voir les prompts IMG-01 à IMG-08).
 * Mettre le chemin quand le fichier est ajouté dans public/images ; null = visuel de remplacement en code.
 */
export const IMAGES: Record<"hero" | "probleme" | "lienIntelligent" | "antiFraude" | "clippeuse" | "cta" | "missions" | "og", string | null> = {
  hero: "/images/hero.webp", // IMG-01
  probleme: "/images/probleme.webp", // IMG-02
  lienIntelligent: "/images/lien-intelligent.webp", // IMG-03
  antiFraude: null, // remplacée par un graphique (components/landing/fraud-showcase.tsx)
  clippeuse: "/images/clippeuse.webp", // IMG-05
  cta: "/images/cta.webp", // IMG-06
  missions: "/images/missions.webp", // IMG-07
  og: "/images/og-bg.jpg", // IMG-08 : fond de src/app/opengraph-image.tsx
};
