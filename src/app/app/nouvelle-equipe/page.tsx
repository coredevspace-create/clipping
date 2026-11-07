import { createWorkspace } from "@/app/actions/creator";
import { Flash, PageTitle } from "@/components/ui";
import { requireUser } from "@/lib/auth";

export default async function Page({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  await requireUser();
  const sp = await searchParams;
  return (
    <div className="mx-auto max-w-lg">
      <PageTitle title="Nouvelle équipe" subtitle="Une équipe = un produit que tes clippeurs vont promouvoir." />
      <Flash sp={sp} />
      <form action={createWorkspace} className="card space-y-4">
        <div><label className="label">Nom du produit</label><input name="name" required placeholder="Ex. MonSaaS" className="input" /></div>
        <div>
          <label className="label">URL du produit (pour les liens traqués)</label>
          <input name="productUrl" type="url" placeholder="https://monsaas.fr" className="input" />
        </div>
        <div>
          <label className="label">Rémunération pour 1 000 vues (€)</label>
          <input name="cpm" defaultValue="1" inputMode="decimal" className="input" />
          <p className="mt-1 text-xs text-zinc-500">Modifiable plus tard, avec le seuil minimum, le plafond par clip et l&apos;anti-fraude.</p>
        </div>
        <button className="btn w-full">Créer l&apos;équipe</button>
      </form>
    </div>
  );
}
