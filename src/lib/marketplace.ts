import { planOf } from "./config";
import { db } from "./db";
import { PLATFORM_LABELS, type Platform } from "./platforms";
import { randomBytes } from "node:crypto";

export const NICHES = [
  "SaaS / Tech",
  "IA",
  "Business / Entrepreneuriat",
  "Marketing / Growth",
  "Finance / Investissement",
  "Productivité",
  "Formation / E-learning",
  "Coaching",
  "Podcast / Interview",
  "Autre",
] as const;

export const PLATFORMS = Object.keys(PLATFORM_LABELS) as Platform[];

export const splitCsv = (s: string | null | undefined) => (s ?? "").split(",").map((x) => x.trim()).filter(Boolean);

/** Garde uniquement les valeurs autorisées (protège contre les valeurs forgées dans les formulaires). */
export const pick = <T extends string>(values: string[], allowed: readonly T[]) =>
  values.filter((v): v is T => (allowed as readonly string[]).includes(v));

export const platformLabel = (p: string) => PLATFORM_LABELS[p as Platform] ?? p;

/** Ajoute un clippeur à une équipe en respectant la limite de l'offre. Renvoie un message d'erreur ou null. */
export async function addMember(workspaceId: string, userId: string): Promise<string | null> {
  const ws = await db.workspace.findUnique({ where: { id: workspaceId } });
  if (!ws) return "Équipe introuvable.";
  if (ws.ownerId === userId) return "Tu es le créateur de cette équipe.";
  const existing = await db.membership.findUnique({ where: { workspaceId_userId: { workspaceId, userId } } });
  if (existing?.status === "ACTIVE") return null;
  if (existing?.status === "REMOVED") return "Ce clippeur a été retiré de l'équipe.";
  const count = await db.membership.count({ where: { workspaceId, status: "ACTIVE" } });
  if (count >= planOf(ws.plan).maxClippers) return "L'équipe a atteint la limite de clippeurs de son abonnement.";
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const trackingCode = Array.from(randomBytes(8), (b) => alphabet[b % alphabet.length]).join("");
  await db.membership.create({ data: { workspaceId, userId, trackingCode } });
  return null;
}

export type Reputation = { teams: number; validatedClips: number; verifiedViews: number; refusedRate: number | null };

/**
 * Réputation vérifiée d'un clippeur, calculée sur ses clips réels dans toutes les équipes.
 * Un clip compte comme validé s'il a été approuvé ou payé ; le taux de refus porte sur les clips tranchés.
 */
export async function reputations(userIds: string[]): Promise<Map<string, Reputation>> {
  const memberships = await db.membership.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, clips: { select: { status: true, views: true, paidCents: true } } },
  });
  const out = new Map<string, Reputation>(userIds.map((id) => [id, { teams: 0, validatedClips: 0, verifiedViews: 0, refusedRate: null }]));
  const decided = new Map<string, { refused: number; total: number }>();
  for (const m of memberships) {
    const r = out.get(m.userId)!;
    r.teams++;
    const d = decided.get(m.userId) ?? { refused: 0, total: 0 };
    for (const c of m.clips) {
      const validated = c.status === "APPROVED" || c.paidCents > 0;
      if (validated) {
        r.validatedClips++;
        r.verifiedViews += c.views;
      }
      if (validated || c.status === "REJECTED") d.total++;
      if (c.status === "REJECTED") d.refused++;
    }
    decided.set(m.userId, d);
  }
  for (const [id, d] of decided) if (d.total >= 3) out.get(id)!.refusedRate = d.refused / d.total;
  return out;
}

/** Un créateur peut voir le contact d'un clippeur s'ils sont déjà en relation (équipe, candidature ou invitation). */
export async function canSeeContact(ownerId: string, clipperId: string) {
  const [member, application, invitation] = await Promise.all([
    db.membership.count({ where: { userId: clipperId, workspace: { ownerId } } }),
    db.application.count({ where: { userId: clipperId, offer: { workspace: { ownerId } } } }),
    db.invitation.count({ where: { userId: clipperId, workspace: { ownerId } } }),
  ]);
  return member + application + invitation > 0;
}
