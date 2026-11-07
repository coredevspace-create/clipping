import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";

export function fail(path: string, message: string): never {
  redirect(`${path}${path.includes("?") ? "&" : "?"}erreur=${encodeURIComponent(message)}`);
}

export function done(path: string, message: string): never {
  redirect(`${path}${path.includes("?") ? "&" : "?"}ok=${encodeURIComponent(message)}`);
}

export const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

export function code(len = 10) {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(len);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

/** Montant saisi en euros ("1,50" ou "1.5") → centimes */
export function eurosToCents(v: string): number | null {
  const n = Number(v.replace(",", ".").replace(/\s/g, ""));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
}

export function intOrNull(v: string, min = 0, max = Number.MAX_SAFE_INTEGER): number | null {
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
}
