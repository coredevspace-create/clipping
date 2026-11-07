import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { appUrl } from "@/lib/config";
import { currentUserId } from "@/lib/auth";
import { providerFromSlug } from "@/lib/oauth/providers";
import { signState } from "@/lib/oauth/state";

export const dynamic = "force-dynamic";

/** Lance la connexion d'un compte : redirige vers la page d'autorisation de la plateforme. */
export async function GET(req: Request, { params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const back = new URL(req.url).searchParams.get("back") ?? "/app/comptes";
  const safeBack = back.startsWith("/") && !back.startsWith("//") ? back : "/app/comptes";
  const uid = await currentUserId();
  if (!uid) return NextResponse.redirect(`${appUrl()}/connexion?next=${encodeURIComponent(safeBack)}`);
  const provider = providerFromSlug(platform);
  if (!provider || !provider.configured()) {
    return NextResponse.redirect(`${appUrl()}${safeBack}?erreur=${encodeURIComponent("Cette plateforme n'est pas encore disponible.")}`);
  }
  const nonce = randomBytes(16).toString("base64url");
  (await cookies()).set("oauth_nonce", nonce, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 600 });
  const state = await signState({ uid, platform: provider.platform, nonce, back: safeBack });
  return NextResponse.redirect(provider.authorizeUrl(state));
}
