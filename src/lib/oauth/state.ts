import { jwtVerify, SignJWT } from "jose";

/** « state » OAuth signé : lie le retour de la plateforme à l'utilisateur et au navigateur qui ont lancé la connexion. */
const key = () => new TextEncoder().encode(`oauth-state:${process.env.AUTH_SECRET}`);

export async function signState(payload: { uid: string; platform: string; nonce: string; back: string }) {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("10m").sign(key());
}

export async function verifyState(token: string) {
  const { payload } = await jwtVerify(token, key());
  return payload as unknown as { uid: string; platform: string; nonce: string; back: string };
}
