import Link from "next/link";
import { approveClip, refreshAllClips, rejectClip } from "@/app/actions/creator";
import { AreaChart } from "@/components/charts/area-chart";
import { Leaderboard } from "@/components/charts/leaderboard";
import { ClipCard } from "@/components/clip/clip-card";
import { Submit } from "@/components/submit";
import { Empty, Flash, Stat } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { compact, euros } from "@/lib/format";
import { computePayouts } from "@/lib/payouts";
import { dailySeries } from "@/lib/series";

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

  const all = await db.clip.findMany({
    where: { workspaceId: id },
    include: {
      membership: { include: { user: { select: { id: true, name: true } } } },
      snapshots: { where: { capturedAt: { gte: new Date(Date.now() - 31 * 86_400_000) } }, select: { capturedAt: true, views: true } },
    },
    orderBy: [{ createdAt: "desc" }],
  });
  const clips = all
    .filter((c) => !statut || c.status === statut)
    .sort((a, b) => Number(b.status === "FLAGGED") - Number(a.status === "FLAGGED") || +b.createdAt - +a.createdAt);

  const counted = all.filter((c) => c.status !== "REJECTED");
  const totalViews = counted.reduce((s, c) => s + c.views, 0);
  const flagged = all.filter((c) => c.status === "FLAGGED").length;
  const due = computePayouts(all.filter((c) => c.status === "APPROVED" || c.status === "PENDING"), workspace).reduce((s, d) => s + d.amountCents, 0);
  const paid = all.reduce((s, c) => s + c.paidCents, 0);
  const verified = counted.filter((c) => c.ownershipVerified).length;

  const series = dailySeries(counted.map((c) => c.snapshots), 14).map((p) => ({ date: p.date.toISOString(), value: p.views }));
  const gained = series.length > 1 ? series[series.length - 1].value - series[0].value : 0;

  const byMember = new Map<string, { id: string; name: string; views: number; clips: number }>();
  for (const c of counted) {
    const u = c.membership.user;
    const r = byMember.get(u.id) ?? { id: u.id, name: u.name, views: 0, clips: 0 };
    r.views += c.views;
    r.clips++;
    byMember.set(u.id, r);
  }
  const ranking = [...byMember.values()].sort((a, b) => b.views - a.views).slice(0, 6);

  return (
    <div className="space-y-8">
      <Flash sp={sp} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Vues cumulées" value={compact(totalViews)} hint={`${counted.length} clip(s) · ${verified} vérifié(s)`} />
        <Stat label="Clips suspects" value={String(flagged)} hint="En quarantaine, non payés" />
        <Stat label="À payer" value={euros(due)} hint={`Après ${workspace.holdDays} j de vérification`} />
        <Stat label="Déjà versé" value={euros(paid)} />
      </div>

      {all.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <div className="card">
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-lg font-bold">Vues de l&apos;équipe · 14 jours</h2>
              <span className="font-mono text-xs text-zinc-500">+{compact(Math.max(gained, 0))} sur la période</span>
            </div>
            <AreaChart points={series} />
          </div>
          <div className="card">
            <h2 className="mb-4 font-display text-lg font-bold">Classement des clippeurs</h2>
            <Leaderboard rows={ranking} />
          </div>
        </div>
      )}

      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1">
            {FILTERS.map((f) => {
              const n = f.key ? all.filter((c) => c.status === f.key).length : all.length;
              return (
                <Link
                  key={f.key}
                  href={f.key ? `?statut=${f.key}` : "?"}
                  className={`rounded-full px-3 py-1 text-sm ${statut === f.key ? "bg-ink text-paper" : "bg-white text-zinc-600 ring-1 ring-ink/10"}`}
                >
                  {f.label} <span className="opacity-60">{n}</span>
                </Link>
              );
            })}
          </div>
          <form action={refreshAllClips.bind(null, id)}>
            <Submit className="btn-ghost">↻ Actualiser les vues</Submit>
          </form>
        </div>

        {clips.length === 0 ? (
          <Empty>Aucun clip ici. Invite tes clippeurs depuis l&apos;onglet « Clippeurs » ou publie ton annonce.</Empty>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {clips.map((c) => (
              <ClipCard
                key={c.id}
                clip={c}
                href={`/app/e/${id}/clips/${c.id}`}
                who={c.membership.user.name}
                threshold={workspace.fraudThreshold}
                actions={
                  <>
                    {c.status !== "APPROVED" && (
                      <form action={approveClip.bind(null, id, c.id)} className="flex-1"><Submit className="btn-ghost w-full px-2 py-1.5 text-xs">Valider</Submit></form>
                    )}
                    {c.status !== "REJECTED" && (
                      <form action={rejectClip.bind(null, id, c.id)} className="flex-1"><Submit className="btn-danger w-full px-2 py-1.5 text-xs">Refuser</Submit></form>
                    )}
                  </>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
