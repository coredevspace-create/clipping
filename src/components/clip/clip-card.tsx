import Link from "next/link";
import { compact, dateFr, euros } from "@/lib/format";
import { platformLabel } from "@/lib/marketplace";
import { StatusBadge } from "../ui";
import { PlatformIcon } from "./platform-icon";
import { Thumb } from "./thumb";

export type CardClip = {
  id: string;
  platform: string;
  url: string;
  status: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  fraudScore: number;
  thumbnailUrl: string | null;
  authorHandle: string | null;
  ownershipVerified: boolean | null;
  createdAt: Date;
};

/** Carte visuelle d'un clip (format vertical), utilisée côté créateur et côté clippeur. */
export function ClipCard({
  clip,
  href,
  who,
  threshold,
  earnings,
  cap,
  actions,
}: {
  clip: CardClip;
  href: string;
  who?: string;
  threshold: number;
  earnings?: number;
  cap?: number;
  actions?: React.ReactNode;
}) {
  const eng = clip.views ? ((clip.likes + clip.comments + clip.shares) / clip.views) * 100 : 0;
  const suspect = clip.status === "FLAGGED";
  return (
    <div className={`group flex flex-col overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-0.5 hover:shadow-lg ${suspect ? "border-coral/60 ring-1 ring-coral/40" : "border-ink/10"}`}>
      <Link href={href} className="relative block aspect-[9/14] overflow-hidden bg-ink" target={href.startsWith("http") ? "_blank" : undefined}>
        <Thumb src={clip.thumbnailUrl} platform={clip.platform} alt={`Clip ${platformLabel(clip.platform)}`} />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2.5">
          <span className="rounded-lg bg-white/80 p-1 backdrop-blur"><PlatformIcon platform={clip.platform} size={20} /></span>
          <StatusBadge status={clip.status} />
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 pt-10 text-paper">
          <div className="text-[28px] font-bold leading-none tracking-[-0.03em]">{compact(clip.views)}</div>
          <div className="mt-1 flex items-center gap-2 text-[12px] font-medium text-white/80">
            <span>vues</span>·<span>{clip.views ? `${eng.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} % engag.` : "—"}</span>
          </div>
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="truncate font-semibold">{who ?? clip.authorHandle ?? platformLabel(clip.platform)}</span>
          <span className="shrink-0 text-[12px] text-zinc-500">{dateFr(clip.createdAt)}</span>
        </div>
        <div className="flex items-center justify-between gap-2 whitespace-nowrap text-xs">
          {clip.ownershipVerified === true ? (
            <span className="font-semibold text-ok">✓ vérifié</span>
          ) : clip.ownershipVerified === false ? (
            <span className="font-semibold text-coral">Pas son compte</span>
          ) : (
            <span className="text-zinc-400">Non vérifié</span>
          )}
          <FraudMeter score={clip.fraudScore} threshold={threshold} />
        </div>
        {earnings !== undefined && cap !== undefined && (
          <div>
            <div className="flex justify-between text-xs"><span className="font-semibold">{euros(earnings)}</span><span className="text-zinc-500">max {euros(cap)}</span></div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink/10">
              <div className="h-full rounded-full bg-lime" style={{ width: `${Math.min(100, cap ? (earnings / cap) * 100 : 0)}%` }} />
            </div>
          </div>
        )}
        {actions && <div className="mt-auto flex gap-1.5 pt-1">{actions}</div>}
      </div>
    </div>
  );
}

function FraudMeter({ score, threshold }: { score: number; threshold: number }) {
  const tone = score >= threshold ? "bg-coral" : score >= threshold / 2 ? "bg-[#ff9f0a]" : "bg-lime";
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-zinc-500" title={`Score anti-fraude : ${score}/100`}>
      fraude
      <span className="relative h-1.5 w-10 overflow-hidden rounded-full bg-ink/10"><span className={`absolute inset-y-0 left-0 ${tone}`} style={{ width: `${Math.max(score, 4)}%` }} /></span>
      <span className="text-ink">{score}</span>
    </span>
  );
}
