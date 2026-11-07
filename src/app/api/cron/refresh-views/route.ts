import { NextResponse } from "next/server";
import { refreshDueClips } from "@/lib/tracking";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** À appeler toutes les heures (Vercel Cron, GitHub Actions, cron-job.org…) avec Authorization: Bearer <CRON_SECRET>. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  return NextResponse.json(await refreshDueClips());
}
