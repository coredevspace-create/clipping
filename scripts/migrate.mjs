// Applique les migrations au build (Vercel). Échoue avec un message clair s'il n'y a pas de base.
import { execSync } from "node:child_process";
import { resolveDbEnv } from "./db-env.mjs";

// en local, charger .env (sur Vercel les variables sont déjà injectées)
try {
  process.loadEnvFile?.(".env");
} catch {}
const env = resolveDbEnv({ ...process.env });
if (!env.DATABASE_URL) {
  console.error(
    "\n❌ Aucune base de données configurée.\n" +
      "   Sur Vercel : onglet Storage → crée une base Postgres (Prisma Postgres ou Neon) → Connect, puis Redeploy.\n",
  );
  process.exit(1);
}
execSync("npx prisma migrate deploy", { stdio: "inherit", env });
