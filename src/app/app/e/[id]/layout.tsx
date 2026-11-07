import { NavTabs } from "@/components/nav-tabs";
import { requireOwner } from "@/lib/auth";

export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { workspace } = await requireOwner(id);
  const base = `/app/e/${id}`;
  return (
    <div>
      <div className="eyebrow text-zinc-500">Équipe</div>
      <h1 className="mb-6 mt-2 font-display text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">{workspace.name}</h1>
      <NavTabs
        items={[
          { href: base, label: "Clips", exact: true },
          { href: `${base}/discussion`, label: "💬 Discussion" },
          { href: `${base}/clippeurs`, label: "Clippeurs" },
          { href: `${base}/annonce`, label: "Annonce & recrutement" },
          { href: `${base}/sources`, label: "Moments à clipper" },
          { href: `${base}/paiements`, label: "Paiements" },
          { href: `${base}/reglages`, label: "Réglages" },
        ]}
      />
      {children}
    </div>
  );
}
