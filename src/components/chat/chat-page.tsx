import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { chatAccess, isChannel, listMessages } from "@/lib/chat";
import { db } from "@/lib/db";
import { Chat } from "./chat";

/** Page de discussion d'une équipe (même écran pour le créateur et les clippeurs). */
export async function ChatPage({ workspaceId, salon }: { workspaceId: string; salon?: string }) {
  const user = await requireUser();
  const access = await chatAccess(workspaceId, user.id);
  if (!access) notFound();
  const channel = isChannel(salon) ? salon : "general";
  const [ws, messages] = await Promise.all([
    db.workspace.findUniqueOrThrow({
      where: { id: workspaceId },
      select: { name: true, owner: { select: { id: true, name: true } }, memberships: { where: { status: "ACTIVE" }, select: { user: { select: { id: true, name: true } } } } },
    }),
    listMessages(workspaceId, channel, access.ownerId),
  ]);
  const members = [{ ...ws.owner, isOwner: true }, ...ws.memberships.map((m) => ({ ...m.user, isOwner: false }))];
  return (
    <Chat
      key={workspaceId}
      workspaceId={workspaceId}
      workspaceName={ws.name}
      me={{ id: user.id, isOwner: access.isOwner }}
      initialChannel={channel}
      initialMessages={messages}
      members={members}
    />
  );
}
