import Link from "next/link";
import { saveProfile } from "@/app/actions/marketplace";
import { Flash, PageTitle } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NICHES, platformLabel, PLATFORMS, splitCsv } from "@/lib/marketplace";

export default async function Page({ searchParams }: { searchParams: Promise<{ erreur?: string; ok?: string; bienvenue?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const p = await db.clipperProfile.findUnique({ where: { userId: user.id } });
  const niches = splitCsv(p?.niches);
  const platforms = splitCsv(p?.platforms);

  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle
        title={sp.bienvenue ? `Bienvenue ${user.name} 👋` : "Mon annonce de clippeur"}
        subtitle="Ton annonce apparaît dans l'annuaire consulté par les créateurs. Plus elle est précise, plus tu reçois d'invitations."
      >
        <Link href="/offres" className="btn-ghost">Voir les missions →</Link>
      </PageTitle>
      <Flash sp={sp} />
      <form action={saveProfile} className="card space-y-5">
        <div>
          <label className="label">Titre de ton annonce</label>
          <input name="headline" required defaultValue={p?.headline} maxLength={90} placeholder="Ex. Monteur shorts SaaS & IA, 2 ans d'expérience" className="input" />
        </div>
        <div>
          <label className="label">Présentation</label>
          <textarea name="bio" required rows={5} defaultValue={p?.bio} className="input" placeholder="Ton expérience, ton style de montage, les comptes que tu gères, tes meilleurs résultats…" />
        </div>
        <fieldset>
          <legend className="label">Niches</legend>
          <div className="flex flex-wrap gap-2">
            {NICHES.map((n) => <Toggle key={n} name="niches" value={n} label={n} checked={niches.includes(n)} />)}
          </div>
        </fieldset>
        <fieldset>
          <legend className="label">Plateformes</legend>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((pl) => <Toggle key={pl} name="platforms" value={pl} label={platformLabel(pl)} checked={platforms.includes(pl)} />)}
          </div>
        </fieldset>
        <div>
          <label className="label">Portfolio (un lien par ligne, 8 max)</label>
          <textarea name="portfolio" rows={3} defaultValue={p?.portfolio} className="input font-mono text-xs" placeholder={"https://www.tiktok.com/@toncompte\nhttps://www.youtube.com/shorts/…"} />
        </div>
        <div>
          <label className="label">Contact (Discord, Telegram…)</label>
          <input name="contact" defaultValue={p?.contact ?? ""} placeholder="Ex. discord : tonpseudo" className="input" />
          <p className="mt-1 text-xs text-zinc-500">Visible uniquement par les créateurs avec qui tu es en relation.</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="available" defaultChecked={p?.available ?? true} className="h-4 w-4 accent-[var(--color-ink)]" />
          Je suis disponible pour de nouvelles équipes (visible dans l&apos;annuaire)
        </label>
        <button className="btn">{p ? "Mettre à jour mon annonce" : "Publier mon annonce"}</button>
      </form>
    </div>
  );
}

function Toggle({ name, value, label, checked }: { name: string; value: string; label: string; checked: boolean }) {
  return (
    <label className="cursor-pointer select-none rounded-full border border-zinc-300 px-3 py-1 text-sm has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-lime">
      <input type="checkbox" name={name} value={value} defaultChecked={checked} className="sr-only" />
      {label}
    </label>
  );
}
