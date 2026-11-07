/**
 * Courbe cumulée des vues d'un ensemble de clips, jour par jour.
 * Pour chaque jour, on additionne le dernier relevé connu de chaque clip à la fin de ce jour.
 */
export type Snap = { capturedAt: Date; views: number };

export function dailySeries(snapsByClip: Snap[][], days: number, now = new Date()): { date: Date; views: number }[] {
  const sorted = snapsByClip.map((s) => [...s].sort((a, b) => +a.capturedAt - +b.capturedAt));
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const out: { date: Date; views: number }[] = [];
  for (let d = days - 1; d >= 0; d--) {
    const dayEnd = new Date(end.getTime() - d * 86_400_000);
    let total = 0;
    for (const snaps of sorted) {
      let last = 0;
      for (const s of snaps) {
        if (s.capturedAt <= dayEnd) last = s.views;
        else break;
      }
      total += last;
    }
    out.push({ date: new Date(dayEnd.getFullYear(), dayEnd.getMonth(), dayEnd.getDate()), views: total });
  }
  return out;
}
