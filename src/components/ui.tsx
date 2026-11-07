import { STATUS_LABELS } from "@/lib/format";

export function Flash({ sp }: { sp: { erreur?: string; ok?: string } }) {
  if (sp.erreur) return <div role="alert" className="flash-err mb-5 flex items-center gap-3 rounded-2xl border border-coral/40 bg-coral/10 px-4 py-3 text-sm font-medium text-ink"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-coral text-xs text-white">!</span>{sp.erreur}</div>;
  if (sp.ok) return <div role="status" className="flash-ok mb-5 flex items-center gap-3 rounded-2xl border border-ink/10 bg-lime/40 px-4 py-3 text-sm font-medium text-ink"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink text-xs text-lime">✓</span>{sp.ok}</div>;
  return null;
}

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_LABELS[status] ?? { label: status, tone: "bg-zinc-100 text-zinc-700" };
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide ${s.tone}`}>{s.label}</span>;
}

export function FraudBadge({ score, threshold }: { score: number; threshold: number }) {
  const tone = score >= threshold ? "bg-coral" : score >= threshold / 2 ? "bg-amber-400" : "bg-lime-2";
  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs font-semibold">
      <span className="relative h-1.5 w-12 overflow-hidden rounded-full bg-ink/10"><span className={`absolute inset-y-0 left-0 ${tone}`} style={{ width: `${Math.max(score, 4)}%` }} /></span>
      {score}
    </span>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card">
      <div className="eyebrow text-zinc-500">{label}</div>
      <div className="mt-2 font-display text-3xl font-extrabold tracking-tight">{value}</div>
      {hint && <div className="mt-1 text-xs text-zinc-500">{hint}</div>}
    </div>
  );
}

export function PageTitle({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-ink/20 bg-white/50 p-10 text-center text-sm text-zinc-600">{children}</div>;
}
