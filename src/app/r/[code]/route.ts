import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { detectDevice, smartLinkTarget } from "@/lib/product";

export const dynamic = "force-dynamic";

/**
 * Lien intelligent d'un clippeur : iPhone → App Store, Android → Play Store, ordinateur → site.
 * Le clic est compté (visiteur anonymisé, une fois par jour) avec le type d'appareil.
 */
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const m = await db.membership.findUnique({ where: { trackingCode: code }, include: { workspace: true } });
  const ua = req.headers.get("user-agent") ?? "";
  const device = detectDevice(ua);
  const target = m && m.status === "ACTIVE" ? smartLinkTarget(m.workspace, device, code) : null;
  if (!m || !target) return new Response("Lien introuvable", { status: 404 });

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const isBot = /bot|crawl|spider|preview|facebookexternalhit|slurp|headless/i.test(ua);
  if (!isBot) {
    const day = new Date().toISOString().slice(0, 10);
    const visitorHash = createHash("sha256").update(`${ip}|${ua}|${day}|${process.env.AUTH_SECRET}`).digest("hex").slice(0, 32);
    const already = await db.linkClick.findFirst({ where: { membershipId: m.id, visitorHash } });
    if (!already) await db.linkClick.create({ data: { membershipId: m.id, visitorHash, device } });
  }
  return Response.redirect(target, 302);
}
