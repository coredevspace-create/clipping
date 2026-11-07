import { ChatPage } from "@/components/chat/chat-page";

export const metadata = { title: "Discussion" };

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ salon?: string }> }) {
  const { id } = await params;
  const { salon } = await searchParams;
  return <ChatPage workspaceId={id} salon={salon} />;
}
