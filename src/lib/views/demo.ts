import type { ClipStats, StatsContext } from "./types";

/**
 * Mode démo : simule une croissance de vues réaliste pour les plateformes pas encore branchées.
 * Environ 1 clip sur 5 simule une injection de vues par bots (pic brutal sans engagement),
 * pour voir l'anti-fraude en action. À n'utiliser qu'en local / démo.
 */
export const demoProvider = async ({ externalId, submittedAt, now }: StatsContext): Promise<ClipStats | null> => {
  const h = hash(externalId);
  const hours = Math.max(0, (now.getTime() - submittedAt.getTime()) / 3_600_000);
  const potential = 2_000 + (h % 60_000); // plafond organique du clip
  const organic = Math.round(potential * (1 - Math.exp(-hours / 18)));
  const engagementRate = 0.03 + ((h >>> 3) % 50) / 1000; // 3 % à 8 %
  let views = organic;
  let likes = Math.round(organic * engagementRate);
  const comments = Math.round(likes * 0.06);
  const shares = Math.round(likes * 0.1);

  const isBotted = h % 5 === 0;
  if (isBotted && hours >= 3) views += 40_000 + (h % 30_000); // injection soudaine, aucun like associé
  if (isBotted) likes = Math.round(likes * 0.2);

  return {
    views,
    likes,
    comments,
    shares,
    postedAt: new Date(submittedAt.getTime() - 2 * 3_600_000),
    source: "DEMO",
  };
};

function hash(s: string) {
  let x = 2166136261;
  for (let i = 0; i < s.length; i++) x = Math.imul(x ^ s.charCodeAt(i), 16777619);
  return x >>> 0;
}
