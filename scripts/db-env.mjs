/**
 * Unifie les noms de variables de connexion selon le fournisseur branché sur Vercel :
 * Neon (DATABASE_URL / DATABASE_URL_UNPOOLED), Prisma Postgres ou Supabase (POSTGRES_URL…).
 */
export function resolveDbEnv(env = process.env) {
  const isTcp = (u) => typeof u === "string" && /^postgres(ql)?:\/\//.test(u);
  const candidates = [env.DATABASE_URL, env.POSTGRES_PRISMA_URL, env.POSTGRES_URL, env.PRISMA_DATABASE_URL].filter(Boolean);
  if (!env.DATABASE_URL && candidates.length) env.DATABASE_URL = candidates[0];
  if (!env.DATABASE_URL_UNPOOLED) {
    env.DATABASE_URL_UNPOOLED = [env.POSTGRES_URL_NON_POOLING, env.DATABASE_URL, env.POSTGRES_URL].find(isTcp) ?? env.DATABASE_URL;
  }
  return env;
}
