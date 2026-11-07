/** Pastilles de plateforme (glyphes simplifiés, pas les logos officiels). */
export function PlatformIcon({ platform, size = 22 }: { platform: string; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", "aria-hidden": true } as const;
  switch (platform) {
    case "YOUTUBE":
      return (
        <svg {...common}><rect width="24" height="24" rx="6" fill="#ff0033" /><path d="M10 8.5v7l6-3.5z" fill="#fff" /></svg>
      );
    case "TIKTOK":
      return (
        <svg {...common}>
          <rect width="24" height="24" rx="6" fill="#0d0d0f" />
          <path d="M13.5 6v8.2a2.3 2.3 0 1 1-2.3-2.3" fill="none" stroke="#25f4ee" strokeWidth="1.8" strokeLinecap="round" transform="translate(-.6 .5)" />
          <path d="M13.5 6v8.2a2.3 2.3 0 1 1-2.3-2.3M13.5 6c.4 1.8 1.6 2.9 3.4 3" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M13.5 6c.4 1.8 1.6 2.9 3.4 3" fill="none" stroke="#fe2c55" strokeWidth="1.8" strokeLinecap="round" transform="translate(.6 -.4)" opacity=".8" />
        </svg>
      );
    case "INSTAGRAM":
      return (
        <svg {...common}>
          <defs>
            <linearGradient id="ig" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#feda75" /><stop offset=".4" stopColor="#fa7e1e" /><stop offset=".7" stopColor="#d62976" /><stop offset="1" stopColor="#4f5bd5" /></linearGradient>
          </defs>
          <rect width="24" height="24" rx="6" fill="url(#ig)" />
          <rect x="6" y="6" width="12" height="12" rx="3.5" fill="none" stroke="#fff" strokeWidth="1.7" />
          <circle cx="12" cy="12" r="2.8" fill="none" stroke="#fff" strokeWidth="1.7" />
          <circle cx="15.6" cy="8.4" r=".9" fill="#fff" />
        </svg>
      );
    default:
      return (
        <svg {...common}><rect width="24" height="24" rx="6" fill="#0d0d0f" /><path d="M7.5 7l9 10M16.5 7l-9 10" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" /></svg>
      );
  }
}
