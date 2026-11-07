/**
 * Données de démo : `npm run db:seed`
 * Créateur : demo@clipsquad.fr / demo1234 — Clippeurs : lea@ / sami@ / noah@clipsquad.fr (mot de passe demo1234)
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { recordStats } from "../src/lib/tracking";
import { demoProvider } from "../src/lib/views/demo";
import type { Platform } from "../src/lib/platforms";

const db = new PrismaClient();
const H = 3_600_000;

async function main() {
  // remise à zéro des données de démo
  const demoUsers = await db.user.findMany({ where: { email: { endsWith: "@clipsquad.fr" } }, select: { id: true } });
  const ids = demoUsers.map((u) => u.id);
  const wsIds = (await db.workspace.findMany({ where: { ownerId: { in: ids } }, select: { id: true } })).map((w) => w.id);
  await db.payoutLine.deleteMany({ where: { clip: { workspaceId: { in: wsIds } } } });
  await db.payout.deleteMany({ where: { run: { workspaceId: { in: wsIds } } } });
  await db.clip.deleteMany({ where: { workspaceId: { in: wsIds } } });
  await db.moment.deleteMany({ where: { source: { workspaceId: { in: wsIds } } } });
  await db.workspace.deleteMany({ where: { id: { in: wsIds } } });
  await db.membership.deleteMany({ where: { userId: { in: ids } } });
  await db.user.deleteMany({ where: { id: { in: ids } } });
  const passwordHash = await bcrypt.hash("demo1234", 10);
  const owner = await db.user.create({ data: { email: "demo@clipsquad.fr", name: "Julie (fondatrice)", passwordHash } });
  const ws = await db.workspace.create({
    data: { name: "Facturo — SaaS de facturation", ownerId: owner.id, inviteCode: "demo-invite", productUrl: "https://example.com", cpmCents: 120, minViews: 1000, maxPayoutPerClipCents: 8000 },
  });

  const names = [["lea", "Léa"], ["sami", "Sami"], ["noah", "Noah"]];
  const members = [];
  for (const [slug, name] of names) {
    const u = await db.user.create({ data: { email: `${slug}@clipsquad.fr`, name, passwordHash } });
    members.push(await db.membership.create({ data: { workspaceId: ws.id, userId: u.id, trackingCode: `demo-${slug}`, payoutMethod: "IBAN", payoutDetails: "FR7630006000011234567890189" } }));
  }

  const src = await db.source.create({
    data: { workspaceId: ws.id, title: "Live : comment on est passé de 0 à 10 k€ MRR", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", notes: "Format vertical, sous-titres obligatoires, mentionner Facturo dans la description." },
  });
  const moments = await Promise.all(
    [
      [312, 371, "Le premier client trouvé sur LinkedIn"],
      [1225, 1290, "Pourquoi on a doublé nos prix"],
      [2040, 2101, "L'erreur qui nous a coûté 3 mois"],
      [2900, 2960, "Le tableau de bord en démo"],
    ].map(([s, e, t]) => db.moment.create({ data: { sourceId: src.id, startSec: s as number, endSec: e as number, title: t as string } })),
  );
  await db.moment.update({ where: { id: moments[0].id }, data: { reservedById: members[0].id, reservedAt: new Date() } });

  const now = Date.now();
  const clipsSpec: { m: number; platform: Platform; id: string; ageH: number; moment?: number }[] = [
    { m: 0, platform: "TIKTOK", id: "7301000000000000001", ageH: 240, moment: 0 },
    { m: 0, platform: "INSTAGRAM", id: "DemoReelA1", ageH: 200 },
    { m: 0, platform: "TIKTOK", id: "7301000000000000003", ageH: 30 },
    { m: 1, platform: "TIKTOK", id: "7301000000000000011", ageH: 220 },
    { m: 1, platform: "X", id: "1790000000000000005", ageH: 50 },
    { m: 2, platform: "TIKTOK", id: "7301000000000000006", ageH: 190 },
    { m: 2, platform: "INSTAGRAM", id: "DemoReelB9", ageH: 20 },
  ];
  for (const s of clipsSpec) {
    const createdAt = new Date(now - s.ageH * H);
    const clip = await db.clip.create({
      data: {
        workspaceId: ws.id, membershipId: members[s.m].id, platform: s.platform, externalId: s.id, createdAt,
        momentId: s.moment !== undefined ? moments[s.moment].id : null,
        url: s.platform === "TIKTOK" ? `https://www.tiktok.com/@demo/video/${s.id}` : s.platform === "INSTAGRAM" ? `https://www.instagram.com/reel/${s.id}/` : `https://x.com/demo/status/${s.id}`,
      },
    });
    // relevés horaires simulés sur les 12 premières heures puis toutes les 12 h
    const points = [...Array(13).keys()].concat([24, 36, 48, 72, 96, 120, 168, 200, 240]).filter((h) => h <= s.ageH);
    for (const h of points) {
      const at = new Date(createdAt.getTime() + h * H);
      const stats = await demoProvider({ platform: s.platform, externalId: s.id, submittedAt: createdAt, now: at });
      await recordStats(clip.id, stats!, "DEMO", at);
    }
  }
  const flagged = await db.clip.count({ where: { workspaceId: ws.id, status: "FLAGGED" } });
  console.log(`Démo prête : ${clipsSpec.length} clips dont ${flagged} suspect(s). Connexion : demo@clipsquad.fr / demo1234`);
}

main().finally(() => db.$disconnect());
