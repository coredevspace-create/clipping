import { describe, expect, it } from "vitest";
import { costPer, detectDevice, smartLinkTarget } from "@/lib/product";

const w = { productUrl: "https://budgie.app", appStoreUrl: "https://apps.apple.com/fr/app/budgie/id123", playStoreUrl: "https://play.google.com/store/apps/details?id=app.budgie", appStoreProviderToken: "998877" };

describe("lien intelligent", () => {
  it("détecte l'appareil", () => {
    expect(detectDevice("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)")).toBe("IOS");
    expect(detectDevice("Mozilla/5.0 (Linux; Android 15; Pixel 9)")).toBe("ANDROID");
    expect(detectDevice("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)")).toBe("DESKTOP");
  });
  it("iPhone → App Store avec le marquage de campagne du clippeur", () => {
    const u = new URL(smartLinkTarget(w, "IOS", "abc")!);
    expect(u.hostname).toBe("apps.apple.com");
    expect(u.searchParams.get("ct")).toBe("clipsquad-abc");
    expect(u.searchParams.get("pt")).toBe("998877");
  });
  it("Android → Play Store avec referrer", () => {
    const u = new URL(smartLinkTarget(w, "ANDROID", "abc")!);
    expect(u.searchParams.get("id")).toBe("app.budgie");
    expect(u.searchParams.get("referrer")).toBe("utm_source=clipsquad&utm_medium=clip&utm_content=abc");
  });
  it("ordinateur → site avec UTM", () => {
    expect(new URL(smartLinkTarget(w, "DESKTOP", "abc")!).searchParams.get("utm_content")).toBe("abc");
  });
  it("sans site : renvoie vers un store", () => {
    expect(smartLinkTarget({ ...w, productUrl: null }, "DESKTOP", "abc")).toBe(w.appStoreUrl);
    expect(smartLinkTarget({ productUrl: null, appStoreUrl: null, playStoreUrl: null, appStoreProviderToken: null }, "IOS", "abc")).toBeNull();
  });
  it("coût par conversion", () => {
    expect(costPer(1000, 4)).toBe(250);
    expect(costPer(1000, 0)).toBeNull();
  });
});
