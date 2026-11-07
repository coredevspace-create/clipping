import { addConversions, regenerateInvite, removeMember } from "@/app/actions/creator";
import { Avatar } from "@/components/market";
import { Submit } from "@/components/submit";
import { Empty, Flash } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { appUrl, planOf } from "@/lib/config";
import { db } from "@/lib/db";
import { compact, euros } from "@/lib/format";
import { clipEarnings, computePayouts } from "@/lib/payouts";
import { CONVERSION_KINDS, costPer, productOf } from "@/lib/product";

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ erreur?: string; ok?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { workspace } = await requireOwner(id);
  const since = new Date(Date.now() - 30 * 86_400_000);
  const members = await db.membership.findMany({
    where: { workspaceId: id, status: "ACTIVE" },
    include: {
      user: true,
      clips: true,
      clicks: { where: { createdAt: { gte: since } }, select: { device: true } },
      conversions: { select: { quantity: true, kind: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  const plan = planOf(workspace.plan);
  const product = productOf(workspace.productType);
  const invite = `${appUrl()}/rejoindre/${workspace.inviteCode}`;
  const hasLinks = !!(workspace.productUrl || workspace.appStoreUrl || workspace.playStoreUrl);

  const rows = members.map((m) => {
    const valid = m.clips.filter((c) => c.status !== "REJECTED");
    const earned = valid.reduce((s, c) => s + clipEarnings(c.views, workspace), 0);
    const conversions = m.conversions.reduce((s, c) => s + c.quantity, 0);
    const clicks = { IOS: 0, ANDROID: 0, DESKTOP: 0 } as Record<string, number>;
    for (const c of m.clicks) clicks[c.device ?? "DESKTOP"] = (clicks[c.device ?? "DESKTOP"] ?? 0) + 1;
    return {
      m,
      clipCount: valid.length,
      views: valid.reduce((s, c) => s + c.views, 0),
      flagged: m.clips.filter((c) => c.status === "FLAGGED").length,
      due: computePayouts(m.clips.filter((c) => c.status === "APPROVED" || c.status === "PENDING"), workspace)[0]?.amountCents ?? 0,
      earned,
      conversions,
      cpa: costPer(earned, conversions),
      clicks,
    };
  });
  const totalConv = rows.reduce((s, r) => s + r.conversions, 0);
  const totalEarned = rows.reduce((s, r) => s + r.earned, 0);
  const best = rows.filter((r) => r.cpa !== null).sort((a, b) => a.cpa! - b.cpa!)[0];

  return (
    <div className="space-y-6">
      <Flash sp={sp} />
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="card">
          <h3 className="font-display text-lg font-bold">Lien d&apos;invitation</h3>
          <p className="mb-3 text-sm text-zinc-500">
            Partage-le sur ton Discord ou en message privé. {members.length}/{Number.isFinite(plan.maxClippers) ? plan.maxClippers : "∞"} clippeurs (offre {plan.label}).
          </p>
          <div className="flex flex-wrap gap-2">
            <input readOnly value={invite} className="input flex-1 font-mono" />
            <form action={regenerateInvite.bind(null, id)}><Submit className="btn-ghost">Régénérer</Submit></form>
          </div>
        </div>
        <div className="card bg-ink text-paper">
          <div className="eyebrow text-lime">Coût par {product.conversion}</div>
          <div className="mt-2 font-display text-4xl font-extrabold">{costPer(totalEarned, totalConv) !== null ? euros(costPer(totalEarned, totalConv)!) : "—"}</div>
          <p className="mt-1 text-sm text-paper/70">
            {totalConv > 0 ? `${totalConv.toLocaleString("fr-FR")} ${product.conversions} attribués aux clippeurs.` : `Ajoute tes ${product.conversions} par clippeur pour voir qui est rentable.`}
            {best && ` Meilleur : ${best.m.user.name} (${euros(best.cpa!)}).`}
          </p>
        </div>
      </div>

      {members.length === 0 ? (
        <Empty>Aucun clippeur pour l&apos;instant. Envoie le lien d&apos;invitation ou publie ton annonce dans « Annonce &amp; recrutement ».</Empty>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="table">
            <thead>
              <tr>
                <th>Clippeur</th>
                <th className="text-right">Vues</th>
                <th className="text-right" title="Clics uniques sur son lien, 30 derniers jours">Clics 30 j</th>
                <th className="text-right">{product.conversions}</th>
                <th className="text-right">Coût / {product.conversion}</th>
                <th className="text-right">À payer</th>
                <th>Ajouter des conversions</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.m.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={r.m.user.name} size={32} />
                      <div>
                        <div className="font-medium">{r.m.user.name}</div>
                        <div className="text-xs text-zinc-500">
                          {r.clipCount} clip(s){r.flagged > 0 && <span className="text-coral"> · {r.flagged} suspect(s)</span>}
                          {" · "}{r.m.payoutMethod ? `${r.m.payoutMethod} ✓` : <span className="text-amber-700">paiement non renseigné</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="text-right font-mono">{compact(r.views)}</td>
                  <td className="text-right font-mono text-xs" title={`iPhone ${r.clicks.IOS} · Android ${r.clicks.ANDROID} · Ordinateur ${r.clicks.DESKTOP}`}>
                    {hasLinks ? (
                      <>
                        <div className="text-sm text-ink">{r.clicks.IOS + r.clicks.ANDROID + r.clicks.DESKTOP}</div>
                        <div className="whitespace-nowrap text-zinc-500">📱{r.clicks.IOS} 🤖{r.clicks.ANDROID} 💻{r.clicks.DESKTOP}</div>
                      </>
                    ) : "—"}
                  </td>
                  <td className="text-right font-display text-lg font-bold">{r.conversions.toLocaleString("fr-FR")}</td>
                  <td className="text-right font-semibold">{r.cpa !== null ? euros(r.cpa) : "—"}</td>
                  <td className="text-right font-semibold">{euros(r.due)}</td>
                  <td>
                    <form action={addConversions.bind(null, id, r.m.id)} className="flex items-center gap-1.5 whitespace-nowrap">
                      <input name="quantity" required inputMode="numeric" placeholder="Nb" className="input w-20 py-1.5" />
                      <select name="kind" defaultValue={product.kind} className="input w-44 py-1.5">
                        {Object.entries(CONVERSION_KINDS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                      </select>
                      <Submit className="btn-ghost px-3 py-1.5">+</Submit>
                    </form>
                  </td>
                  <td className="text-right">
                    <form action={removeMember.bind(null, id, r.m.id)}><Submit className="btn-danger px-3 py-1.5 text-xs">Retirer</Submit></form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-sm text-zinc-500">
        Coût par {product.conversion} = ce que le clippeur a gagné ÷ ses {product.conversions}. Les conversions arrivent automatiquement par l&apos;URL de conversion
        (voir Réglages) ou se saisissent ici depuis App Store Connect et la Play Console.
        {!hasLinks && " Renseigne les liens de ton produit dans les Réglages pour activer les liens intelligents."}
      </p>
    </div>
  );
}
