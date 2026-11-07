import Link from "next/link";
import { ChaosStack, ClipperPhone, CtaGlow, FraudCurve, HeroPhones, SmartLinkRows } from "@/components/landing/visuals";
import { currentUser } from "@/lib/auth";
import { PLANS } from "@/lib/config";
import { IMAGES } from "@/lib/images";

/** Image générée si elle existe, sinon le visuel de remplacement en code. */
function Visual({ src, alt, fallback, className = "" }: { src: string | null; alt: string; fallback: React.ReactNode; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return src ? <img src={src} alt={alt} className={`h-full w-full object-cover ${className}`} loading="lazy" /> : <>{fallback}</>;
}

const faq = [
  ["C'est fait pour quel type de produit ?", "Pour les logiciels grand public : apps mobiles (iOS, Android), jeux, SaaS et sites web, logiciels, extensions de navigateur. Tout produit numérique qui se vend à des particuliers et qui grandit grâce aux vidéos courtes."],
  ["Comment savoir combien de téléchargements apporte chaque clippeur ?", "Chaque clippeur a un lien intelligent : iPhone vers l'App Store, Android vers le Play Store, ordinateur vers ton site. Chaque clippeur apparaît comme une campagne dans App Store Connect et la Play Console, et les inscriptions d'un SaaS web remontent automatiquement. Tu obtiens le coût par téléchargement de chacun."],
  ["Un clippeur peut-il envoyer la vidéo de quelqu'un d'autre ?", "Non. Chaque clippeur met son code personnel dans la description de sa vidéo, ou connecte son compte. Sans preuve, le clip est refusé."],
  ["Vous prenez une commission sur ce que je verse ?", "Non, jamais. Tu paies un abonnement fixe et tu verses à tes clippeurs ce que tu veux."],
  ["Quelles plateformes sont suivies ?", "TikTok, Instagram Reels, YouTube Shorts et X. Les vues sont relevées toutes les heures pendant les 3 premiers jours."],
  ["Je suis clippeur, c'est payant ?", "Non, c'est gratuit. Trouve des missions d'apps qui paient à la vue et construis une réputation vérifiée."],
];

const H2 = "text-[40px] font-bold leading-[1.07] tracking-[-0.035em] sm:text-[56px]";

export default async function Home() {
  const user = await currentUser();
  const startHref = user ? "/app/nouvelle-equipe" : "/inscription";

  return (
    <div className="-my-10 bg-white">
      {/* ——— HERO ——— */}
      <section className="bleed bg-white px-[22px] pb-10 pt-20 text-center sm:pt-24">
        <p className="text-[17px] font-semibold text-accent sm:text-[19px]">Pour les apps et logiciels grand public</p>
        <h1 className="mx-auto mt-3 max-w-[900px] text-[44px] font-bold leading-[1.04] tracking-[-0.045em] sm:text-[64px] lg:text-[80px]">
          Des vues qui deviennent des téléchargements.
        </h1>
        <p className="mx-auto mt-5 max-w-[640px] text-[19px] leading-snug text-zinc-500 sm:text-[24px]">
          Recrute tes clippeurs. Vérifie chaque vue. Sache lesquels font vraiment grandir ton app.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
          <Link href={startHref} className="btn-lime">Commencer gratuitement</Link>
          <a href="#apps" className="text-[17px] text-brand-700 hover:underline">Voir comment ça marche ›</a>
        </div>

        <div className="relative mx-auto mt-16 max-w-[1080px]">
          <div className={`h-[300px] overflow-hidden rounded-[28px] sm:h-[560px] ${IMAGES.hero ? "bg-white" : "bg-gradient-to-b from-[#f5f5f7] to-white"}`}>
            <Visual src={IMAGES.hero} alt="Trois smartphones affichant des clips verticaux" fallback={<HeroPhones />} className="object-contain" />
          </div>
          <div className="absolute left-0 top-24 hidden rounded-[18px] bg-white/85 px-[18px] py-3.5 text-left shadow-[0_20px_50px_rgba(0,0,0,0.12)] backdrop-blur-xl md:block lg:-left-3">
            <div className="text-xs font-medium text-zinc-500">Léa · TikTok</div>
            <div className="text-[22px] font-bold tracking-[-0.02em]">+142 téléchargements</div>
          </div>
          <div className="absolute right-0 top-48 hidden items-center gap-3 rounded-[18px] bg-white/85 px-[18px] py-3.5 text-left shadow-[0_20px_50px_rgba(0,0,0,0.12)] backdrop-blur-xl md:flex lg:-right-3">
            <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#fff1f0]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d70015" strokeWidth="2" aria-hidden><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" /><path d="m9 9 6 6M15 9l-6 6" /></svg>
            </span>
            <div><div className="text-xs font-medium text-zinc-500">Anti-fraude</div><div className="text-[17px] font-bold">44 845 vues de bots bloquées</div></div>
          </div>
          <div className="absolute -bottom-7 left-1/2 hidden -translate-x-1/2 rounded-full bg-ink px-[22px] py-3 text-[15px] font-semibold text-white shadow-[0_20px_50px_rgba(0,0,0,0.2)] sm:block">
            0,36 € par téléchargement
          </div>
        </div>
      </section>

      {/* ——— FAITS PRODUIT ——— */}
      <section className="bleed bg-white px-[22px] pb-10 pt-20">
        <div className="mx-auto grid max-w-[980px] grid-cols-2 gap-8 text-center md:grid-cols-4">
          {[
            ["0 %", "de commission sur ce que tu verses"],
            ["1 h", "entre deux relevés de vues"],
            ["4", "plateformes suivies"],
            ["1 lien", "App Store, Play Store et site"],
          ].map(([v, l]) => (
            <div key={v}><div className="text-[40px] font-bold tracking-[-0.03em]">{v}</div><div className="mt-1 text-[15px] text-zinc-500">{l}</div></div>
          ))}
        </div>
      </section>

      {/* ——— LE PROBLÈME ——— */}
      <section className="bleed bg-paper px-[22px] py-20 sm:py-24">
        <div className="mx-auto flex max-w-[1080px] flex-wrap items-center gap-14">
          <div className="min-w-0 flex-[1_1_420px]">
            <p className="text-[17px] font-semibold text-[#bf4800]">Le problème</p>
            <h2 className={`mt-2.5 ${H2}`}>Le clipping marche.<br />Le gérer, non.</h2>
            <div className="mt-8 space-y-6">
              {[
                ["Tu paies des vues, pas des téléchargements.", "Un clip à 100 000 vues peut ne rien rapporter. Sans lien par clippeur, impossible de savoir qui est rentable."],
                ["Les bots gonflent la facture.", "50 000 vues, 100 likes. Quelques euros de bots suffisent pour te facturer des centaines d'euros."],
                ["Discord, tableur, liens perdus.", "Les vues recopiées à la main, les IBAN cherchés le dimanche soir."],
              ].map(([t, d]) => (
                <div key={t}><div className="text-[19px] font-semibold">{t}</div><div className="mt-1 text-[17px] leading-relaxed text-zinc-600">{d}</div></div>
              ))}
            </div>
          </div>
          <div className="h-[420px] min-w-0 flex-[1_1_420px] overflow-hidden rounded-[28px] bg-[#e8e8ed] sm:h-[480px]">
            <Visual src={IMAGES.probleme} alt="Un bureau en désordre, des notifications en pagaille" fallback={<ChaosStack />} />
          </div>
        </div>
      </section>

      {/* ——— POUR LES APPS (tuiles) ——— */}
      <section id="apps" className="bleed bg-white scroll-mt-16 px-[22px] py-24 sm:py-28">
        <div className="mx-auto max-w-[1080px]">
          <h2 className={`mx-auto max-w-[760px] text-center ${H2}`}>Pensé pour les apps.<br /><span className="text-zinc-400">Pas pour les vues.</span></h2>
          <div className="mt-14 grid gap-5 md:grid-cols-2">
            <div className="flex flex-wrap items-center gap-8 overflow-hidden rounded-[28px] bg-black p-8 text-white sm:p-10 md:col-span-2">
              <div className="min-w-0 flex-[1_1_280px]">
                <p className="text-[15px] font-semibold text-[#2997ff]">Lien intelligent</p>
                <h3 className="mt-2 text-[30px] font-bold leading-[1.1] tracking-[-0.03em] sm:text-[34px]">Un lien en bio.<br />Le bon store, à chaque fois.</h3>
                <p className="mt-3.5 text-[17px] leading-relaxed text-[#a1a1a6]">iPhone vers l&apos;App Store, Android vers le Play Store, ordinateur vers ton site. Chaque téléchargement est attribué au bon clippeur.</p>
              </div>
              <div className="h-[300px] min-w-0 flex-[1_1_300px] overflow-hidden rounded-[22px] bg-[#1c1c1e]">
                <Visual src={IMAGES.lienIntelligent} alt="Un téléphone affichant une page de téléchargement d'app" fallback={<SmartLinkRows />} className="object-[center_35%]" />
              </div>
            </div>

            <div className="rounded-[28px] bg-paper p-9">
              <p className="text-[15px] font-semibold text-[#bf4800]">Coût par téléchargement</p>
              <h3 className="mt-2 text-[28px] font-bold leading-tight tracking-[-0.025em]">Garde les rentables.</h3>
              <div className="mt-6 rounded-[18px] bg-white px-[18px] py-1.5">
                {[["Léa", "640 DL", "0,33 €", false], ["Noah", "210 DL", "0,45 €", false], ["Sami", "38 DL", "3,97 €", true]].map(([n, dl, c, bad], i) => (
                  <div key={n as string} className={`flex justify-between py-3 text-[15px] ${i < 2 ? "border-b border-zinc-200" : ""}`}>
                    <span className="font-semibold">{n}</span><span className="text-zinc-600">{dl}</span><span className={`font-bold ${bad ? "text-coral" : "text-ok"}`}>{c}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2.5 text-xs text-zinc-500">Exemple illustratif.</p>
            </div>

            <div className="rounded-[28px] bg-paper p-9">
              <p className="text-[15px] font-semibold text-ok">Preuve de propriété</p>
              <h3 className="mt-2 text-[28px] font-bold leading-tight tracking-[-0.025em]">Personne ne réclame la vidéo d&apos;un autre.</h3>
              <div className="mt-7 inline-flex items-center gap-2.5 rounded-[14px] bg-white px-4 py-3 font-mono text-xl font-bold">
                #cs7k2p <span className="rounded-full bg-ok px-2 py-0.5 font-sans text-xs font-semibold text-white">Vérifié</span>
              </div>
              <p className="mt-4 text-[15px] leading-relaxed text-zinc-600">Un code personnel dans la description, ou le compte connecté. Sans preuve, pas de clip.</p>
            </div>

            <div className="rounded-[28px] bg-paper p-9">
              <p className="text-[15px] font-semibold text-accent">Consignes prêtes</p>
              <h3 className="mt-2 text-[28px] font-bold leading-tight tracking-[-0.025em]">Des clips qui montrent vraiment ton app.</h3>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Démo express", "Faceless", "Réaction", "Storytime"].map((t) => <span key={t} className="rounded-full bg-white px-3.5 py-2 text-sm font-medium">{t}</span>)}
              </div>
            </div>

            <div className="rounded-[28px] bg-paper p-9">
              <p className="text-[15px] font-semibold text-[#8944ab]">Discussion d&apos;équipe</p>
              <h3 className="mt-2 text-[28px] font-bold leading-tight tracking-[-0.025em]">Ton Discord, intégré.</h3>
              <div className="mt-6 flex flex-col gap-2">
                <div className="max-w-[85%] self-start rounded-[18px] rounded-bl-md bg-white px-3.5 py-2.5 text-sm">Nouveau défi « fin de mois » demain !</div>
                <div className="max-w-[85%] self-end rounded-[18px] rounded-br-md bg-accent px-3.5 py-2.5 text-sm text-white">Je prends le moment sur les abonnements</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ——— ANTI-FRAUDE ——— */}
      <section id="fraude" className="bleed bg-black px-[22px] py-24 text-center text-[#f5f5f7] sm:py-28">
        <p className="text-[19px] font-semibold text-[#ff453a]">Anti-fraude</p>
        <h2 className="mx-auto mt-2.5 max-w-[820px] text-[40px] font-bold leading-[1.05] tracking-[-0.04em] sm:text-[64px]">Chaque vue passe au détecteur.</h2>
        <p className="mx-auto mt-4 max-w-[620px] text-[19px] leading-snug text-[#a1a1a6] sm:text-[21px]">
          Pics brutaux, vues sans likes, audience hors cible, vidéo réclamée. Chaque clip suspect est expliqué, et n&apos;est jamais payé sans ton accord.
        </p>
        <div className="mx-auto mt-14 h-[300px] max-w-[1080px] overflow-hidden rounded-[28px] bg-[#0b0b0d] sm:h-[460px]">
          <Visual src={IMAGES.antiFraude} alt="Des particules lumineuses filtrées, les rouges sont arrêtées" fallback={<FraudCurve />} />
        </div>
        <div className="mx-auto mt-10 grid max-w-[1080px] gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Pic brutal", "+44 845 vues en 1 h, 221× le rythme du clip"],
            ["Vues sans engagement", "Les vues montent, les likes ne bougent pas"],
            ["Audience hors cible", "Contenu français vu hors francophonie"],
            ["Vidéo réclamée", "Code absent de la description"],
          ].map(([t, d]) => (
            <div key={t} className="rounded-[20px] bg-[#1c1c1e] p-[22px]"><div className="text-[17px] font-semibold">{t}</div><div className="mt-1.5 text-sm text-[#a1a1a6]">{d}</div></div>
          ))}
        </div>
      </section>

      {/* ——— CLIPPEURS ——— */}
      <section id="clippeurs" className="bleed bg-white px-[22px] py-24 sm:py-28">
        <div className="mx-auto flex max-w-[1080px] flex-wrap items-center gap-14">
          <div className="h-[460px] min-w-0 flex-[1_1_440px] overflow-hidden rounded-[28px] bg-paper sm:h-[560px]">
            <Visual src={IMAGES.clippeuse} alt="Une créatrice qui filme un clip vertical" fallback={<ClipperPhone />} />
          </div>
          <div className="min-w-0 flex-[1_1_380px]">
            <p className="text-[17px] font-semibold text-ok">Pour les clippeurs</p>
            <h2 className={`mt-2.5 ${H2}`}>Des apps te paient à la vue.</h2>
            <p className="mt-4 text-[19px] leading-relaxed text-zinc-500">
              Postule aux missions, suis tes vues et tes gains en temps réel, et construis une réputation vérifiée qui te suit d&apos;équipe en équipe. Gratuit.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-6">
              <Link href="/offres" className="inline-flex rounded-full bg-ink px-[22px] py-3 text-[17px] font-medium text-white hover:bg-black">Voir les missions</Link>
              <Link href="/inscription?role=clippeur" className="text-[17px] text-brand-700 hover:underline">Créer mon profil ›</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ——— TARIFS ——— */}
      <section id="tarifs" className="bleed scroll-mt-16 bg-paper px-[22px] py-24 sm:py-28">
        <div className="mx-auto max-w-[1080px] text-center">
          <h2 className={H2}>Un abonnement.<br /><span className="text-zinc-400">Zéro commission.</span></h2>
          <div className="mt-14 grid gap-5 text-left md:grid-cols-3">
            {Object.entries(PLANS).map(([k, p]) => {
              const featured = k === "PRO";
              return (
                <div key={k} className={`flex flex-col gap-4 rounded-[28px] bg-white p-9 ${featured ? "ring-2 ring-accent" : ""}`}>
                  <div className="flex items-center justify-between"><span className="text-[21px] font-semibold">{p.label}</span>{featured && <span className="text-xs font-semibold text-accent">Le plus choisi</span>}</div>
                  <div><span className="text-[48px] font-bold tracking-[-0.03em]">{p.priceEur} €</span><span className="text-zinc-500"> /mois</span></div>
                  <div className="text-[15px] leading-7 text-zinc-600">
                    {Number.isFinite(p.maxClippers) ? `Jusqu'à ${p.maxClippers} clippeurs` : "Clippeurs illimités"}<br />
                    {k === "STARTER" ? "Suivi, anti-fraude, paiements" : k === "PRO" ? "Coût par téléchargement, lien intelligent" : "Plusieurs apps ou clients"}
                  </div>
                  <Link href={startHref} className={`mt-auto rounded-full py-3 text-center font-medium ${featured ? "bg-accent text-white hover:bg-accent-2" : "bg-zinc-200 text-ink hover:bg-zinc-300"}`}>Commencer</Link>
                </div>
              );
            })}
          </div>
          <p className="mt-6 text-[15px] text-zinc-500">Exemple : tu verses 3 000 € par mois à tes clippeurs. Une plateforme qui prend 20 % te coûte 600 €. Ici, 99 €.</p>
        </div>
      </section>

      {/* ——— FAQ ——— */}
      <section className="bleed bg-white px-[22px] py-24">
        <div className="mx-auto max-w-[820px]">
          <h2 className="text-center text-[40px] font-bold tracking-[-0.035em]">Questions fréquentes</h2>
          <div className="mt-10 divide-y divide-zinc-200 border-y border-zinc-200">
            {faq.map(([q, a]) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[19px] font-semibold">
                  {q}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-paper text-zinc-600 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-[17px] leading-relaxed text-zinc-600">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ——— APPEL FINAL ——— */}
      <section className="bleed overflow-hidden bg-black px-[22px] pt-24 text-center text-[#f5f5f7] sm:pt-28">
        <h2 className="mx-auto max-w-[820px] text-[40px] font-bold leading-[1.05] tracking-[-0.04em] sm:text-[64px]">Ton app mérite mieux qu&apos;un tableur.</h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
          <Link href={startHref} className="btn-lime">Commencer gratuitement</Link>
          <Link href="/offres" className="text-[17px] text-[#2997ff] hover:underline">Je cherche des missions ›</Link>
        </div>
        <div className="mx-auto mt-16 h-[260px] max-w-[760px] overflow-hidden rounded-t-[28px] sm:h-[380px]">
          <Visual src={IMAGES.cta} alt="Un smartphone sur une surface noire" fallback={<CtaGlow />} />
        </div>
      </section>
    </div>
  );
}
