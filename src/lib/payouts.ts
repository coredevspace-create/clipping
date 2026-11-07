/**
 * Calcul des rémunérations.
 *
 * Règles :
 *  - un clip est payable s'il est APPROVED, ou PENDING (non signalé) depuis au moins `holdDays` jours ;
 *  - FLAGGED / REJECTED ne sont jamais payés (le créateur doit d'abord valider) ;
 *  - rien n'est payé tant que le clip n'a pas atteint `minViews` ;
 *  - gain total du clip = vues × CPM / 1000, plafonné à `maxPayoutPerClipCents` ;
 *  - on ne paie que la différence avec ce qui a déjà été versé (paiements incrémentaux).
 */

export type PayoutSettings = { cpmCents: number; minViews: number; maxPayoutPerClipCents: number; holdDays: number };

export type PayableClip = {
  id: string;
  membershipId: string;
  status: string;
  views: number;
  paidViews: number;
  paidCents: number;
  createdAt: Date;
};

export type PayoutLineDraft = { clipId: string; views: number; amountCents: number; totalViews: number; totalCents: number };
export type PayoutDraft = { membershipId: string; amountCents: number; views: number; lines: PayoutLineDraft[] };

export function isEligible(clip: PayableClip, s: PayoutSettings, now: Date): boolean {
  if (clip.status === "APPROVED") return true;
  if (clip.status !== "PENDING") return false;
  return now.getTime() - clip.createdAt.getTime() >= s.holdDays * 86_400_000;
}

export function clipEarnings(views: number, s: PayoutSettings): number {
  if (views < s.minViews) return 0;
  return Math.min(Math.floor((views * s.cpmCents) / 1000), s.maxPayoutPerClipCents);
}

export function computeClipLine(clip: PayableClip, s: PayoutSettings, now: Date): PayoutLineDraft | null {
  if (!isEligible(clip, s, now)) return null;
  const totalCents = clipEarnings(clip.views, s);
  const amountCents = totalCents - clip.paidCents;
  if (amountCents <= 0) return null;
  return { clipId: clip.id, views: Math.max(clip.views - clip.paidViews, 0), amountCents, totalViews: clip.views, totalCents };
}

export function computePayouts(clips: PayableClip[], s: PayoutSettings, now = new Date()): PayoutDraft[] {
  const byMember = new Map<string, PayoutDraft>();
  for (const clip of clips) {
    const line = computeClipLine(clip, s, now);
    if (!line) continue;
    const d = byMember.get(clip.membershipId) ?? { membershipId: clip.membershipId, amountCents: 0, views: 0, lines: [] };
    d.amountCents += line.amountCents;
    d.views += line.views;
    d.lines.push(line);
    byMember.set(clip.membershipId, d);
  }
  return [...byMember.values()].sort((a, b) => b.amountCents - a.amountCents);
}
