"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwner, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseTimecode } from "@/lib/format";
import { computePayouts } from "@/lib/payouts";
import { recordStats, refreshClip } from "@/lib/tracking";
import { code, done, eurosToCents, fail, intOrNull, str } from "./util";

export async function createWorkspace(fd: FormData) {
  const user = await requireUser();
  const name = str(fd, "name");
  if (name.length < 2) fail("/app/nouvelle-equipe", "Donne un nom à ton équipe.");
  const productUrl = str(fd, "productUrl");
  if (productUrl && !/^https?:\/\//.test(productUrl)) fail("/app/nouvelle-equipe", "L'URL du produit doit commencer par https://");
  const cpmCents = eurosToCents(str(fd, "cpm") || "1");
  if (cpmCents === null) fail("/app/nouvelle-equipe", "Rémunération invalide.");
  const ws = await db.workspace.create({
    data: { name, ownerId: user.id, inviteCode: code(10), productUrl: productUrl || null, cpmCents },
  });
  redirect(`/app/e/${ws.id}`);
}

export async function updateSettings(workspaceId: string, fd: FormData) {
  await requireOwner(workspaceId);
  const back = `/app/e/${workspaceId}/reglages`;
  const name = str(fd, "name");
  const productUrl = str(fd, "productUrl");
  const cpmCents = eurosToCents(str(fd, "cpm"));
  const maxPayoutPerClipCents = eurosToCents(str(fd, "maxPayout"));
  const minViews = intOrNull(str(fd, "minViews"));
  const holdDays = intOrNull(str(fd, "holdDays"), 0, 60);
  const fraudThreshold = intOrNull(str(fd, "fraudThreshold"), 10, 100);
  if (name.length < 2) fail(back, "Nom trop court.");
  if (productUrl && !/^https?:\/\//.test(productUrl)) fail(back, "L'URL du produit doit commencer par https://");
  if (cpmCents === null || maxPayoutPerClipCents === null || minViews === null || holdDays === null || fraudThreshold === null) {
    fail(back, "Un des champs numériques est invalide.");
  }
  await db.workspace.update({
    where: { id: workspaceId },
    data: { name, productUrl: productUrl || null, cpmCents, maxPayoutPerClipCents, minViews, holdDays, fraudThreshold, requireVerifiedAccounts: fd.get("requireVerifiedAccounts") === "on" },
  });
  done(back, "Réglages enregistrés.");
}

export async function regenerateInvite(workspaceId: string) {
  await requireOwner(workspaceId);
  await db.workspace.update({ where: { id: workspaceId }, data: { inviteCode: code(10) } });
  done(`/app/e/${workspaceId}/clippeurs`, "Nouveau lien d'invitation généré : l'ancien ne fonctionne plus.");
}

export async function removeMember(workspaceId: string, membershipId: string) {
  await requireOwner(workspaceId);
  await db.membership.updateMany({ where: { id: membershipId, workspaceId }, data: { status: "REMOVED" } });
  await db.moment.updateMany({ where: { reservedById: membershipId }, data: { reservedById: null, reservedAt: null } });
  done(`/app/e/${workspaceId}/clippeurs`, "Clippeur retiré de l'équipe.");
}

// ——— Modération des clips ———

async function ownedClip(workspaceId: string, clipId: string) {
  await requireOwner(workspaceId);
  const clip = await db.clip.findFirst({ where: { id: clipId, workspaceId } });
  if (!clip) fail(`/app/e/${workspaceId}`, "Clip introuvable.");
  return clip;
}

export async function approveClip(workspaceId: string, clipId: string) {
  const clip = await ownedClip(workspaceId, clipId);
  await db.clip.update({ where: { id: clipId }, data: { status: "APPROVED", approvedOverride: clip.fraudScore > 0 } });
  revalidatePath(`/app/e/${workspaceId}`);
}

export async function rejectClip(workspaceId: string, clipId: string) {
  await ownedClip(workspaceId, clipId);
  await db.clip.update({ where: { id: clipId }, data: { status: "REJECTED", approvedOverride: false } });
  revalidatePath(`/app/e/${workspaceId}`);
}

export async function reopenClip(workspaceId: string, clipId: string) {
  await ownedClip(workspaceId, clipId);
  await db.clip.update({ where: { id: clipId }, data: { status: "PENDING", approvedOverride: false } });
  revalidatePath(`/app/e/${workspaceId}`);
}

export async function refreshOneClip(workspaceId: string, clipId: string) {
  await ownedClip(workspaceId, clipId);
  const back = `/app/e/${workspaceId}/clips/${clipId}`;
  let error: string | null = null;
  try {
    const r = await refreshClip(clipId);
    if (r.skipped) error = "Pas d'API branchée pour cette plateforme : saisis les stats manuellement.";
  } catch (e) {
    error = `Erreur de récupération : ${(e as Error).message}`;
  }
  if (error) fail(back, error);
  done(back, "Statistiques mises à jour.");
}

export async function refreshAllClips(workspaceId: string) {
  await requireOwner(workspaceId);
  const clips = await db.clip.findMany({ where: { workspaceId, status: { not: "REJECTED" } }, select: { id: true } });
  let ok = 0;
  let skipped = 0;
  let errors = 0;
  for (const c of clips) {
    try {
      const r = await refreshClip(c.id);
      if (r.skipped) skipped++;
      else ok++;
    } catch {
      errors++;
    }
  }
  done(`/app/e/${workspaceId}`, `${ok} clip(s) mis à jour${skipped ? `, ${skipped} sans API (saisie manuelle)` : ""}${errors ? `, ${errors} erreur(s)` : ""}.`);
}

export async function manualStats(workspaceId: string, clipId: string, fd: FormData) {
  await ownedClip(workspaceId, clipId);
  const back = `/app/e/${workspaceId}/clips/${clipId}`;
  const views = intOrNull(str(fd, "views"));
  const likes = intOrNull(str(fd, "likes") || "0");
  const comments = intOrNull(str(fd, "comments") || "0");
  const shares = intOrNull(str(fd, "shares") || "0");
  if (views === null || likes === null || comments === null || shares === null) fail(back, "Valeurs invalides.");
  await recordStats(clipId, { views, likes, comments, shares }, "MANUAL");
  done(back, "Statistiques enregistrées.");
}

// ——— Bibliothèque de sources & moments ———

export async function createSource(workspaceId: string, fd: FormData) {
  await requireOwner(workspaceId);
  const back = `/app/e/${workspaceId}/sources`;
  const title = str(fd, "title");
  const url = str(fd, "url");
  if (title.length < 2) fail(back, "Donne un titre à la source.");
  if (!/^https?:\/\//.test(url)) fail(back, "Le lien de la source doit commencer par https:// (YouTube, Drive, Dropbox…).");
  await db.source.create({ data: { workspaceId, title, url, notes: str(fd, "notes") || null } });
  done(back, "Source ajoutée. Ajoute maintenant les moments à clipper.");
}

export async function deleteSource(workspaceId: string, sourceId: string) {
  await requireOwner(workspaceId);
  const used = await db.clip.count({ where: { moment: { sourceId } } });
  if (used) fail(`/app/e/${workspaceId}/sources`, "Des clips sont rattachés à cette source : impossible de la supprimer.");
  await db.source.deleteMany({ where: { id: sourceId, workspaceId } });
  done(`/app/e/${workspaceId}/sources`, "Source supprimée.");
}

export async function createMoment(workspaceId: string, sourceId: string, fd: FormData) {
  await requireOwner(workspaceId);
  const back = `/app/e/${workspaceId}/sources`;
  const source = await db.source.findFirst({ where: { id: sourceId, workspaceId } });
  if (!source) fail(back, "Source introuvable.");
  const title = str(fd, "title");
  const startSec = parseTimecode(str(fd, "start"));
  const endSec = parseTimecode(str(fd, "end"));
  if (title.length < 2) fail(back, "Décris le moment en quelques mots.");
  if (startSec === null || endSec === null || endSec <= startSec) fail(back, "Horodatage invalide (format 12:30 ou 1:02:03, fin après début).");
  await db.moment.create({ data: { sourceId, title, startSec, endSec, notes: str(fd, "notes") || null } });
  done(back, "Moment ajouté : tes clippeurs peuvent le réserver.");
}

export async function deleteMoment(workspaceId: string, momentId: string) {
  await requireOwner(workspaceId);
  const back = `/app/e/${workspaceId}/sources`;
  if (await db.clip.count({ where: { momentId } })) fail(back, "Un clip est rattaché à ce moment.");
  await db.moment.deleteMany({ where: { id: momentId, source: { workspaceId } } });
  done(back, "Moment supprimé.");
}

export async function releaseMoment(workspaceId: string, momentId: string) {
  await requireOwner(workspaceId);
  await db.moment.updateMany({ where: { id: momentId, source: { workspaceId } }, data: { reservedById: null, reservedAt: null } });
  done(`/app/e/${workspaceId}/sources`, "Réservation libérée.");
}

// ——— Paiements ———

export async function createPayoutRun(workspaceId: string) {
  const { workspace } = await requireOwner(workspaceId);
  const back = `/app/e/${workspaceId}/paiements`;
  const clips = await db.clip.findMany({
    where: { workspaceId, status: { in: ["APPROVED", "PENDING"] }, membership: { status: "ACTIVE" } },
  });
  const drafts = computePayouts(clips, workspace);
  if (drafts.length === 0) fail(back, "Rien à payer pour l'instant.");
  const totalCents = drafts.reduce((s, d) => s + d.amountCents, 0);

  const run = await db.$transaction(async (tx) => {
    const run = await tx.payoutRun.create({ data: { workspaceId, totalCents } });
    for (const d of drafts) {
      await tx.payout.create({
        data: {
          runId: run.id,
          membershipId: d.membershipId,
          amountCents: d.amountCents,
          views: d.views,
          lines: { create: d.lines.map((l) => ({ clipId: l.clipId, views: l.views, amountCents: l.amountCents })) },
        },
      });
      for (const l of d.lines) {
        await tx.clip.update({ where: { id: l.clipId }, data: { paidViews: l.totalViews, paidCents: l.totalCents } });
      }
    }
    return run;
  });
  done(`${back}?run=${run.id}`, "Lot de paiement créé. Effectue les virements puis marque-les comme payés.");
}

export async function markPayoutPaid(workspaceId: string, payoutId: string) {
  await requireOwner(workspaceId);
  await db.payout.updateMany({ where: { id: payoutId, run: { workspaceId } }, data: { status: "PAID", paidAt: new Date() } });
  revalidatePath(`/app/e/${workspaceId}/paiements`);
}
