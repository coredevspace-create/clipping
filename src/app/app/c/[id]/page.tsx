import { reserveMoment, submitClip, unreserveMoment, updatePayoutInfo } from "@/app/actions/clipper";
import { Empty, Flash, Stat, StatusBadge } from "@/components/ui";
import { requireMember } from "@/lib/auth";
import { appUrl } from "@/lib/config";
import { db } from "@/lib/db";
import { dateFr, euros, num, timecode } from "@/lib/format";
import { clipEarnings, computePayouts } from "@/lib/payouts";
import { PLATFORM_LABELS, type Platform } from "@/lib/platforms";
import { Submit } from "@/components/submit";

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ erreur?: string; ok?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { membership, workspace } = await requireMember(id);

  const [clips, moments, payouts] = await Promise.all([
    db.clip.findMany({ where: { membershipId: membership.id }, orderBy: { createdAt: "desc" } }),
    db.moment.findMany({
      where: { source: { workspaceId: id }, OR: [{ reservedById: null }, { reservedById: membership.id }] },
      include: { source: true, clips: { select: { id: true } } },
      orderBy: [{ createdAt: "desc" }],
      take: 100,
    }),
    db.payout.findMany({ where: { membershipId: membership.id }, include: { run: true }, orderBy: { run: { createdAt: "desc" } } }),
  ]);

  const mine = moments.filter((m) => m.reservedById === membership.id && m.clips.length === 0);
  const free = moments.filter((m) => !m.reservedById);
  const due = computePayouts(clips.filter((c) => c.status === "APPROVED" || c.status === "PENDING"), workspace)[0]?.amountCents ?? 0;
  const paid = payouts.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amountCents, 0);
  const trackedLink = `${appUrl()}/r/${membership.trackingCode}`;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-zinc-500">
          {euros(workspace.cpmCents)} / 1 000 vues · à partir de {num(workspace.minViews)} vues · max {euros(workspace.maxPayoutPerClipCents)} par clip · validation sous {workspace.holdDays} j
        </p>
      </div>
      <Flash sp={sp} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Mes vues" value={num(clips.filter((c) => c.status !== "REJECTED").reduce((s, c) => s + c.views, 0))} />
        <Stat label="Validé, à recevoir" value={euros(due + payouts.filter((p) => p.status === "PENDING").reduce((s, p) => s + p.amountCents, 0))} />
        <Stat label="Déjà reçu" value={euros(paid)} />
      </div>

      <div className="card">
        <h2 className="mb-1 font-display text-lg font-bold">Envoyer un clip</h2>
        <p className="mb-3 text-sm text-zinc-500">Publie ton clip, puis colle son lien ici. Les vues sont suivies automatiquement.</p>
        <form action={submitClip.bind(null, id)} className="grid gap-3 sm:grid-cols-[1fr_260px_auto]">
          <input name="url" required placeholder="https://www.tiktok.com/@toi/video/… ou youtube.com/shorts/…" className="input" />
          <select name="momentId" className="input" defaultValue="">
            <option value="">Aucun moment réservé</option>
            {mine.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
          <Submit className="btn">Envoyer</Submit>
        </form>
      </div>

      {workspace.productUrl && (
        <div className="card">
          <h2 className="mb-1 font-display text-lg font-bold">Ton lien traqué</h2>
          <p className="mb-3 text-sm text-zinc-500">Mets-le en bio ou en description : le créateur voit combien de visiteurs tu lui envoies.</p>
          <input readOnly value={trackedLink} className="input font-mono" />
        </div>
      )}

      <div>
        <h2 className="mb-3 font-display text-xl font-bold">Moments à clipper</h2>
        {mine.length + free.length === 0 ? (
          <Empty>Aucun moment proposé pour l&apos;instant. Tu peux quand même envoyer des clips libres.</Empty>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {[...mine, ...free].map((m) => (
              <div key={m.id} className={`card ${m.reservedById ? "ring-2 ring-brand-500" : ""}`}>
                <div className="text-xs text-zinc-500">{m.source.title} · {timecode(m.startSec)} → {timecode(m.endSec)}</div>
                <div className="font-medium">{m.title}</div>
                {(m.notes || m.source.notes) && <p className="mt-1 text-sm text-zinc-600">{m.notes ?? m.source.notes}</p>}
                <div className="mt-3 flex gap-2">
                  <a href={m.source.url} target="_blank" rel="noreferrer" className="btn-ghost">Voir la source</a>
                  {m.reservedById ? (
                    <form action={unreserveMoment.bind(null, id, m.id)}><Submit className="btn-ghost">Annuler ma réservation</Submit></form>
                  ) : (
                    <form action={reserveMoment.bind(null, id, m.id)}><Submit className="btn">Réserver</Submit></form>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 font-display text-xl font-bold">Mes clips</h2>
        {clips.length === 0 ? (
          <Empty>Tu n&apos;as encore envoyé aucun clip.</Empty>
        ) : (
          <div className="card overflow-x-auto p-0">
            <table className="table">
              <thead><tr><th>Clip</th><th>Envoyé le</th><th className="text-right">Vues</th><th className="text-right">Gain estimé</th><th>Statut</th></tr></thead>
              <tbody>
                {clips.map((c) => (
                  <tr key={c.id}>
                    <td><a href={c.url} target="_blank" rel="noreferrer" className="text-brand-700 hover:underline">{PLATFORM_LABELS[c.platform as Platform]}</a></td>
                    <td>{dateFr(c.createdAt)}</td>
                    <td className="text-right font-mono">{num(c.views)}</td>
                    <td className="text-right">{c.status === "REJECTED" ? "—" : euros(clipEarnings(c.views, workspace))}</td>
                    <td><StatusBadge status={c.status === "FLAGGED" ? "PENDING" : c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-2 text-xs text-zinc-500">Les vues sont vérifiées automatiquement. Les vues achetées (bots) entraînent le refus du clip et peuvent entraîner l&apos;exclusion de l&apos;équipe.</p>
      </div>

      <div className="card max-w-xl">
        <h2 className="mb-1 font-display text-lg font-bold">Mes coordonnées de paiement</h2>
        <p className="mb-3 text-sm text-zinc-500">Visibles uniquement par le créateur de l&apos;équipe.</p>
        <form action={updatePayoutInfo.bind(null, id)} className="grid gap-3 sm:grid-cols-[120px_1fr_auto]">
          <select name="method" defaultValue={membership.payoutMethod ?? "IBAN"} className="input">
            <option value="IBAN">IBAN</option>
            <option value="PAYPAL">PayPal</option>
          </select>
          <input name="details" defaultValue={membership.payoutDetails ?? ""} placeholder="FR76… ou email PayPal" className="input" />
          <Submit className="btn">Enregistrer</Submit>
        </form>
      </div>
    </div>
  );
}
