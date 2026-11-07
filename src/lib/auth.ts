import "server-only";
import bcrypt from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { db } from "./db";

const COOKIE = "session";
const MAX_AGE = 60 * 60 * 24 * 30;

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error("AUTH_SECRET manquant ou trop court (16 caractères minimum).");
  return new TextEncoder().encode(s);
}

export const hashPassword = (p: string) => bcrypt.hash(p, 10);
export const verifyPassword = (p: string, h: string) => bcrypt.compare(p, h);

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

/** Identifiant de l'utilisateur connecté, lu depuis le jeton signé, sans requête en base (routes appelées souvent). */
export async function currentUserId(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

export async function currentUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    return db.user.findUnique({ where: { id: payload.sub }, select: { id: true, email: true, name: true } });
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/connexion");
  return user;
}

/** Le créateur propriétaire de l'équipe. */
export async function requireOwner(workspaceId: string) {
  const user = await requireUser();
  const workspace = await db.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace || workspace.ownerId !== user.id) notFound();
  return { user, workspace };
}

/** Un clippeur actif de l'équipe. */
export async function requireMember(workspaceId: string) {
  const user = await requireUser();
  const membership = await db.membership.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: user.id } },
    include: { workspace: true },
  });
  if (!membership || membership.status !== "ACTIVE") notFound();
  return { user, membership, workspace: membership.workspace };
}
