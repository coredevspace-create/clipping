import { compact, euros, num } from "@/lib/format";
import { platformLabel, type Reputation } from "@/lib/marketplace";

export function Chips({ items, tone = "zinc" }: { items: string[]; tone?: "zinc" | "brand" }) {
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((i) => (
        <span key={i} className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone === "brand" ? "bg-brand-100 text-brand-700" : "bg-zinc-100 text-zinc-600"}`}>
          {i}
        </span>
      ))}
    </div>
  );
}

export const platformChips = (csv: string) => csv.split(",").filter(Boolean).map(platformLabel);

export function ReputationLine({ r }: { r: Reputation }) {
  if (r.validatedClips === 0) return <p className="text-xs text-zinc-500">Nouveau sur la plateforme : pas encore de clips vérifiés.</p>;
  return (
    <p className="text-xs text-zinc-600">
      <span className="font-semibold text-ok">✓ Vérifié</span> · {num(r.validatedClips)} clip(s) validé(s) · {compact(r.verifiedViews)} vues vérifiées
      {r.refusedRate !== null && ` · ${Math.round(r.refusedRate * 100)} % de refus`} · {r.teams} équipe(s)
    </p>
  );
}

export function PayTerms({ cpmCents, minViews, maxCents }: { cpmCents: number; minViews: number; maxCents: number }) {
  return (
    <div className="grid grid-cols-3 gap-2 text-center text-sm">
      <div className="rounded-lg bg-zinc-50 p-2"><div className="font-bold">{euros(cpmCents)}</div><div className="text-xs text-zinc-500">/ 1 000 vues</div></div>
      <div className="rounded-lg bg-zinc-50 p-2"><div className="font-bold">{num(minViews)}</div><div className="text-xs text-zinc-500">vues min.</div></div>
      <div className="rounded-lg bg-zinc-50 p-2"><div className="font-bold">{euros(maxCents)}</div><div className="text-xs text-zinc-500">max / clip</div></div>
    </div>
  );
}

export function FilterBar({ action, q, value, options, name, platform }: { action: string; q?: string; value?: string; options: readonly string[]; name: string; platform?: string }) {
  return (
    <form action={action} className="mb-6 grid gap-2 sm:grid-cols-[1fr_220px_200px_auto]">
      <input name="q" defaultValue={q} placeholder="Rechercher…" className="input" />
      <select name={name} defaultValue={value ?? ""} className="input">
        <option value="">Toutes les niches</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <select name="plateforme" defaultValue={platform ?? ""} className="input">
        <option value="">Toutes les plateformes</option>
        {["YOUTUBE", "TIKTOK", "INSTAGRAM", "X"].map((p) => <option key={p} value={p}>{platformLabel(p)}</option>)}
      </select>
      <button className="btn">Filtrer</button>
    </form>
  );
}

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = (name.match(/\p{L}+/gu) ?? ["?"]).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <span className="grid shrink-0 place-items-center rounded-full bg-gradient-to-b from-[#a1a1a6] to-[#8e8e93] font-semibold text-white" style={{ width: size, height: size, fontSize: size / 2.6 }}>
      {initials}
    </span>
  );
}
