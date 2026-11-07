import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import { logout } from "@/app/actions/auth";
import { Logo } from "@/components/logo";
import { NavProgress } from "@/components/nav-progress";
import { Submit } from "@/components/submit";
import { SessionWatcher } from "@/components/session-watcher";
import { Avatar } from "@/components/market";
import { currentUser } from "@/lib/auth";
import { APP_NAME, appUrl } from "@/lib/config";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: { default: `${APP_NAME} — Le clipping pour les apps et logiciels grand public`, template: `%s · ${APP_NAME}` },
  description: "Recrute des clippeurs pour ton app, vérifie chaque vue, bloque les bots et mesure le coût par téléchargement de chaque clippeur. Sans commission, en français.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  return (
    <html lang="fr" className={inter.variable}>
      <body>
        <Suspense fallback={null}>
          <NavProgress />
        </Suspense>
        <SessionWatcher userId={user?.id ?? null} />
        <header className="sticky top-0 z-40 border-b border-black/[0.08] bg-white/80 backdrop-blur-xl backdrop-saturate-150">
          <div className="mx-auto flex h-[52px] max-w-[1024px] items-center justify-between gap-4 px-[22px]">
            <Link href={user ? "/app" : "/"} aria-label={APP_NAME}><Logo /></Link>
            <nav className="flex items-center gap-1 text-[13px] sm:gap-5">
              <Link href="/offres" className="hidden text-ink/80 hover:text-ink sm:inline">Missions</Link>
              {user && <Link href="/clippeurs" className="hidden text-ink/80 hover:text-ink sm:inline">Clippeurs</Link>}
              {user ? (
                <>
                  <Link href="/app" className="px-2 text-ink/80 hover:text-ink sm:px-0">Mon espace</Link>
                  <span className="hidden items-center gap-2 md:flex" title={`Connecté en tant que ${user.name} (${user.email})`}>
                    <Avatar name={user.name} size={26} />
                    <span className="max-w-32 truncate font-medium">{user.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${user.role === "CLIPPER" ? "bg-[#e3f5e8] text-ok" : "bg-brand-100 text-brand-700"}`}>
                      {user.role === "CLIPPER" ? "Clippeur" : "Créateur"}
                    </span>
                  </span>
                  <form action={logout}><Submit className="text-[13px] text-ink/80 hover:text-ink">Déconnexion</Submit></form>
                </>
              ) : (
                <>
                  <Link href="/#tarifs" className="hidden text-ink/80 hover:text-ink md:inline">Tarifs</Link>
                  <Link href="/connexion" className="px-2 text-ink/80 hover:text-ink sm:px-0">Connexion</Link>
                  <Link href="/inscription" className="rounded-full bg-accent px-3.5 py-1.5 font-medium text-white hover:bg-accent-2">Commencer</Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <main className="mx-auto min-h-[60vh] max-w-6xl px-4 py-10">{children}</main>
        <footer className="bg-paper">
          <div className="mx-auto flex max-w-[1024px] flex-wrap items-center justify-between gap-4 border-t border-zinc-300 px-[22px] py-6 text-xs text-zinc-500">
            <span>Copyright © {new Date().getFullYear()} {APP_NAME}. Fait en France, pour les créateurs francophones.</span>
            <nav className="flex flex-wrap gap-x-4 gap-y-2">
              <Link href="/offres" className="text-zinc-700 hover:underline">Missions</Link>
              <Link href="/confidentialite" className="text-zinc-700 hover:underline">Confidentialité</Link>
              <Link href="/cgu" className="text-zinc-700 hover:underline">CGU</Link>
              <Link href="/mentions-legales" className="text-zinc-700 hover:underline">Mentions légales</Link>
              <Link href="/suppression-donnees" className="text-zinc-700 hover:underline">Suppression des données</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
