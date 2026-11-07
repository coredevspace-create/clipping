"use client";

import { useRef, useState } from "react";

/**
 * Section anti-fraude : l'histoire d'un clip « botté » en deux petits graphiques empilés
 * qui partagent la même échelle de temps (vues en haut, likes en bas — jamais deux axes sur un graphique),
 * plus la carte de verdict. Couleurs validées sur le fond #1c1c1e (contraste ≥ 3:1, distinctes en daltonisme).
 */
const BLUE = "#2997ff";
const RED = "#ff453a";
const GREY = "#a1a1a6";

const SPIKE = 10; // heure de l'injection de vues
const DATA = Array.from({ length: 25 }, (_, h) => {
  const organic = Math.round(9000 * (1 - Math.exp(-h / 6)));
  const bots = h >= SPIKE ? 44_845 + (h - SPIKE) * 120 : 0;
  return { h, views: organic + bots, likes: Math.round(organic * 0.052) };
});

const L = 44;
const R = 12;
const fmt = (n: number) => n.toLocaleString("fr-FR", { notation: "compact", maximumFractionDigits: 1 });
const xOf = (W: number) => (h: number) => L + (h / 24) * (W - L - R);

function Panel({
  W,
  title,
  values,
  max,
  height,
  color,
  hover,
  spikeLabel,
}: {
  W: number;
  title: string;
  values: number[];
  max: number;
  height: number;
  color: string;
  hover: number | null;
  spikeLabel?: boolean;
}) {
  const x = xOf(W);
  const T = 28;
  const B = 8;
  const y = (v: number) => T + (1 - v / max) * (height - T - B);
  const line = values.map((v, h) => `${h ? "L" : "M"}${x(h).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const ticks = [0, max / 2, max];
  return (
    <g>
      <text x={L} y={14} fill="#f5f5f7" fontSize="13" fontWeight="600">{title}</text>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#ffffff" strokeOpacity={t === 0 ? 0.18 : 0.06} />
          <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#8e8e93">{fmt(t)}</text>
        </g>
      ))}
      <path d={`${line} L${x(24)},${y(0)} L${x(0)},${y(0)} Z`} fill={color} fillOpacity={0.08} />
      <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {spikeLabel && (
        <>
          {/* le segment de l'injection, en rouge */}
          <path d={`M${x(SPIKE - 1)},${y(values[SPIKE - 1])} L${x(SPIKE)},${y(values[SPIKE])}`} stroke={RED} strokeWidth={3} strokeLinecap="round" />
          <circle cx={x(SPIKE)} cy={y(values[SPIKE])} r={5} fill={RED} stroke="#1c1c1e" strokeWidth={2} />
          <text x={x(SPIKE) + 12} y={y(values[SPIKE]) + 18} fill={RED} fontSize="13" fontWeight="600">+44 845 vues en 1 h</text>
        </>
      )}
      {hover !== null && (
        <circle cx={x(hover)} cy={y(values[hover])} r={4.5} fill={color} stroke="#1c1c1e" strokeWidth={2} />
      )}
    </g>
  );
}

/** Le graphique pour une largeur donnée (une version large, une version téléphone : le texte reste lisible). */
function Chart({ W, hover, setHover }: { W: number; hover: number | null; setHover: (h: number | null) => void }) {
  const ref = useRef<SVGSVGElement>(null);
  const x = xOf(W);
  const narrow = W < 500;
  const VIEWS_H = narrow ? 190 : 230;
  const LIKES_H = narrow ? 110 : 120;
  const GAP = 18;
  const AXIS = 26;
  const H = VIEWS_H + GAP + LIKES_H + AXIS;
  const onMove = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    setHover(Math.max(0, Math.min(24, Math.round(((px - L) / (W - L - R)) * 24))));
  };
  const d = hover !== null ? DATA[hover] : null;
  return (
    <div className="relative">
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none select-none"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label="Vues et likes d'un clip sur 24 heures : à la 10e heure, les vues bondissent de 44 845 en une heure alors que les likes ne bougent presque pas."
      >
        <rect x={x(SPIKE - 1)} y={0} width={x(SPIKE) - x(SPIKE - 1)} height={VIEWS_H + GAP + LIKES_H} fill={RED} fillOpacity={0.1} rx={4} />
        <Panel W={W} title="Vues" values={DATA.map((p) => p.views)} max={60_000} height={VIEWS_H} color={BLUE} hover={hover} spikeLabel />
        <g transform={`translate(0 ${VIEWS_H + GAP})`}>
          <Panel W={W} title="Likes" values={DATA.map((p) => p.likes)} max={600} height={LIKES_H} color={GREY} hover={hover} />
          <text x={x(SPIKE) + 10} y={LIKES_H - 30} fill={RED} fontSize="13" fontWeight="600">quasi aucun like en plus</text>
        </g>
        {(narrow ? [0, 12, 24] : [0, 6, 12, 18, 24]).map((h) => (
          <text key={h} x={x(h)} y={H - 6} textAnchor={h === 0 ? "start" : h === 24 ? "end" : "middle"} fontSize="11" fill="#8e8e93">{h} h</text>
        ))}
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={20} y2={VIEWS_H + GAP + LIKES_H} stroke="#ffffff" strokeOpacity={0.3} strokeDasharray="3 3" />}
        <rect x={L} y={0} width={W - L - R} height={H} fill="transparent" />
      </svg>
      {d && (
        <div
          className="pointer-events-none absolute top-6 z-10 -translate-x-1/2 whitespace-nowrap rounded-xl bg-white px-3 py-2 text-xs text-ink shadow-xl"
          style={{ left: `${Math.min(80, Math.max(20, (x(d.h) / W) * 100))}%` }}
        >
          <div className="text-zinc-500">{d.h} h après publication</div>
          <div className="mt-0.5 font-semibold">{d.views.toLocaleString("fr-FR")} vues</div>
          <div className="font-semibold">{d.likes.toLocaleString("fr-FR")} likes</div>
        </div>
      )}
    </div>
  );
}

export function FraudShowcase() {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="grid gap-4 text-left lg:grid-cols-[1.7fr_1fr]">
      <div className="relative rounded-[28px] bg-[#1c1c1e] p-5 sm:p-7">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <div className="text-[17px] font-semibold text-[#f5f5f7]">Un clip, ses 24 premières heures</div>
          <div className="text-[13px] text-[#8e8e93]">relevé toutes les heures</div>
        </div>
        <div className="hidden sm:block"><Chart W={720} hover={hover} setHover={setHover} /></div>
        <div className="sm:hidden"><Chart W={340} hover={hover} setHover={setHover} /></div>
        <table className="sr-only">
          <caption>Vues et likes par heure</caption>
          <thead><tr><th>Heure</th><th>Vues</th><th>Likes</th></tr></thead>
          <tbody>{DATA.map((p) => <tr key={p.h}><td>{p.h} h</td><td>{p.views}</td><td>{p.likes}</td></tr>)}</tbody>
        </table>
      </div>

      <div className="flex flex-col rounded-[28px] bg-[#1c1c1e] p-6 sm:p-7">
        <div className="text-[13px] font-medium text-[#8e8e93]">Score de fraude</div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-[56px] font-bold leading-none tracking-[-0.04em] text-[#ff453a]">90</span>
          <span className="text-xl font-semibold text-[#8e8e93]">/100</span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[90%] rounded-full bg-[#ff453a]" /></div>
        <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-[#ff453a]/15 px-3 py-1 text-[13px] font-semibold text-[#ff6961]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" /></svg>
          Mis en quarantaine
        </span>
        <ul className="mt-6 space-y-3 text-[15px]">
          {[
            ["+35", "Engagement à 0,2 %"],
            ["+30", "Pic : 221× le rythme du clip"],
            ["+25", "Vues sans likes supplémentaires"],
          ].map(([p, t]) => (
            <li key={t} className="flex items-start gap-3 text-[#f5f5f7]">
              <span className="mt-0.5 w-9 shrink-0 text-right text-[13px] font-semibold tabular-nums text-[#ff6961]">{p}</span>
              {t}
            </li>
          ))}
        </ul>
        <p className="mt-auto pt-6 text-[13px] leading-relaxed text-[#8e8e93]">Ce clip n&apos;est pas payé tant que tu ne l&apos;as pas validé. C&apos;est toujours toi qui décides.</p>
      </div>
    </div>
  );
}
