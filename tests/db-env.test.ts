import { describe, expect, it } from "vitest";
// @ts-expect-error module JS sans types
import { resolveDbEnv } from "../scripts/db-env.mjs";

const pg = "postgres://u:p@db.prisma.io:5432/postgres?sslmode=require";
const accel = "prisma+postgres://accelerate.prisma-data.net/?api_key=x";

describe("resolveDbEnv", () => {
  it("Neon via Vercel", () => {
    const e = resolveDbEnv({ DATABASE_URL: "postgresql://pool", DATABASE_URL_UNPOOLED: "postgresql://direct" });
    expect([e.DATABASE_URL, e.DATABASE_URL_UNPOOLED]).toEqual(["postgresql://pool", "postgresql://direct"]);
  });
  it("Prisma Postgres avec un préfixe personnalisé (STORAGE)", () => {
    const e = resolveDbEnv({ STORAGE_PRISMA_DATABASE_URL: accel, STORAGE_POSTGRES_URL: pg, STORAGE_URL: pg, APP_URL: "https://x.app" });
    expect(e.DATABASE_URL).toBe(pg);
    expect(e.DATABASE_URL_UNPOOLED).toBe(pg);
  });
  it("remplace une URL Accelerate par la connexion directe", () => {
    const e = resolveDbEnv({ DATABASE_URL: accel, POSTGRES_URL: pg });
    expect(e.DATABASE_URL).toBe(pg);
  });
  it("ne prend jamais une URL non PostgreSQL", () => {
    const e = resolveDbEnv({ APP_URL: "https://x.app" });
    expect(e.DATABASE_URL).toBeUndefined();
  });
});
