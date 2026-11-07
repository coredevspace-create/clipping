import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { appUrl } from "@/lib/config";
import { db } from "@/lib/db";
import { parseSignedRequest } from "@/lib/oauth/meta";

export const dynamic = "force-dynamic";

/**
 * Meta : demande de suppression des données. On supprime le compte Instagram connecté (jetons)
 * et les statistiques d'audience issues d'Instagram, puis on renvoie un code de confirmation.
 */
export async function POST(req: Request) {
  const fd = await req.formData().catch(() => null);
  const data = parseSignedRequest(String(fd?.get("signed_request") ?? ""), process.env.INSTAGRAM_APP_SECRET ?? "");
  if (!data?.user_id) return NextResponse.json({ error: "signed_request invalide" }, { status: 400 });
  const accounts = await db.connectedAccount.findMany({ where: { platform: "INSTAGRAM", externalUserId: String(data.user_id) } });
  for (const a of accounts) {
    await db.clip.updateMany({
      where: { platform: "INSTAGRAM", membership: { userId: a.userId } },
      data: { audienceShare: null, ownershipVerified: null },
    });
  }
  await db.connectedAccount.deleteMany({ where: { platform: "INSTAGRAM", externalUserId: String(data.user_id) } });
  const code = randomBytes(8).toString("hex");
  return NextResponse.json({ url: `${appUrl()}/suppression-donnees?code=${code}`, confirmation_code: code });
}
