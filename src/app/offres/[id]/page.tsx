import Link from "next/link";
import { notFound } from "next/navigation";
import { applyToOffer } from "@/app/actions/marketplace";
import { Chips, PayTerms, platformChips } from "@/components/market";
import { Flash } from "@/components/ui";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { dateFr } from "@/lib/format";
import { productOf } from "@/lib/product";
import { Submit } from "@/components/submit";

const APP_STATUS: Record<string, string> = {
  PENDING: "Candidature envoyée : en attente de réponse du créateur.",
  ACCEPTED: "Candidature acceptée : tu fais partie de l'équipe !",
  REJECTED: "Le créateur n'a pas retenu ta candidature.",
};

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ erreur?: string; ok?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const offer = await db.offer.findUnique({ where: { id }, include: { workspace: { include: { owner: true } } } });
  if (!offer) notFound();
  const user = await currentUser();
  const ws = offer.workspace;
  const [application, membership] = user
    ? await Promise.all([
        db.application.findUnique({ where: { offerId_userId: { offerId: id, userId: user.id } } }),
        db.membership.findUnique({ where: { workspaceId_userId: { workspaceId: ws.id, userId: user.id } } }),
      ])
    : [null, null];
  const isOwner = user?.id === ws.ownerId;
  const next = encodeURIComponent(`/offres/${id}`);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/offres" className="text-sm text-zinc-500 hover:underline">← Toutes les missions</Link>
      <Flash sp={sp} />
      <div className="card space-y-4">
        <div>
          <div className="text-sm text-zinc-500">{ws.name} · publié par {ws.owner.name} · mis à jour le {dateFr(offer.updatedAt)}</div>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-[-0.03em]">{offer.title}</h1>
          {offer.status !== "OPEN" && <p className="mt-1 text-sm font-medium text-amber-700">Cette annonce est fermée aux candidatures.</p>}
        </div>
        <div className="flex flex-wrap gap-2"><Chips items={[offer.niche]} tone="brand" /><Chips items={platformChips(offer.platforms)} /></div>
        <PayTerms cpmCents={ws.cpmCents} minViews={ws.minViews} maxCents={ws.maxPayoutPerClipCents} />
        <p className="whitespace-pre-line text-sm text-zinc-700">{offer.description}</p>
        {offer.requirements && (
          <div>
            <h2 className="mb-1 text-sm font-semibold">Consignes</h2>
            <p className="whitespace-pre-line text-sm text-zinc-700">{offer.requirements}</p>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-ink px-3 py-1 font-semibold text-lime">{productOf(ws.productType).label}</span>
          {ws.appStoreUrl && <a href={ws.appStoreUrl} target="_blank" rel="noreferrer" className="btn-ghost py-1"> App Store ↗</a>}
          {ws.playStoreUrl && <a href={ws.playStoreUrl} target="_blank" rel="noreferrer" className="btn-ghost py-1">▶ Play Store ↗</a>}
          {ws.productUrl && <a href={ws.productUrl} target="_blank" rel="noreferrer" className="btn-ghost py-1">Site ↗</a>}
        </div>
        <p className="text-xs text-zinc-500">Paiement après {ws.holdDays} jours de vérification anti-fraude. Les vues achetées entraînent le refus du clip.</p>
      </div>

      <div className="card">
        {isOwner ? (
          <p className="text-sm">C&apos;est ton annonce. <Link href={`/app/e/${ws.id}/annonce`} className="text-brand-700 hover:underline">Gérer les candidatures →</Link></p>
        ) : membership?.status === "ACTIVE" ? (
          <p className="text-sm">Tu fais partie de cette équipe. <Link href={`/app/c/${ws.id}`} className="text-brand-700 hover:underline">Aller à mon espace clippeur →</Link></p>
        ) : application ? (
          <p className="text-sm">{APP_STATUS[application.status]}</p>
        ) : offer.status !== "OPEN" ? (
          <p className="text-sm text-zinc-500">Les candidatures sont fermées.</p>
        ) : !user ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm">Crée ton compte clippeur pour postuler.</p>
            <Link href={`/inscription?role=clippeur&next=${next}`} className="btn">Créer mon compte clippeur</Link>
            <Link href={`/connexion?next=${next}`} className="btn-ghost">J&apos;ai un compte</Link>
          </div>
        ) : (
          <form action={applyToOffer.bind(null, id)} className="space-y-3">
            <h2 className="font-display text-lg font-bold">Postuler</h2>
            <textarea name="message" required minLength={20} rows={5} className="input" placeholder="Présente-toi : ton expérience, tes comptes, des exemples de clips, pourquoi ce produit te parle…" />
            <p className="text-xs text-zinc-500">Le créateur verra aussi ton annonce et tes statistiques vérifiées sur la plateforme.</p>
            <Submit className="btn">Envoyer ma candidature</Submit>
          </form>
        )}
      </div>
    </div>
  );
}
