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
  await db.application.deleteMany({ where: { OR: [{ userId: { in: ids } }, { offer: { workspaceId: { in: wsIds } } }] } });
  await db.invitation.deleteMany({ where: { OR: [{ userId: { in: ids } }, { workspaceId: { in: wsIds } }] } });
  await db.offer.deleteMany({ where: { workspaceId: { in: wsIds } } });
  await db.clipperProfile.deleteMany({ where: { userId: { in: ids } } });
  await db.payoutRun.deleteMany({ where: { workspaceId: { in: wsIds } } });
  await db.clip.deleteMany({ where: { workspaceId: { in: wsIds } } });
  await db.moment.deleteMany({ where: { source: { workspaceId: { in: wsIds } } } });
  await db.workspace.deleteMany({ where: { id: { in: wsIds } } });
  await db.membership.deleteMany({ where: { userId: { in: ids } } });
  await db.user.deleteMany({ where: { id: { in: ids } } });
  const passwordHash = await bcrypt.hash("demo1234", 10);
  const owner = await db.user.create({ data: { email: "demo@clipsquad.fr", name: "Julie (fondatrice)", passwordHash, role: "CREATOR" } });
  const ws = await db.workspace.create({
    data: {
      name: "Budgie — l'app de budget", ownerId: owner.id, inviteCode: "demo-invite", productType: "APP",
      productUrl: "https://example.com", appStoreUrl: "https://apps.apple.com/fr/app/budgie/id0000000000", playStoreUrl: "https://play.google.com/store/apps/details?id=app.budgie.demo",
      cpmCents: 120, minViews: 1000, maxPayoutPerClipCents: 8000,
    },
  });

  const names = [["lea", "Léa"], ["sami", "Sami"], ["noah", "Noah"]];
  const members = [];
  for (const [slug, name] of names) {
    const u = await db.user.create({ data: { email: `${slug}@clipsquad.fr`, name, passwordHash, role: "CLIPPER" } });
    members.push(await db.membership.create({ data: { workspaceId: ws.id, userId: u.id, trackingCode: `demo-${slug}`, payoutMethod: "IBAN", payoutDetails: "FR7630006000011234567890189" } }));
  }

  const src = await db.source.create({
    data: { workspaceId: ws.id, title: "Démo complète de l'app (écran enregistré)", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", notes: "Montre l'app à l'écran, sous-titres obligatoires, « lien en bio » à la fin." },
  });
  const moments = await Promise.all(
    [
      [12, 41, "Créer son premier budget en 20 secondes"],
      [95, 130, "L'alerte « tu vas dépasser » en action"],
      [180, 214, "Le défi 30 jours sans dépense inutile"],
      [260, 290, "Le graphique des abonnements oubliés"],
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
  // ——— Discussion d'équipe ———
  const ago = (m: number) => new Date(now - m * 60_000);
  const lea = members[0], sami = members[1];
  await db.message.createMany({
    data: [
      { workspaceId: ws.id, userId: owner.id, channel: "annonces", body: "Bienvenue dans l'équipe ! Nouveau live jeudi 20 h : les moments à clipper seront dans l'onglet « Moments à clipper » vendredi matin.", createdAt: ago(60 * 26) },
      { workspaceId: ws.id, userId: owner.id, channel: "annonces", body: "Rappel : sous-titres obligatoires et mention de Budgie dans la description. Les clips avec des vues achetées sont refusés.", createdAt: ago(60 * 3) },
      { workspaceId: ws.id, userId: lea.userId, channel: "general", body: "Hello tout le monde 👋 mon clip sur le premier client LinkedIn vient de passer les 15k vues !", createdAt: ago(95) },
      { workspaceId: ws.id, userId: owner.id, channel: "general", body: "Bravo Léa 🔥 le hook des 2 premières secondes est parfait.", createdAt: ago(90) },
      { workspaceId: ws.id, userId: sami.userId, channel: "entraide", body: "Vous utilisez quoi pour les sous-titres animés ? Je cherche un truc rapide.", createdAt: ago(40) },
      { workspaceId: ws.id, userId: lea.userId, channel: "entraide", body: "CapCut avec le style « karaoké », et je corrige à la main les noms propres.", createdAt: ago(35) },
    ],
  });

  // ——— Clics par appareil et téléchargements attribués ———
  const devices = ["IOS", "IOS", "IOS", "ANDROID", "ANDROID", "DESKTOP"];
  for (const [i, m] of members.entries()) {
    const n = [180, 95, 120][i];
    await db.linkClick.createMany({ data: Array.from({ length: n }, (_, k) => ({ membershipId: m.id, visitorHash: `demo-${i}-${k}`, device: devices[k % devices.length], createdAt: new Date(now - (k % 14) * 86_400_000) })) });
  }
  await db.conversion.createMany({
    data: [
      { workspaceId: ws.id, membershipId: members[0].id, kind: "INSTALL", quantity: 132, source: "MANUAL", note: "App Store Connect" },
      { workspaceId: ws.id, membershipId: members[0].id, kind: "INSTALL", quantity: 41, source: "MANUAL", note: "Play Console" },
      { workspaceId: ws.id, membershipId: members[1].id, kind: "INSTALL", quantity: 9, source: "MANUAL", note: "App Store Connect" },
      { workspaceId: ws.id, membershipId: members[2].id, kind: "INSTALL", quantity: 88, source: "MANUAL", note: "App Store Connect" },
    ],
  });

  // ——— Place de marché ———
  await db.offer.create({
    data: {
      workspaceId: ws.id, niche: "Finance / budget", platforms: "TIKTOK,YOUTUBE,INSTAGRAM",
      title: "Fais découvrir Budgie aux 18-30 ans",
      description: "Budgie est une app de budget pour les étudiants et jeunes actifs : on voit où part son argent en 2 minutes par jour. On cherche des clippeurs TikTok / Reels pour des démos et des storytimes « fin de mois ».",
      requirements: "Format « démo express » : le problème en une phrase, l'écran clé de l'app, le résultat avant / après.\n\n• Format vertical 9:16, 15 à 45 secondes, sous-titres\n• Nom de l'app visible + « lien en bio »\n• Ton code de vérification dans la description",
    },
  });
  const extra = [
    { slug: "marc", name: "Marc (Lingo)", ws: "Lingo — apprends l'anglais en 5 min/jour", type: "APP", niche: "Éducation / langues", cpm: 150, title: "Clips « j'ai appris l'anglais avec mon téléphone »", desc: "Lingo est une app d'anglais par mini-défis quotidiens. On cherche des clippeurs pour des formats faceless et réaction.", pf: "TIKTOK,YOUTUBE" },
    { slug: "sarah", name: "Sarah (Snapcut)", ws: "Snapcut — le montage vidéo par IA", type: "WEB", niche: "IA grand public", cpm: 100, title: "Montre la magie de Snapcut en 15 secondes", desc: "Snapcut monte automatiquement tes vidéos de vacances. On lance en France : démos avant / après très visuelles.", pf: "TIKTOK,INSTAGRAM" },
  ];
  for (const e of extra) {
    const u = await db.user.create({ data: { email: `${e.slug}@clipsquad.fr`, name: e.name, passwordHash, role: "CREATOR" } });
    const w = await db.workspace.create({ data: { name: e.ws, ownerId: u.id, inviteCode: `demo-${e.slug}`, productType: e.type, productUrl: "https://example.com", cpmCents: e.cpm, minViews: 2000, maxPayoutPerClipCents: 12000 } });
    await db.offer.create({ data: { workspaceId: w.id, niche: e.niche, platforms: e.pf, title: e.title, description: e.desc } });
  }
  const profiles = [
    { userId: (await db.user.findUniqueOrThrow({ where: { email: "lea@clipsquad.fr" } })).id, headline: "Démos d'apps qui convertissent, sous-titres soignés", bio: "2 ans à faire des démos d'apps sur TikTok. Je gère 3 comptes « astuces téléphone ». Mon point fort : les hooks des 2 premières secondes.", niches: "App mobile,Finance / budget", platforms: "TIKTOK,INSTAGRAM", contact: "discord : lea.clips" },
    { userId: (await db.user.findUniqueOrThrow({ where: { email: "noah@clipsquad.fr" } })).id, headline: "Faceless IA & productivité, 1 compte à 40k abonnés", bio: "Je publie chaque jour des shorts « 3 apps qui vont te changer la vie ». J'aime les produits que je peux montrer en 15 secondes.", niches: "IA grand public,Productivité", platforms: "YOUTUBE,TIKTOK", contact: "telegram : @noahcuts" },
  ];
  for (const p of profiles) await db.clipperProfile.create({ data: p });
  for (const [slug, name, headline, niches, pf] of [
    ["yanis", "Yanis", "Jeux mobiles : gameplay, réactions, fails", "Jeu mobile,App mobile", "TIKTOK,YOUTUBE"],
    ["chloe", "Chloé", "Storytimes et avant / après pour apps et SaaS", "SaaS web,Santé / sport", "YOUTUBE,TIKTOK,INSTAGRAM"],
  ]) {
    const u = await db.user.create({ data: { email: `${slug}@clipsquad.fr`, name, passwordHash, role: "CLIPPER" } });
    await db.clipperProfile.create({ data: { userId: u.id, headline, bio: "Disponible pour de nouvelles équipes. Je livre 5 à 10 clips par semaine, sous-titrés, avec des hooks testés.", niches, platforms: pf } });
  }

  const flagged = await db.clip.count({ where: { workspaceId: ws.id, status: "FLAGGED" } });
  console.log(`Démo prête : ${clipsSpec.length} clips dont ${flagged} suspect(s). Connexion : demo@clipsquad.fr / demo1234`);
}

main().finally(() => db.$disconnect());
