import { decrypt, encrypt } from "../crypto";
import { db } from "../db";
import { PROVIDERS, type OAuthPlatform, type TokenSet } from "./providers";

const expiry = (s?: number | null) => (s ? new Date(Date.now() + s * 1000) : null);

export async function saveAccount(userId: string, platform: OAuthPlatform, t: TokenSet & { externalUserId: string; username: string }) {
  const data = {
    externalUserId: t.externalUserId,
    username: t.username,
    accessToken: encrypt(t.accessToken),
    refreshToken: t.refreshToken ? encrypt(t.refreshToken) : null,
    expiresAt: expiry(t.expiresIn),
    scopes: t.scopes ?? "",
  };
  // un même compte TikTok/Instagram/YouTube ne peut appartenir qu'à un seul clippeur
  const taken = await db.connectedAccount.findFirst({ where: { platform, externalUserId: t.externalUserId, userId: { not: userId } } });
  if (taken) throw new Error("Ce compte est déjà connecté par un autre utilisateur.");
  await db.connectedAccount.upsert({
    where: { userId_platform: { userId, platform } },
    create: { userId, platform, ...data },
    update: data,
  });
}

/**
 * Jeton d'accès valide pour un clippeur et une plateforme (rafraîchi si besoin), ou null s'il n'a pas connecté de compte.
 */
export async function getAccess(userId: string, platform: OAuthPlatform) {
  const acc = await db.connectedAccount.findUnique({ where: { userId_platform: { userId, platform } } });
  if (!acc) return null;
  const provider = PROVIDERS[platform];
  let accessToken = decrypt(acc.accessToken);
  const soon = acc.expiresAt && acc.expiresAt.getTime() < Date.now() + 10 * 60_000;
  // Instagram : rafraîchir le jeton longue durée quand il lui reste moins de 7 jours
  const igRefresh = platform === "INSTAGRAM" && acc.expiresAt && acc.expiresAt.getTime() < Date.now() + 7 * 86_400_000;
  if ((soon || igRefresh) && provider.configured()) {
    const base = platform === "INSTAGRAM" ? accessToken : acc.refreshToken ? decrypt(acc.refreshToken) : null;
    if (base) {
      const t = await provider.refresh(base);
      accessToken = t.accessToken;
      await db.connectedAccount.update({
        where: { id: acc.id },
        data: {
          accessToken: encrypt(t.accessToken),
          refreshToken: t.refreshToken ? encrypt(t.refreshToken) : acc.refreshToken,
          expiresAt: expiry(t.expiresIn),
        },
      });
    }
  }
  return { accessToken, externalUserId: acc.externalUserId, username: acc.username };
}
