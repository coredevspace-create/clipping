import { describe, expect, it } from "vitest";
import { dailySeries } from "@/lib/series";
import { containsCode } from "@/lib/verify";

describe("code de vérification dans la description", () => {
  it("trouve le code avec ou sans #, quelle que soit la casse", () => {
    expect(containsCode("Super clip #cs7k2p #saas", "cs7k2p")).toBe(true);
    expect(containsCode("lien en bio CS7K2P", "cs7k2p")).toBe(true);
    expect(containsCode("cs7k2p", "cs7k2p")).toBe(true);
  });
  it("ne se laisse pas tromper par un code voisin", () => {
    expect(containsCode("#cs7k2px", "cs7k2p")).toBe(false);
    expect(containsCode("xcs7k2p", "cs7k2p")).toBe(false);
    expect(containsCode("", "cs7k2p")).toBe(false);
    expect(containsCode(null, "cs7k2p")).toBe(false);
  });
});

describe("dailySeries", () => {
  it("additionne le dernier relevé de chaque clip, jour par jour", () => {
    const now = new Date("2026-11-07T12:00:00");
    const d = (day: number, h = 10) => new Date(`2026-11-0${day}T${String(h).padStart(2, "0")}:00:00`);
    const s = dailySeries(
      [
        [{ capturedAt: d(5), views: 100 }, { capturedAt: d(6), views: 300 }, { capturedAt: d(7), views: 500 }],
        [{ capturedAt: d(6, 20), views: 50 }],
      ],
      3,
      now,
    );
    expect(s.map((p) => p.views)).toEqual([100, 350, 550]);
  });
});
