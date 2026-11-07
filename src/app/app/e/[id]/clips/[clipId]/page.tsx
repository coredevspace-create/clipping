import Link from "next/link";
import { notFound } from "next/navigation";
import { approveClip, manualStats, refreshOneClip, rejectClip, reopenClip } from "@/app/actions/creator";
import { Flash, FraudBadge, StatusBadge } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { dateTimeFr, euros, num, timecode } from "@/lib/format";
import type { FraudReason } from "@/lib/fraud";
import { clipEarnings } from "@/lib/payouts";
import { PLATFORM_LABELS, type Platform } from "@/lib/platforms";
import { Submit } from "@/components/submit";

export default async function Page({ params, searchParams }: { params: Promise<{ id: string; clipId: string }>; searchParams: Promise<{ erreur?: string; ok?: string }> }) {
  const { id, clipId } = await params;
  const sp = await searchParams;
  const { workspace } = await requireOwner(id);
  const clip = await db.clip.findFirst({
    where: { id: clipId, workspaceId: id },
    include: { membership: { include: { user: true } }, snapshots: { orderBy: { capturedAt: "asc" } }, moment: { include: { source: true } } },
  });
  if (!clip) notFound();
  const reasons = JSON.parse(clip.fraudReasons) as FraudReason[];

  return (
    <div className="space-y-6">
      <Flash sp={sp} />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href={`/app/e/${id}`} className="text-sm text-zinc-500 hover:underline">← Tous les clips</Link>
          <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight">{PLATFORM_LABELS[clip.platform as Platform]} · {clip.membership.user.name}</h2>
          <a href={clip.url} target="_blank" rel="noreferrer" className="break-all text-sm text-brand-700 hover:underline">{clip.url}</a>
          {clip.moment && (
            <p className="mt-1 text-sm text-zinc-500">
              Moment : « {clip.moment.title} » ({clip.moment.source.title}, {timecode(clip.moment.startSec)}–{timecode(clip.moment.endSec)})
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={clip.status} />
          {clip.status !== "APPROVED" && <form action={approveClip.bind(null, id, clip.id)}><Submit className="btn-ghost">Valider</Submit></form>}
          {clip.status !== "REJECTED" && <form action={rejectClip.bind(null, id, clip.id)}><Submit className="btn-danger">Refuser</Submit></form>}
          {(clip.status === "REJECTED" || clip.status === "APPROVED") && <form action={reopenClip.bind(null, id, clip.id)}><Submit className="btn-ghost">Remettre en vérification</Submit></form>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Box label="Vues" value={num(clip.views)} />
        <Box label="Likes · Comm. · Partages" value={`${num(clip.likes)} · ${num(clip.comments)} · ${num(clip.shares)}`} />
        <Box label="Gain du clip" value={euros(clipEarnings(clip.views, workspace))} sub={`dont ${euros(clip.paidCents)} déjà versé`} />
        <Box label="Dernier relevé" value={dateTimeFr(clip.lastFetchedAt)} sub={clip.statsSource ? `Source : ${clip.statsSource}` : undefined} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">Courbe des vues</h3>
            <form action={refreshOneClip.bind(null, id, clip.id)}><Submit className="btn-ghost">↻ Actualiser</Submit></form>
          </div>
          <ViewsChart points={clip.snapshots.map((s) => ({ t: s.capturedAt.getTime(), v: s.views }))} />
          <p className="mt-2 text-xs text-zinc-500">{clip.snapshots.length} relevé(s). Une courbe organique monte puis ralentit ; une marche d&apos;escalier brutale trahit souvent des bots.</p>
        </div>

        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">Anti-fraude</h3>
            <FraudBadge score={clip.fraudScore} threshold={workspace.fraudThreshold} />
          </div>
          {reasons.length === 0 ? (
            <p className="text-sm text-brand-700">Aucun signal suspect détecté.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {reasons.map((r) => (
                <li key={r.code} className="rounded-lg bg-coral/10 p-2 text-ink">
                  <span className="font-mono text-xs font-semibold">+{r.points}</span> {r.label}
                </li>
              ))}
            </ul>
          )}
          {clip.approvedOverride && <p className="mt-3 text-xs text-zinc-500">Validé manuellement malgré les signaux.</p>}
          <p className="mt-3 text-xs text-zinc-500">Seuil de quarantaine : {workspace.fraudThreshold}/100 (modifiable dans les réglages).</p>
        </div>
      </div>

      <div className="card">
        <h3 className="mb-1 font-display text-lg font-bold">Saisie manuelle des statistiques</h3>
        <p className="mb-3 text-sm text-zinc-500">Pour les plateformes pas encore branchées : recopie les chiffres affichés sur la vidéo ou une capture envoyée par le clippeur.</p>
        <form action={manualStats.bind(null, id, clip.id)} className="grid gap-3 sm:grid-cols-5">
          <input name="views" required placeholder="Vues" inputMode="numeric" className="input" />
          <input name="likes" placeholder="Likes" inputMode="numeric" className="input" />
          <input name="comments" placeholder="Commentaires" inputMode="numeric" className="input" />
          <input name="shares" placeholder="Partages" inputMode="numeric" className="input" />
          <Submit className="btn">Enregistrer</Submit>
        </form>
      </div>
    </div>
  );
}

function Box({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-1 text-lg font-bold">{value}</div>
      {sub && <div className="text-xs text-zinc-500">{sub}</div>}
    </div>
  );
}

function ViewsChart({ points }: { points: { t: number; v: number }[] }) {
  if (points.length < 2) return <div className="grid h-48 place-items-center text-sm text-zinc-400">Pas encore assez de relevés pour tracer la courbe.</div>;
  const W = 600, H = 200, P = 8;
  const t0 = points[0].t, t1 = points[points.length - 1].t || t0 + 1;
  const vMax = Math.max(...points.map((p) => p.v), 1);
  const x = (t: number) => P + ((t - t0) / Math.max(t1 - t0, 1)) * (W - 2 * P);
  const y = (v: number) => H - P - (v / vMax) * (H - 2 * P);
  const d = points.map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-48 w-full" role="img" aria-label="Évolution des vues">
      <path d={`${d} L${x(t1)},${H - P} L${P},${H - P} Z`} fill="var(--color-brand-100)" />
      <path d={d} fill="none" stroke="var(--color-brand-600)" strokeWidth={2} />
      {points.map((p) => <circle key={p.t} cx={x(p.t)} cy={y(p.v)} r={2.5} fill="var(--color-brand-600)" />)}
      <text x={W - P} y={14} textAnchor="end" fontSize={11} fill="#71717a">{num(vMax)} vues</text>
    </svg>
  );
}
