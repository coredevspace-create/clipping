import Link from "next/link";
import { login } from "@/app/actions/auth";
import { Flash } from "@/components/ui";
import { Submit } from "@/components/submit";

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string; erreur?: string }> }) {
  const sp = await searchParams;
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 font-display text-4xl font-extrabold tracking-[-0.03em]">Connexion</h1>
      <Flash sp={sp} />
      <form action={login} className="card space-y-4">
        <input type="hidden" name="next" value={sp.next ?? "/app"} />
        <div><label className="label">Email</label><input name="email" type="email" required className="input" /></div>
        <div><label className="label">Mot de passe</label><input name="password" type="password" required className="input" /></div>
        <Submit className="btn w-full">Se connecter</Submit>
      </form>
      <p className="mt-4 text-center text-sm text-zinc-500">
        Pas encore de compte ? <Link className="text-brand-600" href={`/inscription?next=${encodeURIComponent(sp.next ?? "/app")}`}>S&apos;inscrire</Link>
      </p>
    </div>
  );
}
