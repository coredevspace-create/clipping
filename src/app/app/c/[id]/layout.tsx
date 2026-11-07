import { NavTabs } from "@/components/nav-tabs";
import { requireMember } from "@/lib/auth";

export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { workspace } = await requireMember(id);
  const base = `/app/c/${id}`;
  return (
    <div>
      <div className="text-[13px] font-medium text-zinc-500">Espace clippeur</div>
      <h1 className="mb-6 mt-1 text-[34px] font-bold leading-tight tracking-[-0.035em] sm:text-[40px]">{workspace.name}</h1>
      <NavTabs
        items={[
          { href: base, label: "Mes clips & gains", exact: true },
          { href: `${base}/discussion`, label: "Discussion" },
        ]}
      />
      {children}
    </div>
  );
}
