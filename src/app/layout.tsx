import type { Metadata } from "next";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { currentUser } from "@/lib/auth";
import { APP_NAME } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  title: `${APP_NAME} — Gère ton équipe de clippeurs`,
  description: "Réception des clips, suivi des vues, anti-fraude et paiement des clippeurs, au même endroit.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  return (
    <html lang="fr">
      <body>
        <header className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
            <Link href={user ? "/app" : "/"} className="flex items-center gap-2 font-bold">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-600 text-sm text-white">✂</span>
              {APP_NAME}
            </Link>
            <nav className="flex items-center gap-3 text-sm">
              {user ? (
                <>
                  <Link href="/app" className="text-zinc-600 hover:text-zinc-900">Mes équipes</Link>
                  <span className="hidden text-zinc-400 sm:inline">{user.name}</span>
                  <form action={logout}>
                    <button className="btn-ghost">Déconnexion</button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/connexion" className="text-zinc-600 hover:text-zinc-900">Connexion</Link>
                  <Link href="/inscription" className="btn">Essai gratuit</Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
