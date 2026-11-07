import { describe, expect, it } from "vitest";
import { demoProvider } from "@/lib/views/demo";

describe("demoProvider", () => {
  it("ne produit jamais de valeurs négatives", async () => {
    const submittedAt = new Date("2026-01-01T00:00:00Z");
    for (let i = 0; i < 300; i++) {
      const s = await demoProvider({ platform: "TIKTOK", externalId: `id-${i}`, submittedAt, now: new Date(submittedAt.getTime() + (i % 50) * 3_600_000) });
      expect(Math.min(s!.views, s!.likes, s!.comments, s!.shares)).toBeGreaterThanOrEqual(0);
    }
  });
});
