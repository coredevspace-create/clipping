"use client";

import { useState } from "react";

const eur = (n: number) => n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

/** « Combien te coûtent les fausses vues ? » — hypothèses choisies par le visiteur, pas des statistiques. */
export function Calculator() {
  const [budget, setBudget] = useState(1500);
  const [fake, setFake] = useState(15);
  const [hours, setHours] = useState(4);
  const lostMonth = (budget * fake) / 100;
  const timeMonth = hours * 4.3;
  const plan = budget > 4000 ? 199 : 99;

  return (
    <div className="grid gap-8 rounded-[28px] border border-ink/10 bg-white p-6 sm:p-10 lg:grid-cols-[1.1fr_1fr]">
      <div className="space-y-8">
        <Slider label="Ce que tu verses à tes clippeurs chaque mois" value={eur(budget)} min={200} max={10000} step={100} v={budget} set={setBudget} />
        <Slider label="Part des vues que tu soupçonnes d'être gonflées" value={`${fake} %`} min={0} max={40} step={1} v={fake} set={setFake} />
        <Slider label="Heures par semaine passées sur Discord et le tableur" value={`${hours} h`} min={0} max={15} step={1} v={hours} set={setHours} />
        <p className="text-xs text-zinc-500">Ce sont tes propres hypothèses : bouge les curseurs selon ta situation.</p>
      </div>
      <div className="flex flex-col justify-between gap-6 rounded-2xl bg-ink p-6 text-paper sm:p-8">
        <div>
          <div className="eyebrow text-coral">● Ce que ça te coûte aujourd&apos;hui</div>
          <div className="mt-3 font-display text-5xl font-extrabold tabular-nums tracking-tight sm:text-6xl">{eur(lostMonth * 12)}</div>
          <div className="mt-1 text-paper/70">par an, versés pour des vues qui n&apos;ont jamais vu ton produit</div>
          <div className="mt-5 font-mono text-sm text-paper/80">+ {Math.round(timeMonth)} h par mois de copier-coller</div>
        </div>
        <div className="border-t border-paper/15 pt-5">
          <div className="eyebrow text-lime">✂ Avec l&apos;offre {plan === 99 ? "Pro" : "Agence"}</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold">{plan} €</span>
            <span className="text-paper/70">/ mois, sans commission</span>
          </div>
          {lostMonth > plan && (
            <p className="mt-2 text-sm text-lime">L&apos;abonnement est remboursé dès que l&apos;anti-fraude bloque {eur(plan)} de fausses vues par mois.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, v, set }: { label: string; value: string; min: number; max: number; step: number; v: number; set: (n: number) => void }) {
  return (
    <label className="block">
      <div className="mb-3 flex items-end justify-between gap-4">
        <span className="text-sm font-medium text-zinc-700">{label}</span>
        <span className="font-display text-2xl font-bold tabular-nums">{value}</span>
      </div>
      <input type="range" className="range w-full" min={min} max={max} step={step} value={v} onChange={(e) => set(Number(e.target.value))} />
    </label>
  );
}
