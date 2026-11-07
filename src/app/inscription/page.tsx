import Link from "next/link";
import { signup } from "@/app/actions/auth";
import { Flash } from "@/components/ui";

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string; erreur?: string }> }) {
  const sp = await searchParams;
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-bold">Créer un compte</h1>
      <Flash sp={sp} />
      <form action={signup} className="card space-y-4">
        <input type="hidden" name="next" value={sp.next ?? "/app"} />
        <div><label className="label">Nom ou pseudo</label><input name="name" required className="input" /></div>
        <div><label className="label">Email</label><input name="email" type="email" required className="input" /></div>
        <div><label className="label">Mot de passe</label><input name="password" type="password" minLength={8} required className="input" /></div>
        <button className="btn w-full">Créer mon compte</button>
      </form>
      <p className="mt-4 text-center text-sm text-zinc-500">
        Déjà inscrit ? <Link className="text-brand-600" href={`/connexion?next=${encodeURIComponent(sp.next ?? "/app")}`}>Se connecter</Link>
      </p>
    </div>
  );
}
