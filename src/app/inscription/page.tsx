import Link from "next/link";
import { signup } from "@/app/actions/auth";
import { Flash } from "@/components/ui";
import { Submit } from "@/components/submit";

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string; erreur?: string; role?: string }> }) {
  const sp = await searchParams;
  const next = sp.next ?? "/app";
  const clipperByDefault = sp.role === "clippeur" || next.startsWith("/rejoindre") || next.startsWith("/offres");
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 font-display text-4xl font-extrabold tracking-[-0.03em]">Créer un compte</h1>
      <Flash sp={sp} />
      <form action={signup} className="card space-y-4">
        <input type="hidden" name="next" value={next} />
        <fieldset>
          <legend className="label">Je suis…</legend>
          <div className="grid grid-cols-2 gap-2">
            <RoleOption value="CREATOR" title="Créateur" text="Je cherche des clippeurs pour mon produit" checked={!clipperByDefault} />
            <RoleOption value="CLIPPER" title="Clippeur" text="Je veux être payé pour créer des clips" checked={clipperByDefault} />
          </div>
        </fieldset>
        <div><label className="label">Nom ou pseudo</label><input name="name" required className="input" /></div>
        <div><label className="label">Email</label><input name="email" type="email" required className="input" /></div>
        <div><label className="label">Mot de passe</label><input name="password" type="password" minLength={8} required className="input" /></div>
        <Submit className="btn w-full">Créer mon compte</Submit>
      </form>
      <p className="mt-4 text-center text-sm text-zinc-500">
        Déjà inscrit ? <Link className="text-brand-600" href={`/connexion?next=${encodeURIComponent(next)}`}>Se connecter</Link>
      </p>
    </div>
  );
}

function RoleOption({ value, title, text, checked }: { value: string; title: string; text: string; checked: boolean }) {
  return (
    <label className="cursor-pointer rounded-lg border border-zinc-300 p-3 has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50">
      <input type="radio" name="role" value={value} defaultChecked={checked} className="sr-only" />
      <div className="font-semibold">{title}</div>
      <div className="text-xs text-zinc-500">{text}</div>
    </label>
  );
}
