export const euros = (cents: number) =>
  (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

export const num = (n: number) => n.toLocaleString("fr-FR");

export const compact = (n: number) =>
  n.toLocaleString("fr-FR", { notation: "compact", maximumFractionDigits: 1 });

export const dateFr = (d: Date | null | undefined) =>
  d ? d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const dateTimeFr = (d: Date | null | undefined) =>
  d ? d.toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

export function timecode(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

/** "1:02:03", "12:30" ou "95" → secondes */
export function parseTimecode(input: string): number | null {
  const t = input.trim();
  if (!/^\d+(:\d{1,2}){0,2}$/.test(t)) return null;
  return t.split(":").map(Number).reduce((acc, x) => acc * 60 + x, 0);
}

export const STATUS_LABELS: Record<string, { label: string; tone: string }> = {
  PENDING: { label: "En vérification", tone: "bg-white/90 text-zinc-700 ring-1 ring-black/5" },
  FLAGGED: { label: "Suspect", tone: "bg-coral text-white" },
  APPROVED: { label: "Validé", tone: "bg-ok text-white" },
  REJECTED: { label: "Refusé", tone: "bg-zinc-200 text-zinc-500" },
};
