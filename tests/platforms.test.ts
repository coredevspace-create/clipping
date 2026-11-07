import { describe, expect, it } from "vitest";
import { parseClipUrl } from "@/lib/platforms";

describe("parseClipUrl", () => {
  it.each([
    ["https://www.youtube.com/shorts/abcDEF12345", "YOUTUBE", "abcDEF12345"],
    ["https://youtu.be/abcDEF12345?si=xyz", "YOUTUBE", "abcDEF12345"],
    ["https://www.youtube.com/watch?v=abcDEF12345&t=3", "YOUTUBE", "abcDEF12345"],
    ["https://www.tiktok.com/@moncompte/video/7301234567890123456?lang=fr", "TIKTOK", "7301234567890123456"],
    ["https://www.instagram.com/reel/C1a2B3c4D5e/?igsh=abc", "INSTAGRAM", "C1a2B3c4D5e"],
    ["https://x.com/moncompte/status/1790000000000000000", "X", "1790000000000000000"],
  ])("%s", (url, platform, id) => {
    const r = parseClipUrl(url);
    expect(r).toMatchObject({ ok: true, platform, externalId: id });
  });

  it("refuse les liens TikTok raccourcis et les plateformes inconnues", () => {
    expect(parseClipUrl("https://vm.tiktok.com/ZMabc/").ok).toBe(false);
    expect(parseClipUrl("https://example.com/video/1").ok).toBe(false);
    expect(parseClipUrl("pas un lien").ok).toBe(false);
  });

  it("normalise l'URL (supprime les paramètres de suivi)", () => {
    const r = parseClipUrl("https://www.tiktok.com/@a/video/123?is_from_webapp=1");
    expect(r.ok && r.url).toBe("https://www.tiktok.com/@a/video/123");
  });
});
