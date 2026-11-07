import { APP_NAME } from "@/lib/config";

/** Marque : un carré arrondi avec une coupe (le « clip ») et un point (la vue). */
export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
        <rect width="24" height="24" rx="6" fill={dark ? "#f5f5f7" : "#1d1d1f"} />
        <path d="M7 15.5 17 8.5" stroke={dark ? "#1d1d1f" : "#fff"} strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="8" cy="8.5" r="1.8" fill={dark ? "#1d1d1f" : "#fff"} />
      </svg>
      <span className={`text-[17px] font-semibold tracking-[-0.02em] ${dark ? "text-paper" : "text-ink"}`}>{APP_NAME.toLowerCase()}</span>
    </span>
  );
}
