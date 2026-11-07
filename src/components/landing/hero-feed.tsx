/** Maquette animée du produit : des clips arrivent, l'un est détecté comme gonflé par des bots. */
const rows = [
  { who: "Léa", p: "TikTok", v: "17 819", e: "142 DL", ok: true },
  { who: "Sami", p: "TikTok", v: "51 060", e: "0 DL", ok: false },
  { who: "Noah", p: "Reels", v: "16 101", e: "96 DL", ok: true },
  { who: "Inès", p: "Shorts", v: "9 204", e: "71 DL", ok: true },
];

export function HeroFeed() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 -z-10 rounded-[40px] bg-lime/10 blur-2xl" />
      <div className="rotate-[1.5deg] rounded-3xl border border-paper/10 bg-ink-2 p-4 shadow-2xl shadow-black/50">
        <div className="mb-3 flex items-center justify-between px-1">
          <span className="eyebrow text-paper/60">Budgie · clips du jour</span>
          <span className="eyebrow flex items-center gap-1.5 text-coral">
            <span className="h-2 w-2 animate-blink rounded-full bg-coral" />
            live
          </span>
        </div>
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div
              key={r.who}
              className={`reveal flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm text-paper ${r.ok ? "bg-paper/5" : "bg-coral/15 ring-1 ring-coral/60"}`}
              style={{ animationDelay: `${0.3 + i * 0.25}s` }}
            >
              <span className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-paper/10 font-mono text-[11px]">{r.who[0]}</span>
                <span className="font-medium">{r.who}</span>
                <span className="text-paper/50">· {r.p}</span>
              </span>
              <span className="flex items-center gap-3 font-mono text-xs">
                <span>{r.v} vues</span>
                <span className="hidden text-paper/50 sm:inline">{r.e}</span>
                {r.ok ? (
                  <span className="rounded-full bg-lime px-2 py-0.5 font-semibold text-ink">OK</span>
                ) : (
                  <span className="rounded-full bg-coral px-2 py-0.5 font-semibold text-white">BOTS</span>
                )}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-paper/5 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="eyebrow text-paper/60">Courbe · clip de Sami</span>
            <span className="font-mono text-xs font-semibold text-coral">score 90/100</span>
          </div>
          <svg viewBox="0 0 300 90" className="h-24 w-full" aria-hidden>
            <path className="draw" d="M0 86 C40 70 80 58 120 52 S220 44 300 42" fill="none" stroke="#d2ff3c" strokeWidth="2" strokeDasharray="4 5" opacity=".7" />
            <path className="draw" d="M0 86 C30 80 50 74 70 70 S110 64 125 62 L128 14 C150 12 200 11 300 10" fill="none" stroke="#ff5a36" strokeWidth="2.5" />
            <text x="134" y="32" fill="#ff5a36" fontSize="10" fontFamily="var(--font-jetbrains)">+44 845 vues en 1 h · 0 like</text>
            <text x="196" y="60" fill="#d2ff3c" fontSize="9" fontFamily="var(--font-jetbrains)" opacity=".8">courbe organique</text>
          </svg>
        </div>
      </div>
      <div className="absolute -bottom-6 -left-4 hidden -rotate-3 rounded-2xl bg-lime px-4 py-3 text-ink shadow-xl sm:block">
        <div className="eyebrow">Coût par téléchargement</div>
        <div className="font-display text-2xl font-extrabold">0,36 €</div>
      </div>
    </div>
  );
}
