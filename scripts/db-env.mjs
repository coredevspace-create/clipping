/**
 * Trouve la connexion PostgreSQL quel que soit le fournisseur branché sur Vercel et le préfixe choisi
 * (Neon : DATABASE_URL / DATABASE_URL_UNPOOLED ; Prisma Postgres : <PREFIXE>_URL, <PREFIXE>_POSTGRES_URL… ;
 * Supabase : POSTGRES_URL…). On privilégie toujours une connexion PostgreSQL directe (postgres://).
 */
export function resolveDbEnv(env = process.env) {
  const isTcp = (u) => typeof u === "string" && /^postgres(ql)?:\/\//.test(u);
  const preferred = ["DATABASE_URL", "POSTGRES_PRISMA_URL", "POSTGRES_URL", "DATABASE_URL_UNPOOLED", "POSTGRES_URL_NON_POOLING"];
  const others = Object.keys(env)
    .filter((k) => k.endsWith("_URL") && !preferred.includes(k))
    .sort((a, b) => a.length - b.length);
  const firstTcp = (names) => names.map((k) => env[k]).find(isTcp);

  if (!isTcp(env.DATABASE_URL)) {
    const found = firstTcp([...preferred, ...others]);
    if (found) env.DATABASE_URL = found;
  }
  if (!isTcp(env.DATABASE_URL_UNPOOLED)) {
    const direct = firstTcp(["POSTGRES_URL_NON_POOLING", ...others.filter((k) => /NON_POOLING|UNPOOLED|DIRECT/.test(k))]);
    env.DATABASE_URL_UNPOOLED = direct ?? env.DATABASE_URL;
  }
  return env;
}
