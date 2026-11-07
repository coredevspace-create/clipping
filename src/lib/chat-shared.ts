/** Définitions partagées entre serveur et navigateur (aucun accès base de données ici). */
export type ChannelKey = "general" | "annonces" | "entraide";

export const CHANNELS: readonly { key: ChannelKey; label: string; desc: string; ownerOnly: boolean }[] = [
  { key: "general", label: "général", desc: "Discussion libre de l'équipe", ownerOnly: false },
  { key: "annonces", label: "annonces", desc: "Consignes et nouveautés du créateur", ownerOnly: true },
  { key: "entraide", label: "entraide", desc: "Astuces de montage, hooks, questions", ownerOnly: false },
];
export const isChannel = (c: string | null | undefined): c is ChannelKey => CHANNELS.some((x) => x.key === c);
export const canPost = (channel: ChannelKey, isOwner: boolean) => isOwner || !CHANNELS.find((c) => c.key === channel)!.ownerOnly;

export const MAX_MESSAGE = 2000;

export type ChatMessage = { id: string; body: string; createdAt: string; userId: string; name: string; isOwner: boolean };

