import { createPayoutRun, markPayoutPaid } from "@/app/actions/creator";
import { Empty, Flash } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { dateFr, euros, num } from "@/lib/format";
import { computePayouts } from "@/lib/payouts";
import { Submit } from "@/components/submit";

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ erreur?: string; ok?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { workspace } = await requireOwner(id);

  const [clips, members, runs] = await Promise.all([
    db.clip.findMany({ where: { workspaceId: id, status: { in: ["APPROVED", "PENDING"] }, membership: { status: "ACTIVE" } } }),
    db.membership.findMany({ where: { workspaceId: id }, include: { user: true } }),
    db.payoutRun.findMany({
      where: { workspaceId: id },
      include: { payouts: { include: { membership: { include: { user: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const byId = new Map(members.map((m) => [m.id, m]));
  const drafts = computePayouts(clips, workspace);
  const total = drafts.reduce((s, d) => s + d.amountCents, 0);
  const holding = clips.filter((c) => c.status === "PENDING" && Date.now() - c.createdAt.getTime() < workspace.holdDays * 86_400_000).length;

  return (
    <div className="space-y-6">
      <Flash sp={sp} />
      <div className="card">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-bold">Prochain paiement : {euros(total)}</h3>
            <p className="text-sm text-zinc-500">
              {euros(workspace.cpmCents)} / 1 000 vues · dès {num(workspace.minViews)} vues · max {euros(workspace.maxPayoutPerClipCents)} par clip.
              {holding > 0 && ` ${holding} clip(s) encore dans le délai de vérification de ${workspace.holdDays} j (sauf validation manuelle).`}
            </p>
          </div>
          <form action={createPayoutRun.bind(null, id)}>
            <Submit className="btn" disabled={drafts.length === 0}>Générer le lot de paiement</Submit>
          </form>
        </div>
        {drafts.length === 0 ? (
          <p className="text-sm text-zinc-500">Rien à payer pour l&apos;instant. Les clips suspects ne sont jamais inclus tant que tu ne les as pas validés.</p>
        ) : (
          <table className="table">
            <thead><tr><th>Clippeur</th><th className="text-right">Clips</th><th className="text-right">Nouvelles vues</th><th className="text-right">Montant</th><th>Coordonnées</th></tr></thead>
            <tbody>
              {drafts.map((d) => {
                const m = byId.get(d.membershipId);
                return (
                  <tr key={d.membershipId}>
                    <td>{m?.user.name}</td>
                    <td className="text-right">{d.lines.length}</td>
                    <td className="text-right font-mono">{num(d.views)}</td>
                    <td className="text-right font-semibold">{euros(d.amountCents)}</td>
                    <td className="text-xs">{m?.payoutMethod ? `${m.payoutMethod} ✓` : <span className="text-amber-700">À demander</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <h3 className="font-display text-xl font-bold">Historique</h3>
      {runs.length === 0 ? (
        <Empty>Aucun lot de paiement généré.</Empty>
      ) : (
        runs.map((r) => {
          const paid = r.payouts.filter((p) => p.status === "PAID").length;
          return (
            <div key={r.id} className={`card ${sp.ok && r === runs[0] ? "ring-2 ring-brand-500" : ""}`}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold">Lot du {dateFr(r.createdAt)} · {euros(r.totalCents)}</div>
                  <div className="text-xs text-zinc-500">{paid}/{r.payouts.length} virement(s) effectué(s)</div>
                </div>
                <a href={`/api/e/${id}/paiements/${r.id}/export`} className="btn-ghost">⬇ Export CSV</a>
              </div>
              <table className="table">
                <tbody>
                  {r.payouts.map((p) => (
                    <tr key={p.id}>
                      <td>{p.membership.user.name}</td>
                      <td className="font-mono text-xs">{p.membership.payoutMethod ? `${p.membership.payoutMethod} · ${p.membership.payoutDetails}` : "Coordonnées manquantes"}</td>
                      <td className="text-right font-semibold">{euros(p.amountCents)}</td>
                      <td className="text-right">
                        {p.status === "PAID" ? (
                          <span className="text-xs text-brand-700">Payé le {dateFr(p.paidAt)}</span>
                        ) : (
                          <form action={markPayoutPaid.bind(null, id, p.id)}><Submit className="btn-ghost">Marquer payé</Submit></form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })
      )}
    </div>
  );
}
