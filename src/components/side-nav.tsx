"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; exact?: boolean };
type App = { id: string; name: string; color: string };

/** Barre latérale de l'espace créateur : les apps, puis les rubriques de l'app ouverte. Empilée sur mobile. */
export function SideNav({ apps, current, items }: { apps: App[]; current: string; items: Item[] }) {
  const path = usePathname();
  return (
    <aside className="w-full shrink-0 lg:sticky lg:top-[76px] lg:w-56 lg:self-start">
      <div className="mb-5 hidden lg:block">
        <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Mes apps</div>
        {apps.map((a) => (
          <Link
            key={a.id}
            href={`/app/e/${a.id}`}
            className={`flex items-center gap-2.5 rounded-[10px] px-2 py-1.5 text-sm ${a.id === current ? "bg-zinc-200/70 font-semibold text-ink" : "text-zinc-700 hover:bg-black/[0.04]"}`}
          >
            <span className="h-5 w-5 shrink-0 rounded-md" style={{ background: a.color }} />
            <span className="truncate">{a.name}</span>
          </Link>
        ))}
        <Link href="/app/nouvelle-equipe" className="flex items-center gap-2.5 rounded-[10px] px-2 py-1.5 text-sm text-brand-700 hover:bg-black/[0.04]">
          <span className="grid h-5 w-5 place-items-center rounded-md bg-brand-100 text-xs">+</span> Nouvelle app
        </Link>
      </div>
      <nav className="flex gap-1 overflow-x-auto rounded-[12px] bg-zinc-200/70 p-1 lg:flex-col lg:gap-0.5 lg:bg-transparent lg:p-0">
        {items.map((i) => {
          const active = i.exact ? path === i.href : path.startsWith(i.href);
          return (
            <Link
              key={i.href}
              href={i.href}
              className={`whitespace-nowrap rounded-[8px] px-3 py-1.5 text-[13px] font-medium lg:rounded-[10px] lg:px-2.5 lg:py-2 lg:text-sm ${
                active ? "bg-white text-accent shadow-[0_1px_3px_rgba(0,0,0,0.08)]" : "text-zinc-600 hover:text-ink lg:hover:bg-black/[0.04]"
              }`}
            >
              {i.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
