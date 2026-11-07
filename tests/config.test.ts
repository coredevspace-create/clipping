import { describe, expect, it } from "vitest";
import { appUrl } from "@/lib/config";

describe("appUrl", () => {
  it("utilise APP_URL en priorité", () => expect(appUrl({ APP_URL: "https://clipsquad.fr/", VERCEL_PROJECT_PRODUCTION_URL: "x.vercel.app" })).toBe("https://clipsquad.fr"));
  it("utilise l'adresse Vercel sinon", () => expect(appUrl({ VERCEL_PROJECT_PRODUCTION_URL: "clipping-abc.vercel.app" })).toBe("https://clipping-abc.vercel.app"));
  it("localhost en développement", () => expect(appUrl({})).toBe("http://localhost:3000"));
});
