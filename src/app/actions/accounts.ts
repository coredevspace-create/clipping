"use server";

import { requireUser } from "@/lib/auth";
import { decrypt } from "@/lib/crypto";
import { db } from "@/lib/db";
import { OAUTH_PLATFORMS, PROVIDERS, type OAuthPlatform } from "@/lib/oauth/providers";
import { done, fail } from "./util";

/** Déconnecte un compte : révoque l'accès chez la plateforme (si possible) et supprime les jetons. */
export async function disconnectAccount(platform: string) {
  const user = await requireUser();
  if (!OAUTH_PLATFORMS.includes(platform as OAuthPlatform)) fail("/app/comptes", "Plateforme inconnue.");
  const acc = await db.connectedAccount.findUnique({ where: { userId_platform: { userId: user.id, platform } } });
  if (!acc) fail("/app/comptes", "Aucun compte connecté.");
  try {
    const token = decrypt(acc.accessToken);
    if (platform === "YOUTUBE") {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`, { method: "POST" });
    } else if (platform === "TIKTOK" && process.env.TIKTOK_CLIENT_KEY) {
      await fetch("https://open.tiktokapis.com/v2/oauth/revoke/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ client_key: process.env.TIKTOK_CLIENT_KEY, client_secret: process.env.TIKTOK_CLIENT_SECRET ?? "", token }),
      });
    }
  } catch {
    // la révocation est un bonus : on supprime quoi qu'il arrive
  }
  await db.connectedAccount.delete({ where: { id: acc.id } });
  await db.clip.updateMany({ where: { platform, membership: { userId: user.id } }, data: { ownershipVerified: null, audienceShare: null } });
  done("/app/comptes", `Compte ${PROVIDERS[platform as OAuthPlatform].label} déconnecté et jetons supprimés.`);
}
