import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Empty, PageTitle } from "@/components/ui";

export default async function Page() {
  const user = await requireUser();
  const [owned, memberships] = await Promise.all([
    db.workspace.findMany({ where: { ownerId: user.id }, include: { _count: { select: { memberships: true, clips: true } } }, orderBy: { createdAt: "asc" } }),
    db.membership.findMany({ where: { userId: user.id, status: "ACTIVE" }, include: { workspace: true } }),
  ]);

  return (
    <div className="space-y-10">
      <section>
        <PageTitle title="Mes équipes" subtitle="Les produits pour lesquels tu fais travailler des clippeurs.">
          <Link href="/app/nouvelle-equipe" className="btn">+ Nouvelle équipe</Link>
        </PageTitle>
        {owned.length === 0 ? (
          <Empty>Tu n&apos;as pas encore d&apos;équipe. <Link href="/app/nouvelle-equipe" className="text-brand-600">Crée la première</Link> pour inviter tes clippeurs.</Empty>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {owned.map((w) => (
              <Link key={w.id} href={`/app/e/${w.id}`} className="card transition hover:border-brand-500">
                <div className="font-semibold">{w.name}</div>
                <div className="mt-1 text-sm text-zinc-500">{w._count.memberships} clippeur(s) · {w._count.clips} clip(s)</div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {memberships.length > 0 && (
        <section>
          <PageTitle title="Je clippe pour" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {memberships.map((m) => (
              <Link key={m.id} href={`/app/c/${m.workspaceId}`} className="card transition hover:border-brand-500">
                <div className="font-semibold">{m.workspace.name}</div>
                <div className="mt-1 text-sm text-zinc-500">Espace clippeur</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
