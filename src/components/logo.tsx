import { APP_NAME } from "@/lib/config";

/** Marque : une claquette de montage coupée en biais par le trait citron. */
export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden>
        <rect width="30" height="30" rx="8" fill={dark ? "#d2ff3c" : "#0d0d0f"} />
        <path d="M7 10h16M7 15h16M7 20h9" stroke={dark ? "#0d0d0f" : "#f4f1ea"} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M18 23 25 6" stroke={dark ? "#ff5a36" : "#d2ff3c"} strokeWidth="2.6" strokeLinecap="round" />
      </svg>
      <span className={`font-display text-lg font-extrabold tracking-tight ${dark ? "text-paper" : "text-ink"}`}>{APP_NAME.toLowerCase()}</span>
    </span>
  );
}
