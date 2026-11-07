import Link from "next/link";
import { approveClip, refreshAllClips, rejectClip } from "@/app/actions/creator";
import { Empty, Flash, FraudBadge, Stat, StatusBadge } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { compact, dateFr, euros, num } from "@/lib/format";
import { computePayouts } from "@/lib/payouts";
import { PLATFORM_LABELS, type Platform } from "@/lib/platforms";
import { Submit } from "@/components/submit";

const FILTERS = [
  { key: "", label: "Tous" },
  { key: "FLAGGED", label: "Suspects" },
  { key: "PENDING", label: "En vérification" },
  { key: "APPROVED", label: "Validés" },
  { key: "REJECTED", label: "Refusés" },
];

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ statut?: string; erreur?: string; ok?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { workspace } = await requireOwner(id);
  const statut = FILTERS.some((f) => f.key === sp.statut) ? sp.statut : "";

  const [clips, all] = await Promise.all([
    db.clip.findMany({
      where: { workspaceId: id, ...(statut ? { status: statut } : {}) },
      include: { membership: { include: { user: true } } },
      orderBy: [{ fraudScore: "desc" }, { createdAt: "desc" }],
      take: 200,
    }),
    db.clip.findMany({ where: { workspaceId: id } }),
  ]);

  const totalViews = all.filter((c) => c.status !== "REJECTED").reduce((s, c) => s + c.views, 0);
  const flagged = all.filter((c) => c.status === "FLAGGED").length;
  const due = computePayouts(all.filter((c) => c.status === "APPROVED" || c.status === "PENDING"), workspace).reduce((s, d) => s + d.amountCents, 0);
  const paid = all.reduce((s, c) => s + c.paidCents, 0);

  return (
    <div>
      <Flash sp={sp} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Vues cumulées" value={compact(totalViews)} hint="Hors clips refusés" />
        <Stat label="Clips suspects" value={String(flagged)} hint="En quarantaine, non payés" />
        <Stat label="À payer" value={euros(due)} hint={`Après ${workspace.holdDays} j de vérification`} />
        <Stat label="Déjà versé" value={euros(paid)} />
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={f.key ? `?statut=${f.key}` : "?"}
              className={`rounded-full px-3 py-1 text-sm ${statut === f.key ? "bg-zinc-900 text-white" : "bg-white text-zinc-600 ring-1 ring-zinc-200"}`}
            >
              {f.label}
            </Link>
          ))}
        </div>
        <form action={refreshAllClips.bind(null, id)}>
          <Submit className="btn-ghost">↻ Actualiser les vues</Submit>
        </form>
      </div>

      {clips.length === 0 ? (
        <Empty>Aucun clip ici. Invite tes clippeurs depuis l&apos;onglet « Clippeurs ».</Empty>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="table">
            <thead>
              <tr><th>Clip</th><th>Clippeur</th><th className="text-right">Vues</th><th className="text-right">Engag.</th><th>Fraude</th><th>Statut</th><th /></tr>
            </thead>
            <tbody>
              {clips.map((c) => {
                const eng = c.views ? ((c.likes + c.comments + c.shares) / c.views) * 100 : 0;
                return (
                  <tr key={c.id} className={c.status === "FLAGGED" ? "bg-coral/5" : ""}>
                    <td>
                      <Link href={`/app/e/${id}/clips/${c.id}`} className="font-medium text-brand-700 hover:underline">
                        {PLATFORM_LABELS[c.platform as Platform]}
                      </Link>
                      <div className="text-xs text-zinc-500">
                        {dateFr(c.createdAt)}
                        {c.ownershipVerified === true && <span className="ml-2 font-semibold text-brand-700">✓ compte vérifié</span>}
                        {c.ownershipVerified === false && <span className="ml-2 font-semibold text-coral">✗ pas son compte</span>}
                      </div>
                    </td>
                    <td>{c.membership.user.name}</td>
                    <td className="text-right font-mono">{num(c.views)}</td>
                    <td className="text-right font-mono text-xs">{c.views ? `${eng.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %` : "—"}</td>
                    <td><FraudBadge score={c.fraudScore} threshold={workspace.fraudThreshold} /></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td className="whitespace-nowrap text-right">
                      {c.status !== "APPROVED" && (
                        <form action={approveClip.bind(null, id, c.id)} className="inline"><Submit className="btn-ghost mr-1">Valider</Submit></form>
                      )}
                      {c.status !== "REJECTED" && (
                        <form action={rejectClip.bind(null, id, c.id)} className="inline"><Submit className="btn-danger">Refuser</Submit></form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
