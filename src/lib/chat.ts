import { db } from "./db";
import type { ChannelKey, ChatMessage } from "./chat-shared";

export * from "./chat-shared";

/** Accès à la discussion : le créateur et les clippeurs actifs de l'équipe (une seule requête). */
export async function chatAccess(workspaceId: string, userId: string) {
  const ws = await db.workspace.findUnique({
    where: { id: workspaceId },
    select: { ownerId: true, memberships: { where: { userId, status: "ACTIVE" }, select: { id: true } } },
  });
  if (!ws) return null;
  if (ws.ownerId === userId) return { isOwner: true, ownerId: ws.ownerId };
  return ws.memberships.length ? { isOwner: false, ownerId: ws.ownerId } : null;
}

/** Identifiant du dernier message de chaque salon (pour signaler les nouveaux messages). */
export async function latestPerChannel(workspaceId: string): Promise<Partial<Record<ChannelKey, string>>> {
  const rows = await db.message.findMany({
    where: { workspaceId },
    distinct: ["channel"],
    orderBy: [{ channel: "asc" }, { createdAt: "desc" }],
    select: { channel: true, id: true, userId: true },
  });
  return Object.fromEntries(rows.map((r) => [r.channel, `${r.id}:${r.userId}`]));
}

export async function listMessages(workspaceId: string, channel: ChannelKey, ownerId: string, limit = 100): Promise<ChatMessage[]> {
  const rows = await db.message.findMany({
    where: { workspaceId, channel },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.reverse().map((m) => ({
    id: m.id,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
    userId: m.userId,
    name: m.user.name,
    isOwner: m.userId === ownerId,
  }));
}
