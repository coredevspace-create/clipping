import Link from "next/link";
import { decideApplication, saveOffer } from "@/app/actions/marketplace";
import { Chips, platformChips, ReputationLine } from "@/components/market";
import { Empty, Flash } from "@/components/ui";
import { BriefTemplates } from "@/components/brief-templates";
import { requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { dateFr } from "@/lib/format";
import { NICHES, platformLabel, PLATFORMS, reputations, splitCsv } from "@/lib/marketplace";
import { Submit } from "@/components/submit";

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ erreur?: string; ok?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { workspace } = await requireOwner(id);
  const offer = await db.offer.findUnique({
    where: { workspaceId: id },
    include: { applications: { include: { user: { include: { profile: true } } }, orderBy: { createdAt: "desc" } } },
  });
  const invitations = await db.invitation.findMany({ where: { workspaceId: id }, include: { user: true }, orderBy: { createdAt: "desc" } });
  const apps = offer?.applications ?? [];
  const reps = await reputations(apps.map((a) => a.userId));
  const platforms = splitCsv(offer?.platforms);
  const pending = apps.filter((a) => a.status === "PENDING");

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <Flash sp={sp} />
        <div>
          <h2 className="mb-3 font-display text-xl font-bold">Candidatures {pending.length > 0 && <span className="ml-1 rounded-full bg-lime px-2 py-0.5 text-sm text-ink">{pending.length}</span>}</h2>
          {apps.length === 0 ? (
            <Empty>{offer?.status === "OPEN" ? "Pas encore de candidature. Ton annonce est visible sur la page Missions." : "Publie ton annonce pour recevoir des candidatures."}</Empty>
          ) : (
            <div className="space-y-3">
              {apps.map((a) => (
                <div key={a.id} className="card space-y-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold">{a.user.name}</div>
                      {a.user.profile && <div className="text-sm text-zinc-600">{a.user.profile.headline}</div>}
                      <ReputationLine r={reps.get(a.userId)!} />
                    </div>
                    <span className="font-mono text-xs text-zinc-500">{dateFr(a.createdAt)}</span>
                  </div>
                  <p className="whitespace-pre-line text-sm text-zinc-700">{a.message}</p>
                  {a.user.profile && <Chips items={platformChips(a.user.profile.platforms)} />}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {a.user.profile && <Link href={`/clippeurs/${a.userId}`} className="btn-ghost">Voir son annonce</Link>}
                    {a.status === "PENDING" ? (
                      <>
                        <form action={decideApplication.bind(null, id, a.id, true)}><Submit className="btn">Accepter dans l&apos;équipe</Submit></form>
                        <form action={decideApplication.bind(null, id, a.id, false)}><Submit className="btn-danger">Refuser</Submit></form>
                      </>
                    ) : (
                      <span className={`text-sm font-medium ${a.status === "ACCEPTED" ? "text-brand-700" : "text-zinc-500"}`}>{a.status === "ACCEPTED" ? "✓ Acceptée" : "Refusée"}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {invitations.length > 0 && (
          <div>
            <h2 className="mb-3 font-display text-xl font-bold">Invitations envoyées</h2>
            <div className="card divide-y divide-zinc-100 p-0">
              {invitations.map((i) => (
                <div key={i.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <Link href={`/clippeurs/${i.userId}`} className="font-medium hover:underline">{i.user.name}</Link>
                  <span className="text-zinc-500">{{ PENDING: "En attente", ACCEPTED: "✓ Acceptée", DECLINED: "Déclinée" }[i.status]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <Link href="/clippeurs" className="btn-ghost">Parcourir l&apos;annuaire des clippeurs →</Link>
      </div>

      <form action={saveOffer.bind(null, id)} className="card h-fit space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Mon annonce</h2>
          {offer && <Link href={`/offres/${offer.id}`} className="text-sm text-brand-700 hover:underline">Voir en public →</Link>}
        </div>
        <div><label className="label">Titre</label><input name="title" required maxLength={90} defaultValue={offer?.title ?? `Clippeurs recherchés pour ${workspace.name}`} className="input" /></div>
        <div>
          <label className="label">Catégorie</label>
          <select name="niche" defaultValue={offer?.niche ?? (workspace.productType === "WEB" ? "SaaS web" : workspace.productType === "GAME" ? "Jeu mobile" : workspace.productType === "DESKTOP" ? "Logiciel" : workspace.productType === "EXTENSION" ? "Extension navigateur" : "App mobile")} className="input">{NICHES.map((n) => <option key={n}>{n}</option>)}</select>
        </div>
        <fieldset>
          <legend className="label">Plateformes</legend>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <label key={p} className="cursor-pointer rounded-full border border-zinc-300 px-3 py-1 text-sm has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-lime">
                <input type="checkbox" name="platforms" value={p} defaultChecked={offer ? platforms.includes(p) : p !== "X"} className="sr-only" />
                {platformLabel(p)}
              </label>
            ))}
          </div>
        </fieldset>
        <div><label className="label">Description</label><textarea name="description" required rows={6} defaultValue={offer?.description} className="input" placeholder="Ton app en une phrase, ta cible (âge, centres d'intérêt), le ton des clips, ce qui fait un bon clip pour toi…" /></div>
        <div>
          <label className="label">Consignes pour les clippeurs</label>
          <textarea name="requirements" rows={7} defaultValue={offer?.requirements ?? ""} className="input text-xs" placeholder="Choisis un modèle ci-dessous ou écris tes consignes : format, durée, hook, mention de l'app…" />
          <div className="mt-2"><BriefTemplates /></div>
        </div>
        <p className="text-xs text-zinc-500">La rémunération affichée vient de tes réglages ({(workspace.cpmCents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })} / 1 000 vues).</p>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="open" defaultChecked={offer ? offer.status === "OPEN" : true} className="h-4 w-4" />
          Annonce ouverte aux candidatures
        </label>
        <Submit className="btn w-full">{offer ? "Mettre à jour" : "Publier l'annonce"}</Submit>
      </form>
    </div>
  );
}
