import { describe, expect, it } from "vitest";
import { clipEarnings, computePayouts, type PayableClip } from "@/lib/payouts";

const settings = { cpmCents: 150, minViews: 1000, maxPayoutPerClipCents: 5000, holdDays: 7 };
const now = new Date("2026-02-01T00:00:00Z");
const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000);
const clip = (o: Partial<PayableClip>): PayableClip => ({ id: "c", membershipId: "m1", status: "APPROVED", views: 0, paidViews: 0, paidCents: 0, createdAt: daysAgo(10), ...o });

describe("clipEarnings", () => {
  it("applique CPM, seuil et plafond", () => {
    expect(clipEarnings(999, settings)).toBe(0);
    expect(clipEarnings(10_000, settings)).toBe(1500);
    expect(clipEarnings(1_000_000, settings)).toBe(5000);
  });
});

describe("computePayouts", () => {
  it("regroupe par clippeur et ne paie que la différence", () => {
    const drafts = computePayouts(
      [
        clip({ id: "a", views: 10_000 }),
        clip({ id: "b", views: 20_000, paidViews: 10_000, paidCents: 1500 }),
        clip({ id: "c", membershipId: "m2", views: 4000 }),
      ],
      settings,
      now,
    );
    expect(drafts).toEqual([
      expect.objectContaining({ membershipId: "m1", amountCents: 3000, views: 20_000 }),
      expect.objectContaining({ membershipId: "m2", amountCents: 600 }),
    ]);
  });

  it("exclut suspects, refusés et clips encore dans le délai de vérification", () => {
    const drafts = computePayouts(
      [
        clip({ id: "f", status: "FLAGGED", views: 50_000 }),
        clip({ id: "r", status: "REJECTED", views: 50_000 }),
        clip({ id: "p", status: "PENDING", views: 50_000, createdAt: daysAgo(2) }),
        clip({ id: "ok", status: "PENDING", views: 2000, createdAt: daysAgo(8) }),
      ],
      settings,
      now,
    );
    expect(drafts).toHaveLength(1);
    expect(drafts[0].lines.map((l) => l.clipId)).toEqual(["ok"]);
  });

  it("ne repaie rien quand le plafond est déjà atteint", () => {
    expect(computePayouts([clip({ views: 900_000, paidCents: 5000, paidViews: 400_000 })], settings, now)).toEqual([]);
  });
});
