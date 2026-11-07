import Link from "next/link";
import { Avatar, Chips, FilterBar, platformChips, ReputationLine } from "@/components/market";
import { Empty, PageTitle } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NICHES, reputations, splitCsv } from "@/lib/marketplace";

export const metadata = { title: "Annuaire des clippeurs" };

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; niche?: string; plateforme?: string }> }) {
  await requireUser();
  const sp = await searchParams;
  const q = sp.q?.trim();
  const profiles = await db.clipperProfile.findMany({
    where: {
      available: true,
      ...(sp.niche ? { niches: { contains: sp.niche } } : {}),
      ...(sp.plateforme ? { platforms: { contains: sp.plateforme } } : {}),
      ...(q ? { OR: [{ headline: { contains: q, mode: "insensitive" } }, { bio: { contains: q, mode: "insensitive" } }, { user: { name: { contains: q, mode: "insensitive" } } }] } : {}),
    },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
  const reps = await reputations(profiles.map((p) => p.userId));
  // les clippeurs vérifiés d'abord
  profiles.sort((a, b) => reps.get(b.userId)!.verifiedViews - reps.get(a.userId)!.verifiedViews);

  return (
    <div>
      <PageTitle title="Annuaire des clippeurs" subtitle="Des clippeurs disponibles, avec leurs statistiques vérifiées sur la plateforme. Invite-les dans ton équipe." />
      <FilterBar action="/clippeurs" q={sp.q} name="niche" value={sp.niche} options={NICHES} platform={sp.plateforme} />
      {profiles.length === 0 ? (
        <Empty>Aucun clippeur ne correspond. Publie une annonce : les clippeurs viendront à toi.</Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((p) => (
            <Link key={p.id} href={`/clippeurs/${p.userId}`} className="card flex flex-col gap-3 transition hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <Avatar name={p.user.name} />
                <div className="min-w-0">
                  <div className="font-semibold">{p.user.name}</div>
                  <div className="truncate text-sm text-zinc-600">{p.headline}</div>
                </div>
              </div>
              <Chips items={splitCsv(p.niches)} tone="brand" />
              <Chips items={platformChips(p.platforms)} />
              <ReputationLine r={reps.get(p.userId)!} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
