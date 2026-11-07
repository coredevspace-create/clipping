export type Platform = "YOUTUBE" | "TIKTOK" | "INSTAGRAM" | "X";

export const PLATFORM_LABELS: Record<Platform, string> = {
  YOUTUBE: "YouTube Shorts",
  TIKTOK: "TikTok",
  INSTAGRAM: "Instagram Reels",
  X: "X (Twitter)",
};

export type ParsedClipUrl =
  | { ok: true; platform: Platform; externalId: string; url: string }
  | { ok: false; error: string };

/** Reconnaît la plateforme et l'identifiant de la vidéo à partir du lien soumis par le clippeur. */
export function parseClipUrl(raw: string): ParsedClipUrl {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return { ok: false, error: "Lien invalide." };
  }
  const host = u.hostname.replace(/^(www\.|m\.|mobile\.)/, "").toLowerCase();
  const parts = u.pathname.split("/").filter(Boolean);

  if (host === "youtube.com" || host === "music.youtube.com") {
    if (parts[0] === "shorts" && parts[1]) return ok("YOUTUBE", parts[1], u);
    const v = u.searchParams.get("v");
    if (parts[0] === "watch" && v) return ok("YOUTUBE", v, u);
  }
  if (host === "youtu.be" && parts[0]) return ok("YOUTUBE", parts[0], u);

  if (host === "tiktok.com") {
    const i = parts.indexOf("video");
    if (i >= 0 && /^\d+$/.test(parts[i + 1] ?? "")) return ok("TIKTOK", parts[i + 1], u);
  }
  if (host === "vm.tiktok.com" || host === "vt.tiktok.com") {
    return { ok: false, error: "Lien TikTok raccourci : ouvre la vidéo et copie le lien complet (tiktok.com/@compte/video/…)." };
  }

  if (host === "instagram.com" && ["reel", "reels", "p"].includes(parts[0]) && parts[1]) {
    return ok("INSTAGRAM", parts[1], u);
  }

  if ((host === "x.com" || host === "twitter.com") && parts[1] === "status" && /^\d+$/.test(parts[2] ?? "")) {
    return ok("X", parts[2], u);
  }

  return { ok: false, error: "Plateforme non reconnue. Liens acceptés : YouTube Shorts, TikTok, Instagram Reels, X." };
}

function ok(platform: Platform, externalId: string, u: URL): ParsedClipUrl {
  return { ok: true, platform, externalId, url: `${u.origin}${u.pathname}${platform === "YOUTUBE" && u.searchParams.get("v") ? `?v=${u.searchParams.get("v")}` : ""}` };
}
