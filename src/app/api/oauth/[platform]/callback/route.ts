import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { currentUserId } from "@/lib/auth";
import { appUrl } from "@/lib/config";
import { saveAccount } from "@/lib/oauth/accounts";
import { providerFromSlug } from "@/lib/oauth/providers";
import { verifyState } from "@/lib/oauth/state";

export const dynamic = "force-dynamic";

/** Retour de la plateforme après autorisation : on échange le code contre un jeton et on enregistre le compte. */
export async function GET(req: Request, { params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const url = new URL(req.url);
  const go = (path: string, key: "ok" | "erreur", msg: string) =>
    NextResponse.redirect(`${appUrl()}${path}${path.includes("?") ? "&" : "?"}${key}=${encodeURIComponent(msg)}`);

  const provider = providerFromSlug(platform);
  if (!provider) return go("/app/comptes", "erreur", "Plateforme inconnue.");

  let state;
  try {
    state = await verifyState(url.searchParams.get("state") ?? "");
  } catch {
    return go("/app/comptes", "erreur", "La connexion a expiré, recommence.");
  }
  const jar = await cookies();
  const nonce = jar.get("oauth_nonce")?.value;
  jar.delete("oauth_nonce");
  const uid = await currentUserId();
  if (!nonce || nonce !== state.nonce || uid !== state.uid || state.platform !== provider.platform) {
    return go(state.back, "erreur", "Connexion refusée (session différente). Recommence depuis cette page.");
  }

  const code = url.searchParams.get("code");
  if (!code) {
    const denied = url.searchParams.get("error") || url.searchParams.get("error_reason");
    return go(state.back, "erreur", denied ? `Autorisation refusée sur ${provider.label}.` : "Réponse invalide de la plateforme.");
  }

  try {
    const t = await provider.exchange(code);
    await saveAccount(state.uid, provider.platform, t);
    return go(state.back, "ok", `Compte ${provider.label} connecté : ${t.username}. Tes vues sont maintenant vérifiées automatiquement.`);
  } catch (e) {
    console.error(`[oauth ${provider.platform}]`, e);
    const msg = (e as Error).message;
    const network = /fetch failed|ECONN|ETIMEDOUT|ENOTFOUND/i.test(msg);
    return go(state.back, "erreur", network ? `Impossible de joindre ${provider.label} pour le moment, réessaie dans quelques minutes.` : msg.slice(0, 200));
  }
}
