import { regenerateConversionKey, updateSettings } from "@/app/actions/creator";
import { ProductFields } from "@/components/product-fields";
import { productOf } from "@/lib/product";
import { Flash } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { appUrl, planOf } from "@/lib/config";
import { Submit } from "@/components/submit";

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
          <ProductFields w={w} />
          <p className="text-xs text-zinc-500">Chaque clippeur reçoit un lien intelligent : iPhone → App Store, Android → Play Store, ordinateur → site.</p>
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
          <label className="flex items-start gap-3 pt-2 text-sm">
            <input type="checkbox" name="requireVerifiedAccounts" defaultChecked={w.requireVerifiedAccounts} className="mt-0.5 h-4 w-4" />
            <span>
              <strong>Refuser les clips non vérifiables</strong>
              <span className="block text-xs text-zinc-500">
                Par défaut, un clip n&apos;est accepté que si son code personnel est dans la description (YouTube, TikTok, X) ou si le compte est connecté.
                Cochée, cette option refuse aussi les clips dont la propriété ne peut pas être vérifiée (ex. Instagram sans compte connecté).
              </span>
            </span>
          </label>
        </div>

        <div className="card text-sm text-zinc-600">
          Abonnement : <strong>{planOf(w.plan).label}</strong> ({planOf(w.plan).priceEur} €/mois). La gestion de l&apos;abonnement arrive avec Stripe Billing.
        </div>

        <Submit className="btn">Enregistrer</Submit>
      </form>
      <ConversionSetup id={id} conversionKey={w.conversionKey} kind={productOf(w.productType).conversions} />
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

function ConversionSetup({ id, conversionKey, kind }: { id: string; conversionKey: string; kind: string }) {
  const endpoint = `${appUrl()}/api/conversion?key=${conversionKey}`;
  return (
    <div className="card mt-6 space-y-4">
      <div>
        <h3 className="font-display text-lg font-bold">Suivi des conversions</h3>
        <p className="mt-1 text-sm text-zinc-600">
          Pour savoir quel clippeur t&apos;apporte des {kind} et à quel prix. Deux façons de faire :
        </p>
      </div>
      <div className="space-y-2 text-sm">
        <h4 className="font-semibold">1. Automatique (SaaS, site web)</h4>
        <p className="text-zinc-600">
          Le visiteur arrive sur ton site avec <code>utm_content=CODE_DU_CLIPPEUR</code>. Garde ce code (cookie ou base de données) et, quand il s&apos;inscrit ou achète,
          appelle cette URL depuis ton serveur :
        </p>
        <pre className="overflow-x-auto rounded-xl bg-ink p-3 font-mono text-xs text-lime">{`${endpoint}&ref=CODE_DU_CLIPPEUR&type=signup&id=ID_UTILISATEUR`}</pre>
        <p className="text-xs text-zinc-500"><code>type</code> : signup, purchase ou install. <code>id</code> évite de compter deux fois le même utilisateur. Garde la clé secrète.</p>
      </div>
      <div className="space-y-1 text-sm">
        <h4 className="font-semibold">2. Manuel (apps mobiles)</h4>
        <p className="text-zinc-600">
          Lis les téléchargements par clippeur dans App Store Connect (campagnes « clipsquad-code ») ou la Play Console, puis ajoute-les dans l&apos;onglet <strong>Clippeurs</strong>.
        </p>
      </div>
      <form action={regenerateConversionKey.bind(null, id)}>
        <Submit className="btn-ghost">Générer une nouvelle clé</Submit>
      </form>
    </div>
  );
}
