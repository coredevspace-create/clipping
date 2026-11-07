"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavTabs({ items }: { items: { href: string; label: string; exact?: boolean }[] }) {
  const path = usePathname();
  return (
    <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-zinc-200">
      {items.map((i) => {
        const active = i.exact ? path === i.href : path.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium ${
              active ? "border-brand-600 text-brand-700" : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
