import Link from "next/link";
import { APP_NAME, PLANS } from "@/lib/config";

const features = [
  { t: "Les clippeurs envoient leurs liens", d: "Un lien d'invitation, et chaque clippeur soumet ses clips TikTok, Shorts, Reels ou X. Fini les messages Discord perdus." },
  { t: "Vues suivies automatiquement", d: "Relevés toutes les heures les 3 premiers jours, puis deux fois par jour. Courbe de vues de chaque clip." },
  { t: "Anti-fraude qui explique", d: "Pics brutaux, vues sans likes, engagement anormal, vidéos réclamées après coup : chaque clip suspect est mis en quarantaine avec les raisons." },
  { t: "Paiements calculés pour toi", d: "CPM, seuil minimum, plafond par clip, délai de validation. Un clic génère le lot de virements et l'export." },
  { t: "Bibliothèque de moments", d: "Dépose tes vidéos longues (live, podcast, démo), découpe les meilleurs moments : chaque clippeur réserve le sien, zéro doublon." },
  { t: "Liens traqués par clippeur", d: "Chaque clippeur a son lien vers ton produit : tu vois qui t'apporte des visiteurs, pas seulement des vues." },
];

export default function Home() {
  return (
    <div className="space-y-20 py-6">
      <section className="mx-auto max-w-3xl text-center">
        <p className="mb-3 inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
          Pour les fondateurs qui lancent leur SaaS ou leur produit
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Ton armée de clippeurs, <span className="text-brand-600">sans le tableur.</span>
        </h1>
        <p className="mt-5 text-lg text-zinc-600">
          {APP_NAME} centralise les clips de ton équipe, suit leurs vues automatiquement, détecte les vues achetées
          et calcule ce que tu dois à chacun. Abonnement fixe, zéro commission sur ce que tu verses.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/inscription" className="btn px-6 py-3 text-base">Créer mon équipe</Link>
          <a href="#tarifs" className="btn-ghost px-6 py-3 text-base">Voir les tarifs</a>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.t} className="card">
            <h3 className="font-semibold">{f.t}</h3>
            <p className="mt-2 text-sm text-zinc-600">{f.d}</p>
          </div>
        ))}
      </section>

      <section id="tarifs">
        <h2 className="mb-2 text-center text-3xl font-bold">Un abonnement, pas une commission</h2>
        <p className="mb-8 text-center text-zinc-600">Tu paies tes clippeurs ce que tu veux : on ne prélève rien dessus.</p>
        <div className="grid gap-4 md:grid-cols-3">
          {Object.entries(PLANS).map(([k, p]) => (
            <div key={k} className={`card ${k === "PRO" ? "ring-2 ring-brand-500" : ""}`}>
              <h3 className="font-semibold">{p.label}</h3>
              <div className="mt-2 text-3xl font-extrabold">{p.priceEur} €<span className="text-base font-medium text-zinc-500">/mois</span></div>
              <p className="mt-2 text-sm text-zinc-600">
                {Number.isFinite(p.maxClippers) ? `Jusqu'à ${p.maxClippers} clippeurs` : "Clippeurs illimités, plusieurs produits"}
              </p>
              <Link href="/inscription" className="btn mt-5 w-full">Commencer</Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
