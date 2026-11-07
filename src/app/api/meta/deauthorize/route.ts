import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseSignedRequest } from "@/lib/oauth/meta";

export const dynamic = "force-dynamic";

/** Meta : l'utilisateur a retiré l'accès de l'app depuis Instagram → on supprime le compte connecté. */
export async function POST(req: Request) {
  const fd = await req.formData().catch(() => null);
  const data = parseSignedRequest(String(fd?.get("signed_request") ?? ""), process.env.INSTAGRAM_APP_SECRET ?? "");
  if (!data?.user_id) return NextResponse.json({ error: "signed_request invalide" }, { status: 400 });
  await db.connectedAccount.deleteMany({ where: { platform: "INSTAGRAM", externalUserId: String(data.user_id) } });
  return NextResponse.json({ ok: true });
}
