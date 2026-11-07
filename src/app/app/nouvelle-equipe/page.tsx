import { createWorkspace } from "@/app/actions/creator";
import { Flash, PageTitle } from "@/components/ui";
import { ProductFields } from "@/components/product-fields";
import { requireUser } from "@/lib/auth";
import { Submit } from "@/components/submit";

export default async function Page({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  await requireUser();
  const sp = await searchParams;
  return (
    <div className="mx-auto max-w-lg">
      <PageTitle title="Nouvelle équipe" subtitle="Une équipe = une app ou un logiciel que tes clippeurs vont faire connaître." />
      <Flash sp={sp} />
      <form action={createWorkspace} className="card space-y-4">
        <div><label className="label">Nom du produit</label><input name="name" required placeholder="Ex. Budgie — l'app de budget" className="input" /></div>
        <ProductFields />
        <div>
          <label className="label">Rémunération pour 1 000 vues (€)</label>
          <input name="cpm" defaultValue="1" inputMode="decimal" className="input" />
          <p className="mt-1 text-xs text-zinc-500">Modifiable plus tard, avec le seuil minimum, le plafond par clip et l&apos;anti-fraude.</p>
        </div>
        <Submit className="btn w-full">Créer l&apos;équipe</Submit>
      </form>
    </div>
  );
}
