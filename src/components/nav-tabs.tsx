"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavTabs({ items }: { items: { href: string; label: string; exact?: boolean }[] }) {
  const path = usePathname();
  return (
    <nav className="mb-8 inline-flex max-w-full gap-0.5 overflow-x-auto rounded-[10px] bg-zinc-200/80 p-[3px]">
      {items.map((i) => {
        const active = i.exact ? path === i.href : path.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            className={`whitespace-nowrap rounded-[8px] px-4 py-1.5 text-[13px] font-medium transition ${
              active ? "bg-white text-ink shadow-[0_1px_3px_rgba(0,0,0,0.12)]" : "text-zinc-600 hover:text-ink"
            }`}
          >
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
