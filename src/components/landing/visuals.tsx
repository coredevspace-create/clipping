/**
 * Visuels de remplacement en code, affichés tant que les images générées ne sont pas ajoutées.
 * Ils doivent tenir seuls : le site reste présentable sans aucune image.
 */

function Phone({ className = "", tone, children }: { className?: string; tone: string; children?: React.ReactNode }) {
  return (
    <div className={`relative aspect-[9/19] w-[34%] max-w-[230px] rounded-[38px] bg-[#1d1d1f] p-[7px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.35)] ${className}`}>
      <div className="relative h-full w-full overflow-hidden rounded-[32px]" style={{ background: tone }}>
        <div className="absolute left-1/2 top-2 h-5 w-20 -translate-x-1/2 rounded-full bg-black/80" />
        {children}
      </div>
    </div>
  );
}

const VideoChrome = ({ who }: { who: string }) => (
  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
    <div className="mb-2 h-1 w-full overflow-hidden rounded-full bg-white/30"><div className="h-full w-1/3 bg-white" /></div>
    <div className="text-[13px] font-semibold">{who}</div>
    <div className="mt-1 h-2 w-3/4 rounded-full bg-white/40" />
  </div>
);

/** IMG-01 : trois téléphones en éventail. */
export function HeroPhones() {
  return (
    <div className="relative flex h-full items-end justify-center gap-0 pb-6">
      <Phone className="z-0 -mr-6 -rotate-[8deg] translate-y-6" tone="linear-gradient(160deg,#ffd1dc,#ff8fab 60%,#c9184a)"><VideoChrome who="@lea.clips" /></Phone>
      <Phone className="z-10" tone="linear-gradient(170deg,#e0f2ff,#7cc4ff 55%,#0071e3)">
        <div className="absolute inset-x-5 top-16 space-y-2">
          <div className="h-16 rounded-2xl bg-white/85" />
          <div className="flex gap-2"><div className="h-14 flex-1 rounded-2xl bg-white/70" /><div className="h-14 flex-1 rounded-2xl bg-white/70" /></div>
          <div className="flex h-20 items-end gap-1.5 rounded-2xl bg-white/85 p-3">
            {[40, 65, 30, 80, 55, 90].map((h, i) => <div key={i} className="flex-1 rounded-sm bg-accent" style={{ height: `${h}%` }} />)}
          </div>
        </div>
        <VideoChrome who="@noah.apps" />
      </Phone>
      <Phone className="z-0 -ml-6 rotate-[8deg] translate-y-6" tone="linear-gradient(160deg,#d8f5e0,#7ee2a8 55%,#248a3d)"><VideoChrome who="@sami.tech" /></Phone>
    </div>
  );
}

/** IMG-02 : le chaos de Discord et du tableur. */
export function ChaosStack() {
  const msgs = [
    ["Léa", "voilà mon lien tiktok.com/@lea/vid…", "21:04"],
    ["Sami", "t'as vu mes 50k vues ?? tu me dois 60 €", "21:11"],
    ["Noah", "c'est quel clip déjà ? je retrouve plus", "21:19"],
    ["Inès", "j'ai posté le même moment que Léa 😬", "21:26"],
    ["Sami", "tu paies quand ?", "21:40"],
  ];
  return (
    <div className="relative flex h-full flex-col justify-center gap-3 overflow-hidden p-8">
      {msgs.map(([who, text, t], i) => (
        <div key={i} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.06)]" style={{ transform: `rotate(${[-1.5, 1, -0.5, 1.5, -1][i]}deg) translateX(${[0, 14, -8, 10, 4][i]}px)` }}>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-b from-[#a1a1a6] to-[#8e8e93] text-xs font-semibold text-white">{who[0]}</span>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between text-[13px]"><span className="font-semibold">{who}</span><span className="text-zinc-400">{t}</span></div>
            <div className="truncate text-[14px] text-zinc-600">{text}</div>
          </div>
        </div>
      ))}
      <div className="absolute right-6 top-6 grid h-9 w-9 place-items-center rounded-full bg-coral text-sm font-bold text-white">47</div>
    </div>
  );
}

/** IMG-03 : un lien, le bon store. */
export function SmartLinkRows() {
  const rows = [
    ["iPhone", "App Store"],
    ["Android", "Play Store"],
    ["Ordinateur", "Ton site"],
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 p-6">
      <div className="mb-2 rounded-full bg-white/10 px-4 py-2.5 text-center font-mono text-sm text-white">clipsquad.fr/r/lea</div>
      {rows.map(([d, to]) => (
        <div key={d} className="flex items-center justify-between rounded-2xl bg-white/[0.08] px-4 py-3 text-[15px] text-white">
          <span className="text-zinc-300">{d}</span>
          <span className="text-zinc-500">→</span>
          <span className="font-semibold">{to}</span>
        </div>
      ))}
    </div>
  );
}

/** IMG-04 : la courbe d'un clip botté, vue par le détecteur. */
export function FraudCurve() {
  return (
    <div className="relative h-full w-full p-8">
      <svg viewBox="0 0 800 360" className="h-full w-full" role="img" aria-label="Courbe d'un clip avec un pic de vues artificielles détecté">
        {[60, 150, 240, 330].map((y) => <line key={y} x1="0" x2="800" y1={y} y2={y} stroke="#ffffff" strokeOpacity="0.06" />)}
        <path d="M0 330 C80 300 140 280 210 268 S330 250 380 246 L392 70 C460 64 600 60 800 58" fill="none" stroke="#ff453a" strokeWidth="3" />
        <path d="M0 330 C120 270 240 230 360 214 S620 190 800 184" fill="none" stroke="#2997ff" strokeWidth="2.5" strokeDasharray="6 7" />
        <circle cx="392" cy="70" r="7" fill="#ff453a" />
        <rect x="412" y="40" width="300" height="56" rx="16" fill="#1c1c1e" />
        <text x="432" y="65" fill="#ff453a" fontSize="16" fontWeight="600">+44 845 vues en 1 h</text>
        <text x="432" y="85" fill="#a1a1a6" fontSize="14">0 like supplémentaire · score 90/100</text>
        <text x="600" y="210" fill="#2997ff" fontSize="14">courbe organique</text>
      </svg>
    </div>
  );
}

/** IMG-05 : l'espace d'un clippeur sur téléphone. */
export function ClipperPhone() {
  return (
    <div className="flex h-full items-center justify-center bg-gradient-to-b from-[#e3f5e8] to-[#f5f5f7] p-8">
      <div className="aspect-[9/19] w-[62%] max-w-[260px] rounded-[40px] bg-[#1d1d1f] p-[7px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.35)]">
        <div className="flex h-full flex-col gap-3 overflow-hidden rounded-[34px] bg-[#f2f2f7] p-4 pt-10">
          <div className="text-[11px] font-medium text-zinc-500">Budgie</div>
          <div className="rounded-2xl bg-white p-3">
            <div className="text-[11px] text-zinc-500">À recevoir</div>
            <div className="text-2xl font-bold tracking-tight">31,39 €</div>
            <div className="mt-1 text-[11px] text-zinc-500">43 986 vues · 173 téléch.</div>
          </div>
          <div className="rounded-2xl bg-[#1d1d1f] p-3 text-white">
            <div className="text-[10px] text-zinc-400">Ton code</div>
            <div className="font-mono text-base font-bold">#csxuds</div>
          </div>
          {[27, 26, 13].map((w, i) => (
            <div key={i} className="flex items-center gap-2 rounded-2xl bg-white p-2.5">
              <div className="h-9 w-7 rounded-md bg-gradient-to-b from-[#d1d1d6] to-[#aeaeb2]" />
              <div className="flex-1"><div className="h-2 w-2/3 rounded-full bg-zinc-200" /><div className="mt-1.5 h-1 rounded-full bg-zinc-100"><div className="h-1 rounded-full bg-lime" style={{ width: `${w * 3}%` }} /></div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** IMG-06 : halo lumineux de fin de page. */
export function CtaGlow() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute left-1/2 top-[30%] h-[140%] w-[70%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(41,151,255,0.45),rgba(94,92,230,0.25)_45%,transparent_75%)] blur-2xl" />
      <div className="absolute bottom-0 left-1/2 aspect-[9/19] w-[150px] -translate-x-1/2 translate-y-[45%] rounded-[32px] bg-[#1d1d1f] p-[6px] shadow-[0_0_60px_rgba(41,151,255,0.35)] ring-1 ring-white/20">
        <div className="h-full w-full rounded-[27px] bg-gradient-to-b from-[#2997ff] via-[#5e5ce6] to-[#1d1d1f]" />
      </div>
    </div>
  );
}
