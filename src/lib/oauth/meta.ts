import { createHmac, timingSafeEqual } from "node:crypto";

/** Vérifie et décode le « signed_request » envoyé par Meta (désautorisation / suppression des données). */
export function parseSignedRequest(signed: string, secret: string): { user_id?: string; algorithm?: string } | null {
  const [sig, payload] = signed.split(".");
  if (!sig || !payload) return null;
  const expected = createHmac("sha256", secret).update(payload).digest();
  const given = Buffer.from(sig.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}
