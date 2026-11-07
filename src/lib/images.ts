/**
 * Images du site (générées avec ChatGPT, voir les prompts IMG-01 à IMG-08).
 * Mettre le chemin quand le fichier est ajouté dans public/images ; null = visuel de remplacement en code.
 */
export const IMAGES: Record<"hero" | "probleme" | "lienIntelligent" | "antiFraude" | "clippeuse" | "cta" | "missions" | "og", string | null> = {
  hero: "/images/hero.webp", // IMG-01
  probleme: null, // IMG-02 probleme.webp
  lienIntelligent: "/images/lien-intelligent.webp", // IMG-03
  antiFraude: null, // IMG-04 anti-fraude.webp
  clippeuse: "/images/clippeuse.webp", // IMG-05
  cta: null, // IMG-06 cta.webp
  missions: null, // IMG-07 missions.webp
  og: null, // IMG-08 og.webp (1200×630)
};
