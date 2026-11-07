"use client";

import { useRef, useState } from "react";

const LINE = "#5a7a00"; // validé : contraste ≥ 3:1 sur fond blanc
const FILL = "#d2ff3c";

/** Courbe d'une seule série (pas de légende : le titre la nomme), avec réticule et infobulle au survol. */
export function AreaChart({ points, label = "vues", withTime = false }: { points: { date: string; value: number }[]; label?: string; withTime?: boolean }) {
  const [hover, setHover] = useState<number | null>(null);
  const ref = useRef<SVGSVGElement>(null);
  const W = 640, H = 200, L = 44, R = 12, T = 12, B = 26;
  const max = niceMax(Math.max(...points.map((p) => p.value), 1));
  const t0 = +new Date(points[0]?.date ?? 0), t1 = +new Date(points.at(-1)?.date ?? 0);
  const x = (i: number) =>
    withTime && t1 > t0
      ? L + ((+new Date(points[i].date) - t0) / (t1 - t0)) * (W - L - R)
      : L + (i / Math.max(points.length - 1, 1)) * (W - L - R);
  const y = (v: number) => T + (1 - v / max) * (H - T - B);
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const area = `${line} L${x(points.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
  const fmt = (n: number) => n.toLocaleString("fr-FR", { notation: "compact", maximumFractionDigits: 1 });
  const ticks = [0, max / 2, max];
  const day = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  const short = (iso: string) =>
    withTime && t1 - t0 < 2 * 86_400_000
      ? new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit" }).replace(":00", " h")
      : day(iso);
  const full = (iso: string) => (withTime ? new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : day(iso));

  const onMove = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    // point le plus proche horizontalement
    let best = 0;
    for (let i = 1; i < points.length; i++) if (Math.abs(x(i) - px) < Math.abs(x(best) - px)) best = i;
    setHover(best);
  };
  const h = hover !== null ? points[hover] : null;

  return (
    <div className="relative">
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="h-52 w-full touch-none select-none" onPointerMove={onMove} onPointerLeave={() => setHover(null)} role="img" aria-label={`Évolution des ${label}`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#0d0d0f" strokeOpacity={t === 0 ? 0.2 : 0.07} />
            <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#7a7366" fontFamily="var(--font-jetbrains)">{fmt(t)}</text>
          </g>
        ))}
        {[0, Math.floor((points.length - 1) / 2), points.length - 1].map((i) => (
          <text key={i} x={x(i)} y={H - 6} textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"} fontSize="11" fill="#7a7366">{short(points[i].date)}</text>
        ))}
        <path d={area} fill={FILL} fillOpacity={0.35} />
        <path d={line} fill="none" stroke={LINE} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {h && hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={T} y2={y(0)} stroke="#0d0d0f" strokeOpacity={0.25} strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(h.value)} r={5} fill={LINE} stroke="#fff" strokeWidth={2} />
          </g>
        )}
        <rect x={L} y={T} width={W - L - R} height={H - T - B} fill="transparent" />
      </svg>
      {h && hover !== null && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-xl bg-ink px-3 py-2 text-xs text-paper shadow-lg"
          style={{ left: `${(x(hover) / W) * 100}%` }}
        >
          <div className="text-paper/60">{full(h.date)}</div>
          <div className="font-display text-base font-bold">{h.value.toLocaleString("fr-FR")} {label}</div>
        </div>
      )}
    </div>
  );
}

function niceMax(v: number) {
  const p = 10 ** Math.floor(Math.log10(v));
  return Math.ceil(v / p) * p;
}
