import { compact } from "@/lib/format";
import { Avatar } from "../market";

/** Classement des clippeurs par vues (barres horizontales, une seule série : valeur affichée en clair). */
export function Leaderboard({ rows, highlight }: { rows: { id: string; name: string; views: number; clips: number }[]; highlight?: string }) {
  const max = Math.max(...rows.map((r) => r.views), 1);
  if (rows.length === 0) return <p className="text-sm text-zinc-500">Pas encore de vues.</p>;
  return (
    <ol className="space-y-3">
      {rows.map((r, i) => (
        <li key={r.id} className={`flex items-center gap-3 rounded-xl px-2 py-1.5 ${r.id === highlight ? "bg-lime/30" : ""}`} title={`${r.name} : ${r.views.toLocaleString("fr-FR")} vues, ${r.clips} clip(s)`}>
          <span className="w-5 text-center font-mono text-xs text-zinc-500">{i + 1}</span>
          <Avatar name={r.name} size={30} />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="truncate font-medium">{r.name}{r.id === highlight && " (toi)"}</span>
              <span className="font-mono text-xs text-ink">{compact(r.views)}</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-ink/[0.06]">
              <div className="h-full rounded-full bg-[#5a7a00]" style={{ width: `${Math.max(2, (r.views / max) * 100)}%` }} />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
