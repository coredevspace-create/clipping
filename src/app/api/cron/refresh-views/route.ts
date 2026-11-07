import { NextResponse } from "next/server";
import { refreshDueClips } from "@/lib/tracking";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Relevé des vues. Appelé par Vercel Cron (1×/jour sur l'offre gratuite, en-tête ajouté automatiquement)
 * et par le workflow GitHub Actions toutes les heures. En-tête requis : Authorization: Bearer <CRON_SECRET>.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  return NextResponse.json(await refreshDueClips());
}
