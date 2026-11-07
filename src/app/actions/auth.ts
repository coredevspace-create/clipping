"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, str } from "./util";

const safeNext = (n: string) => (n.startsWith("/") && !n.startsWith("//") ? n : "/app");

export async function signup(fd: FormData) {
  const next = safeNext(str(fd, "next"));
  const back = `/inscription?next=${encodeURIComponent(next)}`;
  const parsed = z
    .object({
      name: z.string().min(2, "Ton nom doit faire au moins 2 caractères."),
      email: z.string().email("Email invalide."),
      password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères."),
    })
    .safeParse({ name: str(fd, "name"), email: str(fd, "email").toLowerCase(), password: String(fd.get("password") ?? "") });
  if (!parsed.success) fail(back, parsed.error.issues[0].message);

  const { name, email, password } = parsed.data;
  if (await db.user.findUnique({ where: { email } })) fail(back, "Un compte existe déjà avec cet email. Connecte-toi.");
  const user = await db.user.create({ data: { name, email, passwordHash: await hashPassword(password) } });
  await createSession(user.id);
  redirect(next);
}

export async function login(fd: FormData) {
  const next = safeNext(str(fd, "next"));
  const email = str(fd, "email").toLowerCase();
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(String(fd.get("password") ?? ""), user.passwordHash))) {
    fail(`/connexion?next=${encodeURIComponent(next)}`, "Email ou mot de passe incorrect.");
  }
  await createSession(user.id);
  redirect(next);
}

export async function logout() {
  await destroySession();
  redirect("/");
}
