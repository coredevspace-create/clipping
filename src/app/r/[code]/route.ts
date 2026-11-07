import { createHash } from "node:crypto";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Lien traqué d'un clippeur : enregistre un clic (visiteur anonymisé) puis redirige vers le produit. */
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const m = await db.membership.findUnique({ where: { trackingCode: code }, include: { workspace: true } });
  if (!m || m.status !== "ACTIVE" || !m.workspace.productUrl) return new Response("Lien introuvable", { status: 404 });

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const ua = req.headers.get("user-agent") ?? "";
  const isBot = /bot|crawl|spider|preview|facebookexternalhit|slurp/i.test(ua);
  if (!isBot) {
    const day = new Date().toISOString().slice(0, 10);
    const visitorHash = createHash("sha256").update(`${ip}|${ua}|${day}|${process.env.AUTH_SECRET}`).digest("hex").slice(0, 32);
    // un visiteur unique compte une fois par jour et par clippeur
    const already = await db.linkClick.findFirst({ where: { membershipId: m.id, visitorHash } });
    if (!already) await db.linkClick.create({ data: { membershipId: m.id, visitorHash } });
  }

  const target = new URL(m.workspace.productUrl);
  target.searchParams.set("utm_source", "clipsquad");
  target.searchParams.set("utm_medium", "clip");
  target.searchParams.set("utm_content", code);
  return Response.redirect(target.toString(), 302);
}
