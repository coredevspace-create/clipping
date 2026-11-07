import Link from "next/link";
import { notFound } from "next/navigation";
import { inviteClipper } from "@/app/actions/marketplace";
import { Avatar, Chips, platformChips, ReputationLine } from "@/components/market";
import { Flash } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { canSeeContact, reputations, splitCsv } from "@/lib/marketplace";

export default async function Page({ params, searchParams }: { params: Promise<{ userId: string }>; searchParams: Promise<{ erreur?: string; ok?: string }> }) {
  const { userId } = await params;
  const sp = await searchParams;
  const me = await requireUser();
  const profile = await db.clipperProfile.findUnique({ where: { userId }, include: { user: { select: { name: true, createdAt: true } } } });
  if (!profile) notFound();
  const [rep, myTeams, showContact] = await Promise.all([
    reputations([userId]).then((m) => m.get(userId)!),
    db.workspace.findMany({ where: { ownerId: me.id }, select: { id: true, name: true } }),
    canSeeContact(me.id, userId),
  ]);
  const portfolio = profile.portfolio.split("\n").filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/clippeurs" className="text-sm text-zinc-500 hover:underline">← Annuaire</Link>
      <Flash sp={sp} />
      <div className="card space-y-4">
        <div className="flex items-center gap-4">
          <Avatar name={profile.user.name} size={56} />
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-[-0.03em]">{profile.user.name}</h1>
            <p className="text-zinc-600">{profile.headline}</p>
          </div>
        </div>
        <ReputationLine r={rep} />
        <div className="flex flex-wrap gap-2"><Chips items={splitCsv(profile.niches)} tone="brand" /><Chips items={platformChips(profile.platforms)} /></div>
        <p className="whitespace-pre-line text-sm text-zinc-700">{profile.bio}</p>
        {portfolio.length > 0 && (
          <div>
            <h2 className="mb-1 text-sm font-semibold">Portfolio</h2>
            <ul className="space-y-1 text-sm">
              {portfolio.map((u) => <li key={u}><a href={u} target="_blank" rel="noreferrer nofollow" className="break-all text-brand-700 hover:underline">{u}</a></li>)}
            </ul>
          </div>
        )}
        {profile.contact && (
          <p className="text-sm">Contact : {showContact ? <strong>{profile.contact}</strong> : <span className="text-zinc-500">visible après une invitation ou une candidature</span>}</p>
        )}
        {!profile.available && <p className="text-sm font-medium text-amber-700">Ce clippeur n&apos;est pas disponible en ce moment.</p>}
      </div>

      {me.id !== userId && (
        <div className="card">
          <h2 className="mb-3 font-display text-lg font-bold">Inviter dans mon équipe</h2>
          {myTeams.length === 0 ? (
            <p className="text-sm text-zinc-600">Crée d&apos;abord une équipe pour ton produit. <Link href="/app/nouvelle-equipe" className="text-brand-700 hover:underline">Créer une équipe →</Link></p>
          ) : (
            <form action={inviteClipper.bind(null, userId)} className="space-y-3">
              <select name="workspaceId" className="input">{myTeams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
              <textarea name="message" required minLength={10} rows={4} className="input" placeholder="Présente ton produit et pourquoi son profil t'intéresse…" />
              <button className="btn">Envoyer l&apos;invitation</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
