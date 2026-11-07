import Link from "next/link";
import { joinWorkspace } from "@/app/actions/clipper";
import { Flash } from "@/components/ui";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { euros, num } from "@/lib/format";
import { Submit } from "@/components/submit";

export default async function Page({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ erreur?: string }> }) {
  const { code } = await params;
  const sp = await searchParams;
  const ws = await db.workspace.findUnique({ where: { inviteCode: code }, include: { owner: true } });
  const user = await currentUser();

  if (!ws) {
    return <div className="mx-auto max-w-md card text-center">Ce lien d&apos;invitation n&apos;est plus valide. Demande un nouveau lien au créateur.</div>;
  }
  const next = encodeURIComponent(`/rejoindre/${code}`);
  return (
    <div className="mx-auto max-w-md">
      <Flash sp={sp} />
      <div className="card space-y-4 text-center">
        <p className="text-sm text-zinc-500">{ws.owner.name} t&apos;invite à clipper pour</p>
        <h1 className="font-display text-3xl font-bold tracking-[-0.03em]">{ws.name}</h1>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="rounded-lg bg-zinc-50 p-2"><div className="font-bold">{euros(ws.cpmCents)}</div><div className="text-xs text-zinc-500">/ 1 000 vues</div></div>
          <div className="rounded-lg bg-zinc-50 p-2"><div className="font-bold">{num(ws.minViews)}</div><div className="text-xs text-zinc-500">vues min.</div></div>
          <div className="rounded-lg bg-zinc-50 p-2"><div className="font-bold">{euros(ws.maxPayoutPerClipCents)}</div><div className="text-xs text-zinc-500">max / clip</div></div>
        </div>
        {user ? (
          <form action={joinWorkspace.bind(null, code)}>
            <Submit className="btn w-full">Rejoindre l&apos;équipe</Submit>
          </form>
        ) : (
          <div className="space-y-2">
            <Link href={`/inscription?next=${next}`} className="btn w-full">Créer mon compte clippeur</Link>
            <Link href={`/connexion?next=${next}`} className="btn-ghost w-full">J&apos;ai déjà un compte</Link>
          </div>
        )}
      </div>
    </div>
  );
}
