"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavTabs({ items }: { items: { href: string; label: string; exact?: boolean }[] }) {
  const path = usePathname();
  return (
    <nav className="mb-8 flex gap-1 overflow-x-auto rounded-full border border-ink/10 bg-white p-1">
      {items.map((i) => {
        const active = i.exact ? path === i.href : path.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
              active ? "bg-ink text-paper" : "text-zinc-600 hover:bg-ink/5 hover:text-ink"
            }`}
          >
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
