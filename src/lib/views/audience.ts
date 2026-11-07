/** Pays considérés comme « audience attendue » pour un contenu francophone. */
export const FRANCOPHONE_COUNTRIES = new Set([
  "FR", "BE", "CH", "CA", "LU", "MC",
  "MA", "DZ", "TN", "SN", "CI", "CM", "CD", "CG", "BJ", "BF", "ML", "NE", "TG", "GA", "GN", "MG", "HT", "MU",
]);

/** rows : [[codePays, vues], …] → part des vues venant des pays attendus, ou null si pas de données. */
export function audienceShare(rows: [string, number][]): number | null {
  const total = rows.reduce((s, [, v]) => s + v, 0);
  if (total <= 0) return null;
  const expected = rows.reduce((s, [c, v]) => s + (FRANCOPHONE_COUNTRIES.has(c.toUpperCase()) ? v : 0), 0);
  return expected / total;
}
