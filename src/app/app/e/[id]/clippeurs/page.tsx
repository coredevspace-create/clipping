import { regenerateInvite, removeMember } from "@/app/actions/creator";
import { Empty, Flash } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { appUrl, planOf } from "@/lib/config";
import { db } from "@/lib/db";
import { euros, num } from "@/lib/format";
import { computePayouts } from "@/lib/payouts";

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ erreur?: string; ok?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { workspace } = await requireOwner(id);
  const since = new Date(Date.now() - 30 * 86_400_000);
  const members = await db.membership.findMany({
    where: { workspaceId: id, status: "ACTIVE" },
    include: { user: true, clips: true, _count: { select: { clicks: { where: { createdAt: { gte: since } } } } } },
    orderBy: { createdAt: "asc" },
  });
  const plan = planOf(workspace.plan);
  const invite = `${appUrl()}/rejoindre/${workspace.inviteCode}`;

  return (
    <div className="space-y-6">
      <Flash sp={sp} />
      <div className="card">
        <h3 className="font-display text-lg font-bold">Lien d&apos;invitation</h3>
        <p className="mb-3 text-sm text-zinc-500">
          Partage-le sur ton Discord, ton Telegram ou en message privé. {members.length}/{Number.isFinite(plan.maxClippers) ? plan.maxClippers : "∞"} clippeurs (offre {plan.label}).
        </p>
        <div className="flex flex-wrap gap-2">
          <input readOnly value={invite} className="input flex-1 font-mono" />
          <form action={regenerateInvite.bind(null, id)}><button className="btn-ghost">Régénérer</button></form>
        </div>
      </div>

      {members.length === 0 ? (
        <Empty>Aucun clippeur pour l&apos;instant. Envoie le lien d&apos;invitation ci-dessus.</Empty>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="table">
            <thead>
              <tr><th>Clippeur</th><th className="text-right">Clips</th><th className="text-right">Vues</th><th className="text-right">Suspects</th><th className="text-right">Clics (30 j)</th><th className="text-right">À payer</th><th>Paiement</th><th /></tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const valid = m.clips.filter((c) => c.status !== "REJECTED");
                const due = computePayouts(m.clips.filter((c) => c.status === "APPROVED" || c.status === "PENDING"), workspace)[0]?.amountCents ?? 0;
                return (
                  <tr key={m.id}>
                    <td><div className="font-medium">{m.user.name}</div><div className="text-xs text-zinc-500">{m.user.email}</div></td>
                    <td className="text-right">{valid.length}</td>
                    <td className="text-right font-mono">{num(valid.reduce((s, c) => s + c.views, 0))}</td>
                    <td className="text-right">{m.clips.filter((c) => c.status === "FLAGGED").length || "—"}</td>
                    <td className="text-right">{workspace.productUrl ? m._count.clicks : "—"}</td>
                    <td className="text-right font-semibold">{euros(due)}</td>
                    <td className="text-xs">{m.payoutMethod ? <span className="text-brand-700">{m.payoutMethod} ✓</span> : <span className="text-amber-700">Non renseigné</span>}</td>
                    <td className="text-right">
                      <form action={removeMember.bind(null, id, m.id)}><button className="btn-danger">Retirer</button></form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {!workspace.productUrl && (
        <p className="text-sm text-zinc-500">Astuce : renseigne l&apos;URL de ton produit dans les réglages pour donner un lien traqué à chaque clippeur et mesurer les visites qu&apos;il t&apos;apporte.</p>
      )}
    </div>
  );
}
