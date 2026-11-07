import Link from "next/link";
import { respondInvitation, withdrawApplication } from "@/app/actions/marketplace";
import { Empty, Flash, PageTitle } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { euros } from "@/lib/format";
import { Submit } from "@/components/submit";

export default async function Page({ searchParams }: { searchParams: Promise<{ erreur?: string; ok?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const [me, owned, memberships, invitations, applications] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: user.id }, include: { profile: true } }),
    db.workspace.findMany({
      where: { ownerId: user.id },
      include: { _count: { select: { memberships: { where: { status: "ACTIVE" } }, clips: { where: { status: "FLAGGED" } } } }, offer: { include: { _count: { select: { applications: { where: { status: "PENDING" } } } } } } },
      orderBy: { createdAt: "asc" },
    }),
    db.membership.findMany({ where: { userId: user.id, status: "ACTIVE" }, include: { workspace: true } }),
    db.invitation.findMany({ where: { userId: user.id, status: "PENDING" }, include: { workspace: { include: { owner: true } } } }),
    db.application.findMany({ where: { userId: user.id }, include: { offer: { include: { workspace: true } } }, orderBy: { createdAt: "desc" } }),
  ]);
  const isClipper = me.role === "CLIPPER";

  const creatorSection = (
    <section key="creator">
      <PageTitle title="Mes équipes" subtitle="Les produits pour lesquels tu fais travailler des clippeurs.">
        <Link href="/app/nouvelle-equipe" className="btn">+ Nouvelle équipe</Link>
      </PageTitle>
      {owned.length === 0 ? (
        <Empty>Tu n&apos;as pas encore d&apos;équipe. <Link href="/app/nouvelle-equipe" className="font-semibold underline">Crée la première</Link>, publie ton annonce et invite tes clippeurs.</Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {owned.map((w) => (
            <Link key={w.id} href={`/app/e/${w.id}`} className="card transition hover:-translate-y-0.5">
              <div className="font-display text-lg font-bold">{w.name}</div>
              <div className="mt-1 text-sm text-zinc-500">{w._count.memberships} clippeur(s) · {euros(w.cpmCents)} / 1 000 vues</div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {w._count.clips > 0 && <span className="rounded-full bg-[#fff1f0] px-2 py-0.5 font-semibold text-coral">{w._count.clips} suspect(s)</span>}
                {(w.offer?._count.applications ?? 0) > 0 && <span className="rounded-full bg-brand-100 px-2 py-0.5 font-semibold text-brand-700">{w.offer!._count.applications} candidature(s)</span>}
                {!w.offer && <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-600">Pas d&apos;annonce publiée</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );

  const clipperSection = (
    <section key="clipper" className="space-y-6">
      <PageTitle title="Espace clippeur" subtitle="Tes équipes, tes invitations et tes candidatures.">
        <div className="flex gap-2">
          <Link href="/app/comptes" className="btn-ghost">Comptes connectés</Link>
          <Link href="/app/profil" className="btn-ghost">{me.profile ? "Mon annonce" : "Créer mon annonce"}</Link>
          <Link href="/offres" className="btn">Trouver des missions</Link>
        </div>
      </PageTitle>
      {!me.profile && (
        <div className="rounded-2xl bg-ink p-5 text-paper">
          <div className="font-display text-lg font-bold">Crée ton annonce pour être trouvé</div>
          <p className="mt-1 text-sm text-paper/70">Les créateurs parcourent l&apos;annuaire et invitent directement les clippeurs qui leur plaisent.</p>
          <Link href="/app/profil" className="btn mt-3">Créer mon annonce</Link>
        </div>
      )}
      {invitations.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-lg font-bold">Invitations reçues</h2>
          {invitations.map((i) => (
            <div key={i.id} className="card flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-semibold">{i.workspace.name} <span className="font-normal text-zinc-500">· {i.workspace.owner.name}</span></div>
                <p className="text-sm text-zinc-600">{i.message}</p>
                <p className="text-xs text-zinc-500">{euros(i.workspace.cpmCents)} / 1 000 vues · max {euros(i.workspace.maxPayoutPerClipCents)} par clip</p>
              </div>
              <div className="flex gap-2">
                <form action={respondInvitation.bind(null, i.id, true)}><Submit className="btn">Rejoindre</Submit></form>
                <form action={respondInvitation.bind(null, i.id, false)}><Submit className="btn-ghost">Décliner</Submit></form>
              </div>
            </div>
          ))}
        </div>
      )}
      <div>
        <h2 className="mb-3 font-display text-lg font-bold">Je clippe pour</h2>
        {memberships.length === 0 ? (
          <Empty>Aucune équipe pour l&apos;instant. <Link href="/offres" className="font-semibold underline">Postule à une annonce</Link> ou attends une invitation.</Empty>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {memberships.map((m) => (
              <Link key={m.id} href={`/app/c/${m.workspaceId}`} className="card transition hover:-translate-y-0.5">
                <div className="font-display text-lg font-bold">{m.workspace.name}</div>
                <div className="mt-1 text-sm text-zinc-500">{euros(m.workspace.cpmCents)} / 1 000 vues</div>
              </Link>
            ))}
          </div>
        )}
      </div>
      {applications.length > 0 && (
        <div>
          <h2 className="mb-3 font-display text-lg font-bold">Mes candidatures</h2>
          <div className="card divide-y divide-zinc-100 p-0">
            {applications.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <Link href={`/offres/${a.offerId}`} className="font-medium hover:underline">{a.offer.workspace.name} — {a.offer.title}</Link>
                <div className="flex items-center gap-3">
                  <span className={a.status === "ACCEPTED" ? "text-ok" : "text-zinc-500"}>{{ PENDING: "En attente", ACCEPTED: "✓ Acceptée", REJECTED: "Non retenue" }[a.status]}</span>
                  {a.status === "PENDING" && <form action={withdrawApplication.bind(null, a.id)}><Submit className="text-xs text-zinc-500 underline">Retirer</Submit></form>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );

  const hasClipperActivity = memberships.length + invitations.length + applications.length > 0 || !!me.profile;
  return (
    <div className="space-y-12">
      <Flash sp={sp} />
      {isClipper ? [clipperSection, owned.length > 0 && creatorSection] : [creatorSection, hasClipperActivity && clipperSection]}
    </div>
  );
}
