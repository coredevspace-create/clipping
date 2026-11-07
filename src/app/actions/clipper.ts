"use server";

import { redirect } from "next/navigation";
import { requireMember, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { addMember } from "@/lib/marketplace";
import { parseClipUrl } from "@/lib/platforms";
import { refreshClip } from "@/lib/tracking";
import { done, fail, str } from "./util";

export async function joinWorkspace(inviteCode: string) {
  const user = await requireUser();
  const ws = await db.workspace.findUnique({ where: { inviteCode } });
  if (!ws) fail(`/rejoindre/${inviteCode}`, "Invitation invalide ou expirée.");
  if (ws.ownerId === user.id) redirect(`/app/e/${ws.id}`);
  const error = await addMember(ws.id, user.id);
  if (error) fail(`/rejoindre/${inviteCode}`, error);
  redirect(`/app/c/${ws.id}`);
}

export async function submitClip(workspaceId: string, fd: FormData) {
  const { membership } = await requireMember(workspaceId);
  const back = `/app/c/${workspaceId}`;
  const parsed = parseClipUrl(str(fd, "url"));
  if (!parsed.ok) fail(back, parsed.error);

  const momentId = str(fd, "momentId") || null;
  if (momentId) {
    const m = await db.moment.findFirst({ where: { id: momentId, source: { workspaceId } } });
    if (!m || m.reservedById !== membership.id) fail(back, "Ce moment n'est pas réservé à ton nom.");
  }

  const dup = await db.clip.findUnique({
    where: { workspaceId_platform_externalId: { workspaceId, platform: parsed.platform, externalId: parsed.externalId } },
  });
  if (dup) fail(back, dup.membershipId === membership.id ? "Tu as déjà soumis ce clip." : "Ce clip a déjà été soumis par un autre clippeur.");

  const clip = await db.clip.create({
    data: { workspaceId, membershipId: membership.id, momentId, url: parsed.url, platform: parsed.platform, externalId: parsed.externalId },
  });
  try {
    await refreshClip(clip.id);
  } catch {
    // les stats seront récupérées au prochain passage du cron
  }
  done(back, "Clip envoyé ! Ses vues sont suivies automatiquement.");
}

export async function reserveMoment(workspaceId: string, momentId: string) {
  const { membership } = await requireMember(workspaceId);
  const back = `/app/c/${workspaceId}`;
  const mine = await db.moment.count({ where: { reservedById: membership.id, clips: { none: {} } } });
  if (mine >= 3) fail(back, "Tu as déjà 3 moments réservés non publiés. Publie-les avant d'en prendre d'autres.");
  const r = await db.moment.updateMany({
    where: { id: momentId, reservedById: null, source: { workspaceId } },
    data: { reservedById: membership.id, reservedAt: new Date() },
  });
  if (r.count === 0) fail(back, "Ce moment vient d'être réservé par quelqu'un d'autre.");
  done(back, "Moment réservé : il est à toi.");
}

export async function unreserveMoment(workspaceId: string, momentId: string) {
  const { membership } = await requireMember(workspaceId);
  await db.moment.updateMany({
    where: { id: momentId, reservedById: membership.id, clips: { none: {} } },
    data: { reservedById: null, reservedAt: null },
  });
  done(`/app/c/${workspaceId}`, "Réservation annulée.");
}

export async function updatePayoutInfo(workspaceId: string, fd: FormData) {
  const { membership } = await requireMember(workspaceId);
  const back = `/app/c/${workspaceId}`;
  const method = str(fd, "method");
  const details = str(fd, "details");
  if (!["IBAN", "PAYPAL"].includes(method)) fail(back, "Choisis IBAN ou PayPal.");
  if (method === "IBAN" && !/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(details.replace(/\s/g, "").toUpperCase())) {
    fail(back, "IBAN invalide.");
  }
  if (method === "PAYPAL" && !/^\S+@\S+\.\S+$/.test(details)) fail(back, "Email PayPal invalide.");
  await db.membership.update({
    where: { id: membership.id },
    data: { payoutMethod: method, payoutDetails: method === "IBAN" ? details.replace(/\s/g, "").toUpperCase() : details },
  });
  done(back, "Coordonnées de paiement enregistrées.");
}
