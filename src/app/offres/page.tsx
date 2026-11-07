import Link from "next/link";
import { Chips, FilterBar, platformChips } from "@/components/market";
import { Empty, PageTitle } from "@/components/ui";
import { db } from "@/lib/db";
import { euros, num } from "@/lib/format";
import { NICHES } from "@/lib/marketplace";
import { productOf } from "@/lib/product";

export const metadata = { title: "Missions de clipping" };

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; niche?: string; plateforme?: string }> }) {
  const sp = await searchParams;
  const q = sp.q?.trim();
  const offers = await db.offer.findMany({
    where: {
      status: "OPEN",
      ...(sp.niche ? { niche: sp.niche } : {}),
      ...(sp.plateforme ? { platforms: { contains: sp.plateforme } } : {}),
      ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }, { workspace: { name: { contains: q, mode: "insensitive" } } }] } : {}),
    },
    include: { workspace: { include: { _count: { select: { memberships: { where: { status: "ACTIVE" } } } } } } },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <PageTitle title="Missions de clipping" subtitle="Des apps et logiciels grand public cherchent des clippeurs. Postule, clippe, sois payé à la vue." />
      <FilterBar action="/offres" q={sp.q} name="niche" value={sp.niche} options={NICHES} platform={sp.plateforme} />
      {offers.length === 0 ? (
        <Empty>Aucune annonce ne correspond pour l&apos;instant.</Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {offers.map((o) => (
            <Link key={o.id} href={`/offres/${o.id}`} className="card flex flex-col gap-3 transition hover:border-brand-500">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-medium text-zinc-500">{o.workspace.name} · {productOf(o.workspace.productType).label}</div>
                  <h2 className="font-display text-lg font-bold">{o.title}</h2>
                </div>
                <div className="whitespace-nowrap text-right">
                  <div className="text-lg font-bold text-brand-700">{euros(o.workspace.cpmCents)}</div>
                  <div className="text-xs text-zinc-500">/ 1 000 vues</div>
                </div>
              </div>
              <p className="line-clamp-2 text-sm text-zinc-600">{o.description}</p>
              <div className="flex flex-wrap items-center gap-2">
                <Chips items={[o.niche]} tone="brand" />
                <Chips items={platformChips(o.platforms)} />
              </div>
              <div className="text-xs text-zinc-500">
                Dès {num(o.workspace.minViews)} vues · max {euros(o.workspace.maxPayoutPerClipCents)} par clip · {o.workspace._count.memberships} clippeur(s) dans l&apos;équipe
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
