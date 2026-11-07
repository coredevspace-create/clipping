import { describe, expect, it } from "vitest";
import { analyzeClip, nextStatus, type Snapshot } from "@/lib/fraud";

const t0 = new Date("2026-01-01T10:00:00Z").getTime();
const snap = (h: number, views: number, likes: number): Snapshot => ({ views, likes, comments: 0, shares: 0, capturedAt: new Date(t0 + h * 3_600_000) });
const codes = (r: ReturnType<typeof analyzeClip>) => r.reasons.map((x) => x.code);

describe("analyzeClip", () => {
  it("ne signale rien pour une croissance organique", () => {
    const snapshots = [snap(0, 0, 0), snap(1, 1200, 60), snap(2, 2500, 120), snap(3, 3400, 170), snap(4, 4000, 200)];
    const r = analyzeClip({ views: 4000, likes: 200, comments: 15, shares: 10, snapshots, submittedAt: new Date(t0) });
    expect(r.score).toBe(0);
  });

  it("détecte un pic de bots : marche d'escalier sans engagement", () => {
    const snapshots = [snap(0, 0, 0), snap(1, 800, 40), snap(2, 1500, 75), snap(3, 51_500, 80), snap(4, 52_000, 90)];
    const r = analyzeClip({ views: 52_000, likes: 90, comments: 2, shares: 0, snapshots, submittedAt: new Date(t0) });
    expect(codes(r)).toEqual(expect.arrayContaining(["LOW_ENGAGEMENT", "SPIKE", "VIEWS_WITHOUT_ENGAGEMENT"]));
    expect(r.score).toBeGreaterThanOrEqual(50);
  });

  it("signale une vidéo publiée bien avant sa soumission", () => {
    const r = analyzeClip({ views: 500, likes: 30, comments: 1, shares: 0, snapshots: [], submittedAt: new Date(t0), postedAt: new Date(t0 - 20 * 86_400_000) });
    expect(codes(r)).toContain("OLD_VIDEO");
  });

  it("signale un clip hors norme pour le clippeur avec engagement faible", () => {
    const r = analyzeClip({ views: 60_000, likes: 300, comments: 0, shares: 0, snapshots: [], submittedAt: new Date(t0), clipperMedianViews: 2000 });
    expect(codes(r)).toEqual(expect.arrayContaining(["OUTLIER", "WEAK_ENGAGEMENT"]));
  });

  it("utilise la géographie de l'audience quand elle est disponible", () => {
    const r = analyzeClip({ views: 10_000, likes: 500, comments: 20, shares: 10, snapshots: [], submittedAt: new Date(t0), expectedAudienceShare: 0.15 });
    expect(codes(r)).toEqual(["GEO_MISMATCH"]);
  });

  it("plafonne le score à 100", () => {
    const snapshots = [snap(0, 0, 0), snap(1, 100, 5), snap(2, 200, 10), snap(3, 90_000, 10), snap(4, 90_100, 10)];
    const r = analyzeClip({ views: 90_100, likes: 10, comments: 0, shares: 0, snapshots, submittedAt: new Date(t0), postedAt: new Date(t0 - 30 * 86_400_000), clipperMedianViews: 500, expectedAudienceShare: 0.05 });
    expect(r.score).toBe(100);
  });
});

describe("nextStatus", () => {
  it("met en quarantaine au-dessus du seuil", () => expect(nextStatus("PENDING", 60, 50, false)).toBe("FLAGGED"));
  it("respecte la validation manuelle", () => expect(nextStatus("APPROVED", 90, 50, true)).toBe("APPROVED"));
  it("ne touche pas aux clips refusés", () => expect(nextStatus("REJECTED", 0, 50, false)).toBe("REJECTED"));
  it("sort de quarantaine si le signal disparaît", () => expect(nextStatus("FLAGGED", 10, 50, false)).toBe("PENDING"));
});

describe("libellés", () => {
  it("formate correctement les pourcentages", () => {
    const r = analyzeClip({ views: 10_000, likes: 1, comments: 0, shares: 0, snapshots: [], submittedAt: new Date(t0), expectedAudienceShare: 0.1 });
    expect(r.reasons.find((x) => x.code === "GEO_MISMATCH")?.label).toContain("10 %");
    expect(r.reasons.find((x) => x.code === "LOW_ENGAGEMENT")?.label).toContain("0,01 %");
  });
});
