import { SideNav } from "@/components/side-nav";
import { requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { productOf } from "@/lib/product";

const APP_COLORS = ["#34c759", "#5e5ce6", "#ff9f0a", "#0071e3", "#ff375f", "#30b0c7", "#bf5af2"];
const colorFor = (id: string) => APP_COLORS[[...id].reduce((s, c) => s + c.charCodeAt(0), 0) % APP_COLORS.length];

export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, workspace } = await requireOwner(id);
  const apps = await db.workspace.findMany({ where: { ownerId: user.id }, select: { id: true, name: true }, orderBy: { createdAt: "asc" } });
  const base = `/app/e/${id}`;
  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
      <SideNav
        current={id}
        apps={apps.map((a) => ({ ...a, color: colorFor(a.id) }))}
        items={[
          { href: base, label: "Clips", exact: true },
          { href: `${base}/discussion`, label: "Discussion" },
          { href: `${base}/clippeurs`, label: "Clippeurs" },
          { href: `${base}/annonce`, label: "Recrutement" },
          { href: `${base}/sources`, label: "Moments à clipper" },
          { href: `${base}/paiements`, label: "Paiements" },
          { href: `${base}/reglages`, label: "Réglages" },
        ]}
      />
      <div className="min-w-0 flex-1">
        <div className="mb-6 flex items-center gap-3">
          <span className="h-10 w-10 shrink-0 rounded-[11px]" style={{ background: colorFor(id) }} />
          <div className="min-w-0">
            <div className="text-[13px] font-medium text-zinc-500">{productOf(workspace.productType).label}</div>
            <h1 className="text-[28px] font-bold leading-tight tracking-[-0.035em] sm:text-[40px]">{workspace.name}</h1>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
