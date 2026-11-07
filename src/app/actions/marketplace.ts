"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwner, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { addMember, NICHES, pick, PLATFORMS } from "@/lib/marketplace";
import { done, fail, str } from "./util";

const multi = (fd: FormData, k: string) => fd.getAll(k).map(String);

// ——— Annonce du clippeur ———

export async function saveProfile(fd: FormData) {
  const user = await requireUser();
  const back = "/app/profil";
  const headline = str(fd, "headline");
  const bio = str(fd, "bio");
  if (headline.length < 5 || headline.length > 90) fail(back, "Ton titre doit faire entre 5 et 90 caractères.");
  if (bio.length < 20) fail(back, "Présente-toi en quelques phrases (20 caractères minimum).");
  const niches = pick(multi(fd, "niches"), NICHES);
  const platforms = pick(multi(fd, "platforms"), PLATFORMS);
  if (niches.length === 0 || platforms.length === 0) fail(back, "Choisis au moins une niche et une plateforme.");
  const portfolio = str(fd, "portfolio")
    .split(/\s+/)
    .filter((l) => /^https?:\/\/\S+$/.test(l))
    .slice(0, 8)
    .join("\n");
  const data = {
    headline,
    bio: bio.slice(0, 1500),
    niches: niches.join(","),
    platforms: platforms.join(","),
    portfolio,
    contact: str(fd, "contact").slice(0, 120) || null,
    available: fd.get("available") === "on",
  };
  await db.clipperProfile.upsert({ where: { userId: user.id }, create: { userId: user.id, ...data }, update: data });
  done(back, "Annonce enregistrée. Les créateurs peuvent maintenant te trouver.");
}

// ——— Annonce du créateur ———

export async function saveOffer(workspaceId: string, fd: FormData) {
  await requireOwner(workspaceId);
  const back = `/app/e/${workspaceId}/annonce`;
  const title = str(fd, "title");
  const description = str(fd, "description");
  const niche = pick([str(fd, "niche")], NICHES)[0];
  const platforms = pick(multi(fd, "platforms"), PLATFORMS);
  if (title.length < 5 || title.length > 90) fail(back, "Le titre doit faire entre 5 et 90 caractères.");
  if (description.length < 30) fail(back, "Décris ton produit et ce que tu attends (30 caractères minimum).");
  if (!niche || platforms.length === 0) fail(back, "Choisis une niche et au moins une plateforme.");
  const data = {
    title,
    description: description.slice(0, 3000),
    niche,
    platforms: platforms.join(","),
    requirements: str(fd, "requirements").slice(0, 1000) || null,
    status: fd.get("open") === "on" ? "OPEN" : "CLOSED",
  };
  await db.offer.upsert({ where: { workspaceId }, create: { workspaceId, ...data }, update: data });
  done(back, data.status === "OPEN" ? "Annonce publiée : elle est visible par tous les clippeurs." : "Annonce enregistrée (fermée aux candidatures).");
}

export async function decideApplication(workspaceId: string, applicationId: string, accept: boolean) {
  await requireOwner(workspaceId);
  const back = `/app/e/${workspaceId}/annonce`;
  const app = await db.application.findFirst({ where: { id: applicationId, offer: { workspaceId } } });
  if (!app || app.status !== "PENDING") fail(back, "Candidature introuvable ou déjà traitée.");
  if (accept) {
    const error = await addMember(workspaceId, app.userId);
    if (error) fail(back, error);
  }
  await db.application.update({ where: { id: app.id }, data: { status: accept ? "ACCEPTED" : "REJECTED" } });
  done(back, accept ? "Clippeur ajouté à ton équipe." : "Candidature refusée.");
}

export async function inviteClipper(clipperId: string, fd: FormData) {
  const user = await requireUser();
  const back = `/clippeurs/${clipperId}`;
  const workspaceId = str(fd, "workspaceId");
  const ws = await db.workspace.findFirst({ where: { id: workspaceId, ownerId: user.id } });
  if (!ws) fail(back, "Choisis une de tes équipes.");
  if (!(await db.clipperProfile.findUnique({ where: { userId: clipperId } }))) fail(back, "Clippeur introuvable.");
  if (await db.membership.findUnique({ where: { workspaceId_userId: { workspaceId, userId: clipperId } } })) {
    fail(back, "Ce clippeur fait déjà partie de cette équipe.");
  }
  const message = str(fd, "message").slice(0, 1000);
  if (message.length < 10) fail(back, "Ajoute un petit message (10 caractères minimum).");
  const existing = await db.invitation.findUnique({ where: { workspaceId_userId: { workspaceId, userId: clipperId } } });
  if (existing?.status === "PENDING") fail(back, "Une invitation est déjà en attente pour cette équipe.");
  await db.invitation.upsert({
    where: { workspaceId_userId: { workspaceId, userId: clipperId } },
    create: { workspaceId, userId: clipperId, message },
    update: { message, status: "PENDING", createdAt: new Date() },
  });
  done(back, "Invitation envoyée. Le clippeur la verra dans son espace.");
}

// ——— Côté clippeur ———

export async function applyToOffer(offerId: string, fd: FormData) {
  const user = await requireUser();
  const back = `/offres/${offerId}`;
  const offer = await db.offer.findUnique({ where: { id: offerId }, include: { workspace: true } });
  if (!offer || offer.status !== "OPEN") fail(back, "Cette annonce n'accepte plus de candidatures.");
  if (offer.workspace.ownerId === user.id) fail(back, "C'est ta propre annonce.");
  if (await db.membership.findUnique({ where: { workspaceId_userId: { workspaceId: offer.workspaceId, userId: user.id } } })) {
    fail(back, "Tu fais déjà partie de cette équipe.");
  }
  if (await db.application.findUnique({ where: { offerId_userId: { offerId, userId: user.id } } })) fail(back, "Tu as déjà postulé.");
  const message = str(fd, "message").slice(0, 1500);
  if (message.length < 20) fail(back, "Explique en quelques phrases pourquoi toi (20 caractères minimum).");
  await db.application.create({ data: { offerId, userId: user.id, message } });
  done(back, "Candidature envoyée ! Tu seras ajouté à l'équipe si le créateur l'accepte.");
}

export async function withdrawApplication(applicationId: string) {
  const user = await requireUser();
  await db.application.deleteMany({ where: { id: applicationId, userId: user.id, status: "PENDING" } });
  revalidatePath("/app");
}

export async function respondInvitation(invitationId: string, accept: boolean) {
  const user = await requireUser();
  const inv = await db.invitation.findFirst({ where: { id: invitationId, userId: user.id, status: "PENDING" } });
  if (!inv) fail("/app", "Invitation introuvable ou déjà traitée.");
  if (accept) {
    const error = await addMember(inv.workspaceId, user.id);
    if (error) fail("/app", error);
  }
  await db.invitation.update({ where: { id: inv.id }, data: { status: accept ? "ACCEPTED" : "DECLINED" } });
  if (accept) redirect(`/app/c/${inv.workspaceId}`);
  done("/app", "Invitation déclinée.");
}
