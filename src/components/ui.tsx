import { STATUS_LABELS } from "@/lib/format";

export function Flash({ sp }: { sp: { erreur?: string; ok?: string } }) {
  if (sp.erreur)
    return (
      <div role="alert" className="flash-err mb-5 flex items-center gap-3 rounded-2xl bg-[#fff1f0] px-4 py-3 text-sm font-medium text-ink">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-coral text-xs font-bold text-white">!</span>
        {sp.erreur}
      </div>
    );
  if (sp.ok)
    return (
      <div role="status" className="flash-ok mb-5 flex items-center gap-3 rounded-2xl bg-[#e3f5e8] px-4 py-3 text-sm font-medium text-ink">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ok text-xs font-bold text-white">✓</span>
        {sp.ok}
      </div>
    );
  return null;
}

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_LABELS[status] ?? { label: status, tone: "bg-zinc-100 text-zinc-600" };
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.tone}`}>{s.label}</span>;
}

export function FraudBadge({ score, threshold }: { score: number; threshold: number }) {
  const tone = score >= threshold ? "bg-coral" : score >= threshold / 2 ? "bg-[#ff9f0a]" : "bg-lime";
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold tabular-nums">
      <span className="relative h-1.5 w-12 overflow-hidden rounded-full bg-zinc-200"><span className={`absolute inset-y-0 left-0 rounded-full ${tone}`} style={{ width: `${Math.max(score, 4)}%` }} /></span>
      {score}
    </span>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card">
      <div className="text-[13px] font-medium text-zinc-500">{label}</div>
      <div className="mt-1 text-[26px] font-bold leading-tight tracking-[-0.03em] tabular-nums sm:text-[32px]">{value}</div>
      {hint && <div className="mt-0.5 text-[13px] text-zinc-500">{hint}</div>}
    </div>
  );
}

export function PageTitle({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[34px] font-bold leading-tight tracking-[-0.035em] sm:text-[40px]">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-[17px] text-zinc-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[20px] bg-white p-10 text-center text-[15px] text-zinc-500">{children}</div>;
}
