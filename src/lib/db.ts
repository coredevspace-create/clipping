import { PrismaClient } from "@prisma/client";
// @ts-expect-error module JS sans types
import { resolveDbEnv } from "../../scripts/db-env.mjs";

resolveDbEnv(process.env);

const g = globalThis as unknown as { prisma?: PrismaClient };
export const db = g.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") g.prisma = db;
