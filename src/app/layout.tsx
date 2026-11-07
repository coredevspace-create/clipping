import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { Logo } from "@/components/logo";
import { currentUser } from "@/lib/auth";
import { APP_NAME } from "@/lib/config";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  title: { default: `${APP_NAME} — Tes clippeurs, sans le chaos`, template: `%s · ${APP_NAME}` },
  description: "Recrute des clippeurs, reçois leurs clips, vérifie chaque vue et paie au centime près. Sans commission, en français.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  return (
    <html lang="fr" className={`${bricolage.variable} ${instrument.variable} ${jetbrains.variable}`}>
      <body>
        <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/85 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
            <Link href={user ? "/app" : "/"} aria-label={APP_NAME}><Logo /></Link>
            <nav className="flex items-center gap-1 text-sm sm:gap-2">
              <Link href="/offres" className="hidden rounded-full px-3 py-2 font-medium text-zinc-700 hover:bg-ink/5 sm:inline">Missions</Link>
              {user && <Link href="/clippeurs" className="hidden rounded-full px-3 py-2 font-medium text-zinc-700 hover:bg-ink/5 sm:inline">Clippeurs</Link>}
              {user ? (
                <>
                  <Link href="/app" className="rounded-full px-3 py-2 font-medium text-zinc-700 hover:bg-ink/5">Mon espace</Link>
                  <form action={logout}><button className="btn-ghost">Déconnexion</button></form>
                </>
              ) : (
                <>
                  {!user && <Link href="/#tarifs" className="hidden rounded-full px-3 py-2 font-medium text-zinc-700 hover:bg-ink/5 md:inline">Tarifs</Link>}
                  <Link href="/connexion" className="rounded-full px-3 py-2 font-medium text-zinc-700 hover:bg-ink/5">Connexion</Link>
                  <Link href="/inscription" className="btn">Commencer</Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
      </body>
    </html>
  );
}
