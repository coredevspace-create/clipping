import Link from "next/link";
import { Calculator } from "@/components/landing/calculator";
import { HeroFeed } from "@/components/landing/hero-feed";
import { currentUser } from "@/lib/auth";
import { APP_NAME, PLANS } from "@/lib/config";

const pains = [
  {
    tc: "00:00:04",
    t: "Tu paies des vues, pas des téléchargements",
    d: "Un clip à 100 000 vues peut ne rapporter aucun téléchargement. Sans lien propre à chaque clippeur, impossible de savoir qui fait grandir ton app et qui coûte juste de l'argent.",
  },
  {
    tc: "00:00:11",
    t: "Les bots gonflent la note",
    d: "50 000 vues et 100 likes ? Quelques euros de bots suffisent pour te facturer des centaines d'euros. Sans données, tu paies quand même.",
  },
  {
    tc: "00:00:23",
    t: "Des clips viraux… qui ne montrent pas ton app",
    d: "Sans consignes claires, les clippeurs font du contenu qui buzze mais où ton produit apparaît une demi-seconde. Des vues, zéro intention de télécharger.",
  },
  {
    tc: "00:00:38",
    t: "Discord, tableur et liens perdus",
    d: "Les liens se noient dans les messages, les vues se recopient à la main, les IBAN se cherchent le dimanche soir. Une erreur, et c'est la dispute.",
  },
];

const steps = [
  { n: "01", t: "Recrute", d: "Publie ta mission ou invite des clippeurs depuis l'annuaire. Chacun affiche ses vues vérifiées et sa spécialité (apps, jeux, SaaS…)." },
  { n: "02", t: "Briefe", d: "Des consignes prêtes pour les apps : démo express, faceless, réaction, storytime. Tes clips montrent vraiment ton produit." },
  { n: "03", t: "Vérifie", d: "Chaque vidéo est prouvée (code dans la description ou compte connecté), ses vues relevées toutes les heures et passées au détecteur de bots." },
  { n: "04", t: "Mesure & paie", d: "Clics, téléchargements et coût par téléchargement de chaque clippeur. Un clic calcule ce que tu dois à chacun." },
];

const signals = [
  ["Pic brutal", "+44 845 vues en 1 h, 221× le rythme du clip"],
  ["Vues sans engagement", "Les vues montent, les likes ne bougent pas"],
  ["Taux d'engagement", "0,2 % quand un clip organique dépasse souvent 2 %"],
  ["Hors norme", "20× la médiane habituelle de ce clippeur"],
  ["Vidéo réclamée", "Code du clippeur absent de la description"],
  ["Audience", "Contenu français vu hors francophonie (comptes connectés)"],
];

const compare = [
  ["Téléchargements par clippeur", "Impossible à savoir", "Lien intelligent + coût par téléchargement"],
  ["Réception des clips", "Messages Discord éparpillés", "Un lien, une preuve de propriété, zéro doublon"],
  ["Comptage des vues", "Captures d'écran et confiance", "Relevé automatique toutes les heures"],
  ["Vues achetées", "Impossible à voir", "Score de fraude expliqué, quarantaine"],
  ["Calcul des paiements", "Tableur à la main", "Automatique, au centime, incrémental"],
  ["Ce que tu reverses", "—", "0 % de commission, jamais"],
];

const faq = [
  ["C'est fait pour quel type de produit ?", "Pour les logiciels grand public : apps mobiles (iOS, Android), jeux, SaaS et sites web, logiciels, extensions de navigateur. Tout produit numérique qui se vend à des particuliers et qui grandit grâce aux vidéos courtes."],
  ["Comment savoir combien de téléchargements apporte chaque clippeur ?", "Chaque clippeur a un lien intelligent : iPhone → App Store, Android → Play Store, ordinateur → ton site. Les clics sont comptés par appareil, et chaque clippeur apparaît comme une campagne dans App Store Connect et la Play Console. Pour un SaaS web, les inscriptions remontent automatiquement par une simple URL à appeler. Résultat : le coût par téléchargement ou par inscription de chaque clippeur."],
  ["Un clippeur peut-il envoyer la vidéo de quelqu'un d'autre ?", "Non. Chaque clippeur a un code personnel à mettre dans la description de sa vidéo, ou connecte son compte. Sans preuve, le clip est refusé."],
  ["Vous prenez une commission sur ce que je verse ?", "Non. Jamais. Tu paies un abonnement fixe et tu verses à tes clippeurs ce que tu veux."],
  ["Quelles plateformes sont suivies ?", "TikTok, Instagram Reels, YouTube Shorts et X. Les vues sont relevées automatiquement, toutes les heures les 3 premiers jours."],
  ["Je suis clippeur, c'est payant ?", "Non, c'est gratuit. Trouve des missions d'apps qui paient à la vue, et construis une réputation vérifiée qui te suit d'équipe en équipe."],
];

export default async function Home() {
  const user = await currentUser();
  const startHref = user ? "/app/nouvelle-equipe" : "/inscription";

  return (
    <div className="-mt-10">
      {/* ——— HERO ——— */}
      <section className="bleed grain relative overflow-hidden bg-ink text-paper">
        <div className="grid-lines absolute inset-0" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-24 pt-16 lg:grid-cols-[1.15fr_1fr] lg:pt-24">
          <div>
            <div className="eyebrow reveal flex items-center gap-2 text-paper/70">
              <span className="h-2 w-2 animate-blink rounded-full bg-coral" /> Le clipping pour les apps, SaaS et logiciels grand public
            </div>
            <h1 className="reveal mt-6 font-display text-[38px] font-extrabold leading-[0.95] tracking-[-0.035em] sm:text-6xl xl:text-[68px]" style={{ animationDelay: ".1s" }}>
              Des vues qui
              <br />
              deviennent des
              <br />
              <span className="whitespace-nowrap">téléchargements.</span>
              <br />
              <span className="serif text-lime">Pas des bots.</span>
            </h1>
            <p className="reveal mt-6 max-w-xl text-lg text-paper/75" style={{ animationDelay: ".2s" }}>
              {APP_NAME} est l&apos;outil des fondateurs qui font connaître leur app avec une équipe de clippeurs : recrutement, consignes,
              vues vérifiées, anti-bots, et le coût par téléchargement de chaque clippeur. Fini Discord, fini le tableur, fini de payer pour du vent.
            </p>
            <div className="reveal mt-9 flex flex-wrap items-center gap-3" style={{ animationDelay: ".3s" }}>
              <Link href={startHref} className="btn-lime text-base">Créer mon équipe gratuitement →</Link>
              <Link href="/inscription?role=clippeur" className="rounded-full px-5 py-3 font-medium text-paper/80 ring-1 ring-paper/20 transition hover:text-paper hover:ring-paper/60">
                Je suis clippeur
              </Link>
            </div>
            <div className="reveal mt-6 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-paper/50" style={{ animationDelay: ".4s" }}>
              <span>✓ Sans carte bancaire</span>
              <span>✓ 0 % de commission</span>
              <span>✓ 100 % en français</span>
            </div>
          </div>
          <div className="reveal" style={{ animationDelay: ".35s" }}>
            <HeroFeed />
          </div>
        </div>
        {/* timeline de montage */}
        <div className="relative overflow-hidden border-t border-paper/10 py-3">
          <div className="flex w-max animate-marquee gap-10 whitespace-nowrap font-mono text-xs text-paper/40">
            {Array.from({ length: 2 }).flatMap((_, k) =>
              ["Apps mobiles", "TikTok", "Jeux", "Instagram Reels", "SaaS", "YouTube Shorts", "Extensions", "Logiciels"].map((w, i) => (
                <span key={`${k}-${i}`} className="flex items-center gap-10">
                  <span>{`00:0${i}:${String(i * 7 + 3).padStart(2, "0")}`}</span>
                  <span className="text-paper/70">{w}</span>
                  <span className="text-lime">✂</span>
                </span>
              )),
            )}
          </div>
        </div>
      </section>

      {/* ——— LE PROBLÈME ——— */}
      <section className="py-24">
        <div className="max-w-3xl">
          <div className="eyebrow text-coral">Le problème</div>
          <h2 className="mt-3 font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-6xl">
            Le clipping marche.
            <br />
            <span className="serif">Le gérer, c&apos;est l&apos;enfer.</span>
          </h2>
          <p className="mt-5 text-lg text-zinc-600">
            Pour une app grand public, une armée de clippeurs sur TikTok est le canal d&apos;acquisition le moins cher qui existe. Jusqu&apos;au moment où il faut savoir
            lesquels ramènent vraiment des téléchargements.
          </p>
        </div>
        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-ink/10 bg-ink/10 md:grid-cols-2">
          {pains.map((p) => (
            <div key={p.t} className="group bg-paper p-8 transition hover:bg-white">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-zinc-500">{p.tc}</span>
                <span className="font-mono text-xs text-coral opacity-0 transition group-hover:opacity-100">✂ coupe</span>
              </div>
              <h3 className="mt-6 font-display text-2xl font-bold tracking-tight">{p.t}</h3>
              <p className="mt-3 text-zinc-600">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ——— LE COÛT ——— */}
      <section className="pb-24">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="eyebrow text-zinc-500">Fais le calcul</div>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">
              Combien te coûtent <span className="serif">les fausses vues</span> ?
            </h2>
          </div>
          <p className="max-w-sm text-zinc-600">Chaque vue de bot que tu paies, c&apos;est un téléchargement que tu n&apos;auras jamais.</p>
        </div>
        <Calculator />
      </section>

      {/* ——— LA SOLUTION ——— */}
      <section className="bleed bg-paper-2 py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-3xl">
            <div className="eyebrow text-brand-700">La solution</div>
            <h2 className="mt-3 font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-6xl">
              De la mission au téléchargement,
              <br />
              <span className="serif">sur une seule timeline.</span>
            </h2>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.n} className="relative">
                <div className="mb-4 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-ink font-mono text-sm font-semibold text-lime">{s.n}</span>
                  {i < steps.length - 1 && <span className="hidden h-px flex-1 border-t border-dashed border-ink/30 md:block" />}
                </div>
                <h3 className="font-display text-2xl font-bold">{s.t}</h3>
                <p className="mt-2 text-sm text-zinc-600">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— PENSÉ POUR LES APPS ——— */}
      <section className="py-24">
        <div className="max-w-3xl">
          <div className="eyebrow text-zinc-500">Pensé pour les apps</div>
          <h2 className="mt-3 font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-6xl">
            Tu sais enfin <span className="serif">qui te rapporte des téléchargements.</span>
          </h2>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <div className="rounded-[28px] border border-ink/10 bg-white p-8">
            <div className="eyebrow text-zinc-500">Lien intelligent par clippeur</div>
            <h3 className="mt-3 font-display text-2xl font-bold">Un seul lien en bio, le bon store à chaque fois.</h3>
            <div className="mt-6 space-y-2 font-mono text-sm">
              {[
                ["📱", "iPhone", "App Store", "campagne clipsquad-lea"],
                ["🤖", "Android", "Play Store", "utm_content=lea"],
                ["💻", "Ordinateur", "ton site", "utm_content=lea"],
              ].map(([i, d, to, tag]) => (
                <div key={d} className="flex items-center justify-between gap-3 rounded-xl bg-paper px-4 py-3">
                  <span className="flex items-center gap-2"><span>{i}</span>{d}</span>
                  <span className="text-zinc-400">→</span>
                  <span className="font-semibold">{to}</span>
                  <span className="hidden text-xs text-zinc-500 sm:inline">{tag}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[28px] bg-ink p-8 text-paper">
            <div className="eyebrow text-lime">Coût par téléchargement</div>
            <h3 className="mt-3 font-display text-2xl font-bold">Garde les clippeurs rentables. Remplace les autres.</h3>
            <div className="mt-6 overflow-hidden rounded-xl border border-paper/10 text-sm">
              {[
                ["Léa", "212 k", "640", "0,33 €"],
                ["Noah", "94 k", "210", "0,45 €"],
                ["Sami", "151 k", "38", "3,97 €"],
              ].map(([n, v, dl, c], i) => (
                <div key={n} className={`grid grid-cols-4 gap-2 px-4 py-3 ${i ? "border-t border-paper/10" : ""}`}>
                  <span className="font-semibold">{n}</span>
                  <span className="font-mono text-paper/70">{v} vues</span>
                  <span className="font-mono text-paper/70">{dl} DL</span>
                  <span className={`text-right font-mono font-semibold ${i === 2 ? "text-coral" : "text-lime"}`}>{c}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-paper/50">Exemple illustratif.</p>
          </div>
          <div className="rounded-[28px] border border-ink/10 bg-white p-8">
            <div className="eyebrow text-zinc-500">Consignes prêtes à l&apos;emploi</div>
            <h3 className="mt-3 font-display text-2xl font-bold">Des clips qui montrent vraiment ton app.</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Démo express", "Faceless", "Réaction / avis", "Storytime"].map((t) => (
                <span key={t} className="rounded-full border border-ink/15 px-3 py-1.5 text-sm font-medium">{t}</span>
              ))}
            </div>
            <p className="mt-4 text-sm text-zinc-600">Hook en 2 secondes, nom de l&apos;app à l&apos;écran, « lien en bio » : les règles qui transforment une vue en téléchargement, en un clic dans ta mission.</p>
          </div>
          <div className="rounded-[28px] border border-ink/10 bg-lime p-8">
            <div className="eyebrow">Preuve de propriété</div>
            <h3 className="mt-3 font-display text-2xl font-bold">Personne ne peut réclamer la vidéo d&apos;un autre.</h3>
            <div className="mt-5 inline-flex items-center gap-3 rounded-xl bg-ink px-4 py-2.5 font-mono text-lg font-bold text-lime">#cs7k2p</div>
            <p className="mt-4 text-sm text-ink/75">Chaque clippeur met son code dans la description, ou connecte son compte TikTok, Instagram ou YouTube. Sans preuve, pas de clip.</p>
          </div>
        </div>
      </section>

      {/* ——— ANTI-FRAUDE ——— */}
      <section className="bleed grain relative overflow-hidden bg-ink py-24 text-paper">
        <div className="grid-lines absolute inset-0" />
        <div className="relative mx-auto grid max-w-6xl gap-14 px-4 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="eyebrow text-coral">● Anti-fraude</div>
            <h2 className="mt-3 font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-6xl">
              Chaque vue passe
              <br />
              <span className="serif text-lime">au détecteur.</span>
            </h2>
            <p className="mt-5 max-w-lg text-lg text-paper/70">
              Pas une boîte noire : chaque clip reçoit un score de 0 à 100 avec ses raisons, en français. Au-dessus du seuil, il est mis en quarantaine
              et n&apos;est jamais payé sans ton accord. Et comme les vues ne sont payées qu&apos;après un délai de vérification, frauder ne rapporte plus rien.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {signals.map(([t, d]) => (
              <div key={t} className="rounded-2xl border border-paper/10 bg-paper/[0.04] p-4">
                <div className="flex items-center gap-2 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-coral" />
                  {t}
                </div>
                <div className="mt-1 font-mono text-xs text-paper/60">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— DEUX CÔTÉS ——— */}
      <section className="py-24">
        <div className="max-w-3xl">
          <div className="eyebrow text-zinc-500">La place de marché</div>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.03em] sm:text-6xl">
            Pas encore d&apos;équipe ? <span className="serif">Elle t&apos;attend ici.</span>
          </h2>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <div className="flex flex-col justify-between rounded-[28px] border border-ink/10 bg-white p-8 sm:p-10">
            <div>
              <div className="eyebrow text-zinc-500">Tu es fondateur</div>
              <h3 className="mt-4 font-display text-3xl font-bold tracking-tight">Publie une annonce. Reçois des candidatures.</h3>
              <p className="mt-3 text-zinc-600">
                Décris ton produit, fixe ta rémunération, et laisse les clippeurs venir à toi. Ou parcours l&apos;annuaire et invite ceux dont les chiffres
                parlent pour eux : clips validés, vues vérifiées, taux de refus.
              </p>
            </div>
            <Link href={startHref} className="btn mt-8 w-fit">Publier mon annonce →</Link>
          </div>
          <div className="flex flex-col justify-between rounded-[28px] bg-lime p-8 text-ink sm:p-10">
            <div>
              <div className="eyebrow">Tu es clippeur</div>
              <h3 className="mt-4 font-display text-3xl font-bold tracking-tight">Des apps te paient à la vue.</h3>
              <p className="mt-3 text-ink/75">
                Des apps, jeux et SaaS qui se lancent cherchent des clippeurs. Postule en deux clics, suis tes vues et tes gains en temps réel, et construis
                une réputation vérifiée qui te suit d&apos;équipe en équipe. Gratuit, pour toujours.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/offres" className="btn">Voir les missions →</Link>
              <Link href="/inscription?role=clippeur" className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-ink/30 hover:ring-ink">
                Créer mon profil
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ——— COMPARAISON ——— */}
      <section className="pb-24">
        <h2 className="font-display text-3xl font-extrabold tracking-[-0.03em] sm:text-5xl">
          Discord + tableur <span className="serif text-zinc-500">vs</span> {APP_NAME}
        </h2>
        <div className="mt-10 overflow-hidden rounded-3xl border border-ink/10 bg-white">
          {compare.map(([k, before, after], i) => (
            <div key={k} className={`grid gap-2 px-6 py-5 sm:grid-cols-[1fr_1fr_1.2fr] sm:items-center ${i ? "border-t border-ink/5" : ""}`}>
              <div className="font-semibold">{k}</div>
              <div className="text-sm text-zinc-500 line-through decoration-coral/60">{before}</div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-lime text-[11px]">✓</span>
                {after}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ——— TARIFS ——— */}
      <section id="tarifs" className="scroll-mt-20 pb-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="eyebrow text-zinc-500">Tarifs</div>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.03em] sm:text-6xl">
              Un abonnement. <span className="serif">Zéro commission.</span>
            </h2>
          </div>
          <p className="max-w-sm text-zinc-600">
            Exemple : tu verses 3 000 € par mois à tes clippeurs pour lancer ton app. Une plateforme qui prend 20 % te coûte 600 € par mois. Ici, 99 €.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {Object.entries(PLANS).map(([k, p]) => {
            const featured = k === "PRO";
            return (
              <div key={k} className={`relative flex flex-col rounded-[28px] p-8 ${featured ? "bg-ink text-paper" : "border border-ink/10 bg-white"}`}>
                {featured && <span className="eyebrow absolute -top-3 left-8 rounded-full bg-lime px-3 py-1 text-ink">Le plus choisi</span>}
                <div className="font-display text-xl font-bold">{p.label}</div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-6xl font-extrabold tracking-tight">{p.priceEur}€</span>
                  <span className={featured ? "text-paper/60" : "text-zinc-500"}>/mois</span>
                </div>
                <ul className={`mt-6 flex-1 space-y-2 text-sm ${featured ? "text-paper/80" : "text-zinc-600"}`}>
                  <li>✓ {Number.isFinite(p.maxClippers) ? `Jusqu'à ${p.maxClippers} clippeurs` : "Clippeurs illimités"}</li>
                  <li>✓ Suivi des vues et anti-fraude</li>
                  <li>✓ Annonce et annuaire des clippeurs</li>
                  <li>✓ Calcul et export des paiements</li>
                  {k === "AGENCE" && <li>✓ Plusieurs produits / clients</li>}
                </ul>
                <Link href={startHref} className={`${featured ? "btn-lime" : "btn"} mt-8 w-full`}>Commencer</Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ——— FAQ ——— */}
      <section className="pb-24">
        <h2 className="font-display text-3xl font-extrabold tracking-[-0.03em] sm:text-5xl">Questions fréquentes</h2>
        <div className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
          {faq.map(([q, a]) => (
            <details key={q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold">
                {q}
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink/15 transition group-open:rotate-45 group-open:bg-ink group-open:text-lime">+</span>
              </summary>
              <p className="mt-3 max-w-3xl text-zinc-600">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ——— CTA FINAL ——— */}
      <section className="bleed grain relative overflow-hidden bg-ink text-paper">
        <div className="grid-lines absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 text-center">
          <h2 className="mx-auto max-w-4xl font-display text-4xl font-extrabold leading-[1] tracking-[-0.035em] sm:text-7xl">
            Ton app mérite
            <br />
            <span className="serif text-lime">mieux qu&apos;un tableur.</span>
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href={startHref} className="btn-lime text-base">Créer mon équipe gratuitement →</Link>
            <Link href="/offres" className="rounded-full px-5 py-3 font-medium text-paper/80 ring-1 ring-paper/20 hover:ring-paper/60">Je cherche des missions</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
