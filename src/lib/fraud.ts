/**
 * Détection des vues suspectes.
 *
 * Fonction pure : elle reçoit les statistiques d'un clip et son historique, et renvoie un score de 0 à 100
 * avec des raisons lisibles par le créateur. Le but n'est pas de « prouver » une fraude mais de mettre en
 * quarantaine ce qui mérite un coup d'œil humain, et de rendre la fraude non rentable
 * (combiné au délai de validation et au plafond par clip).
 */

export type Snapshot = { views: number; likes: number; comments: number; shares: number; capturedAt: Date };

export type FraudInput = {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  snapshots: Snapshot[];
  postedAt?: Date | null;
  submittedAt: Date;
  /** Médiane des vues des autres clips du même clippeur (null si pas d'historique) */
  clipperMedianViews?: number | null;
  /** Part de l'audience venant des pays attendus (ex. FR/BE/CH/CA), disponible via OAuth. 0..1 */
  expectedAudienceShare?: number | null;
};

export type FraudReason = { code: string; label: string; points: number };
export type FraudResult = { score: number; reasons: FraudReason[] };

const pct = (x: number) => `${(x * 100).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} %`;
const fmt = (n: number) => Math.round(n).toLocaleString("fr-FR");

export function analyzeClip(input: FraudInput): FraudResult {
  const reasons: FraudReason[] = [];
  const add = (code: string, label: string, points: number) => reasons.push({ code, label, points });

  // 1. Engagement anormalement bas : les bots de vues ne likent / commentent / partagent presque jamais.
  if (input.views >= 2000) {
    const engagement = (input.likes + input.comments + input.shares) / input.views;
    if (engagement < 0.003) {
      add("LOW_ENGAGEMENT", `Engagement très faible (${pct(engagement)} pour ${fmt(input.views)} vues ; un clip organique est souvent au-dessus de 2 %).`, 35);
    } else if (engagement < 0.008) {
      add("WEAK_ENGAGEMENT", `Engagement faible (${pct(engagement)}).`, 15);
    }
  }

  // 2. Analyse de la courbe : pics brutaux et vues qui montent sans aucun like.
  const snaps = [...input.snapshots].sort((a, b) => a.capturedAt.getTime() - b.capturedAt.getTime());
  const intervals: { dv: number; dl: number; hours: number; rate: number }[] = [];
  for (let i = 1; i < snaps.length; i++) {
    const hours = Math.max((snaps[i].capturedAt.getTime() - snaps[i - 1].capturedAt.getTime()) / 3_600_000, 1 / 60);
    const dv = snaps[i].views - snaps[i - 1].views;
    const dl = snaps[i].likes + snaps[i].comments + snaps[i].shares - (snaps[i - 1].likes + snaps[i - 1].comments + snaps[i - 1].shares);
    intervals.push({ dv, dl, hours, rate: dv / hours });
  }

  if (intervals.length >= 3) {
    let spikeFound = false;
    for (let i = 0; i < intervals.length && !spikeFound; i++) {
      const others = intervals.filter((_, j) => j !== i).map((x) => Math.max(x.rate, 0));
      const base = median(others);
      const cur = intervals[i];
      if (cur.dv >= 5000 && cur.rate >= Math.max(base, 10) * 8) {
        spikeFound = true;
        add("SPIKE", `Pic brutal : +${fmt(cur.dv)} vues en ${cur.hours.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} h, soit ${Math.round(cur.rate / Math.max(base, 1))}× le rythme habituel du clip.`, 30);
      }
    }
  }

  const blind = intervals.find((x) => x.dv >= 5000 && x.dl <= x.dv * 0.0005);
  if (blind) {
    add("VIEWS_WITHOUT_ENGAGEMENT", `+${fmt(blind.dv)} vues sur une période sans quasiment aucun like ni commentaire supplémentaire.`, 25);
  }

  // 3. Clip très au-dessus de l'historique du clippeur ET peu engageant.
  if (input.clipperMedianViews && input.clipperMedianViews >= 100 && input.views >= input.clipperMedianViews * 20) {
    const engagement = (input.likes + input.comments + input.shares) / Math.max(input.views, 1);
    if (engagement < 0.01) {
      add("OUTLIER", `${Math.round(input.views / input.clipperMedianViews)}× la médiane habituelle de ce clippeur, avec un engagement faible.`, 15);
    }
  }

  // 4. Vidéo publiée bien avant la soumission : risque de réclamer une vidéo déjà virale (ou celle de quelqu'un d'autre).
  if (input.postedAt) {
    const days = (input.submittedAt.getTime() - input.postedAt.getTime()) / 86_400_000;
    if (days > 7) add("OLD_VIDEO", `Vidéo publiée ${Math.floor(days)} jours avant d'être soumise.`, 20);
  }

  // 5. Audience géographique (seulement si le clippeur a connecté son compte) : contenu FR vu hors francophonie.
  if (input.expectedAudienceShare != null && input.views >= 1000 && input.expectedAudienceShare < 0.4) {
    add("GEO_MISMATCH", `Seulement ${pct(input.expectedAudienceShare)} de l'audience vient des pays ciblés.`, 35);
  }

  const score = Math.min(100, reasons.reduce((s, r) => s + r.points, 0));
  return { score, reasons };
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Statut après analyse. Un clip validé manuellement malgré un signalement n'est plus re-signalé. */
export function nextStatus(current: string, score: number, threshold: number, approvedOverride: boolean): string {
  if (current === "REJECTED") return "REJECTED";
  if (approvedOverride) return "APPROVED";
  if (score >= threshold) return "FLAGGED";
  if (current === "FLAGGED") return "PENDING"; // le signal a disparu, on repasse en vérification
  return current;
}
