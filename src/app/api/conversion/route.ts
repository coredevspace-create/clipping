import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };
const KINDS = new Set(["INSTALL", "SIGNUP", "PURCHASE"]);

/**
 * URL de conversion appelée par le produit du créateur (inscription, achat, installation) :
 *   /api/conversion?key=CLE&ref=CODE_DU_CLIPPEUR&type=signup&id=ID_UNIQUE
 * « ref » est le code reçu dans utm_content quand le visiteur est arrivé par le lien du clippeur.
 * « id » (facultatif mais conseillé) évite de compter deux fois le même événement.
 */
async function handle(req: Request) {
  const url = new URL(req.url);
  const body = req.method === "POST" ? ((await req.json().catch(() => ({}))) as Record<string, string>) : {};
  const get = (k: string) => (body[k] ?? url.searchParams.get(k) ?? "").toString().trim();
  const key = get("key");
  const ref = get("ref");
  const kind = (get("type") || "signup").toUpperCase();
  const externalId = get("id").slice(0, 120) || null;
  if (!key || !ref) return NextResponse.json({ error: "Paramètres key et ref obligatoires." }, { status: 400, headers: CORS });
  if (!KINDS.has(kind)) return NextResponse.json({ error: "type doit valoir install, signup ou purchase." }, { status: 400, headers: CORS });

  const m = await db.membership.findFirst({ where: { trackingCode: ref, workspace: { conversionKey: key } } });
  if (!m) return NextResponse.json({ error: "Clé ou code clippeur inconnu." }, { status: 404, headers: CORS });

  if (externalId && (await db.conversion.findUnique({ where: { workspaceId_externalId: { workspaceId: m.workspaceId, externalId } } }))) {
    return NextResponse.json({ ok: true, duplicate: true }, { headers: CORS });
  }
  await db.conversion.create({ data: { workspaceId: m.workspaceId, membershipId: m.id, kind, source: "POSTBACK", externalId } });
  return NextResponse.json({ ok: true }, { headers: CORS });
}

export const GET = handle;
export const POST = handle;
export const OPTIONS = () => new Response(null, { status: 204, headers: CORS });
