import { NextResponse } from "next/server";
import { currentUser, currentUserId } from "@/lib/auth";
import { canPost, chatAccess, isChannel, latestPerChannel, listMessages, MAX_MESSAGE } from "@/lib/chat";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };
const err = (error: string, status: number) => NextResponse.json({ error }, { status });

async function guard(ctx: Ctx) {
  const { id } = await ctx.params;
  const user = await currentUser();
  if (!user) return { res: err("Non connecté.", 401) };
  const access = await chatAccess(id, user.id);
  if (!access) return { res: err("Accès refusé.", 403) };
  return { id, user, access };
}

/**
 * Derniers messages d'un salon + dernier message de chaque salon.
 * Appelée toutes les quelques secondes par le client : 3 requêtes en base, pas une de plus.
 */
export async function GET(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const userId = await currentUserId();
  if (!userId) return err("Non connecté.", 401);
  const access = await chatAccess(id, userId);
  if (!access) return err("Accès refusé.", 403);
  const channel = new URL(req.url).searchParams.get("channel");
  if (!isChannel(channel)) return err("Salon inconnu.", 400);
  const [messages, latest] = await Promise.all([listMessages(id, channel, access.ownerId), latestPerChannel(id)]);
  return NextResponse.json({ messages, latest });
}

export async function POST(req: Request, ctx: Ctx) {
  const g = await guard(ctx);
  if ("res" in g) return g.res;
  const { channel, body } = (await req.json().catch(() => ({}))) as { channel?: string; body?: string };
  if (!isChannel(channel)) return err("Salon inconnu.", 400);
  if (!canPost(channel, g.access.isOwner)) return err("Seul le créateur peut écrire dans ce salon.", 403);
  const text = (body ?? "").trim();
  if (!text) return err("Message vide.", 400);
  if (text.length > MAX_MESSAGE) return err(`Message trop long (${MAX_MESSAGE} caractères max).`, 400);
  // anti-spam : 5 messages max en 10 secondes
  const recent = await db.message.count({ where: { userId: g.user.id, createdAt: { gte: new Date(Date.now() - 10_000) } } });
  if (recent >= 5) return err("Doucement ! Attends quelques secondes.", 429);
  const m = await db.message.create({ data: { workspaceId: g.id, userId: g.user.id, channel, body: text } });
  return NextResponse.json({
    message: { id: m.id, body: m.body, createdAt: m.createdAt.toISOString(), userId: g.user.id, name: g.user.name, isOwner: g.access.isOwner },
  });
}

/** Supprimer un message : son auteur, ou le créateur (modération). */
export async function DELETE(req: Request, ctx: Ctx) {
  const g = await guard(ctx);
  if ("res" in g) return g.res;
  const messageId = new URL(req.url).searchParams.get("messageId") ?? "";
  const r = await db.message.deleteMany({
    where: { id: messageId, workspaceId: g.id, ...(g.access.isOwner ? {} : { userId: g.user.id }) },
  });
  return r.count ? NextResponse.json({ ok: true }) : err("Message introuvable.", 404);
}
