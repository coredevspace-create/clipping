import { STATUS_LABELS } from "@/lib/format";

export function Flash({ sp }: { sp: { erreur?: string; ok?: string } }) {
  if (sp.erreur) return <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{sp.erreur}</div>;
  if (sp.ok) return <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{sp.ok}</div>;
  return null;
}

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_LABELS[status] ?? { label: status, tone: "bg-zinc-100 text-zinc-700" };
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${s.tone}`}>{s.label}</span>;
}

export function FraudBadge({ score, threshold }: { score: number; threshold: number }) {
  const tone = score >= threshold ? "text-red-700" : score >= threshold / 2 ? "text-amber-700" : "text-emerald-700";
  return <span className={`font-mono text-xs font-semibold ${tone}`}>{score}/100</span>;
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      {hint && <div className="mt-1 text-xs text-zinc-500">{hint}</div>}
    </div>
  );
}

export function PageTitle({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">{children}</div>;
}
