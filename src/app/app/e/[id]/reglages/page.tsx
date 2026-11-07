import { updateSettings } from "@/app/actions/creator";
import { Flash } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { planOf } from "@/lib/config";

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ erreur?: string; ok?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { workspace: w } = await requireOwner(id);
  const eur = (c: number) => (c / 100).toString().replace(".", ",");

  return (
    <div className="max-w-2xl">
      <Flash sp={sp} />
      <form action={updateSettings.bind(null, id)} className="space-y-6">
        <div className="card space-y-4">
          <h3 className="font-display text-lg font-bold">Produit</h3>
          <div><label className="label">Nom</label><input name="name" defaultValue={w.name} className="input" /></div>
          <div>
            <label className="label">URL du produit</label>
            <input name="productUrl" defaultValue={w.productUrl ?? ""} placeholder="https://monsaas.fr" className="input" />
            <p className="mt-1 text-xs text-zinc-500">Chaque clippeur reçoit un lien traqué qui redirige ici (avec utm_source=clipsquad&amp;utm_content=&lt;clippeur&gt;).</p>
          </div>
        </div>

        <div className="card grid gap-4 sm:grid-cols-2">
          <h3 className="font-semibold sm:col-span-2">Rémunération</h3>
          <Field name="cpm" label="€ pour 1 000 vues" value={eur(w.cpmCents)} />
          <Field name="minViews" label="Vues minimum pour être payé" value={String(w.minViews)} />
          <Field name="maxPayout" label="Plafond par clip (€)" value={eur(w.maxPayoutPerClipCents)} />
          <Field name="holdDays" label="Délai de vérification (jours)" value={String(w.holdDays)} hint="Un clip non signalé est payable après ce délai." />
        </div>

        <div className="card space-y-2">
          <h3 className="font-display text-lg font-bold">Anti-fraude</h3>
          <Field name="fraudThreshold" label="Score de mise en quarantaine (10 à 100)" value={String(w.fraudThreshold)} hint="Plus il est bas, plus l'anti-fraude est strict. 50 est un bon point de départ." />
        </div>

        <div className="card text-sm text-zinc-600">
          Abonnement : <strong>{planOf(w.plan).label}</strong> ({planOf(w.plan).priceEur} €/mois). La gestion de l&apos;abonnement arrive avec Stripe Billing.
        </div>

        <button className="btn">Enregistrer</button>
      </form>
    </div>
  );
}

function Field({ name, label, value, hint }: { name: string; label: string; value: string; hint?: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input name={name} defaultValue={value} inputMode="decimal" className="input" />
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}
