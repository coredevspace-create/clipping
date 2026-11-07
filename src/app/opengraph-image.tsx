import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { APP_NAME } from "@/lib/config";

/** Image d'aperçu quand le lien du site est partagé (LinkedIn, X, WhatsApp, Discord…). */
export const alt = `${APP_NAME} — Des vues qui deviennent des téléchargements`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const bg = await readFile(path.join(process.cwd(), "public/images/og-bg.jpg"));
  const src = `data:image/jpeg;base64,${bg.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" width={1200} height={630} style={{ position: "absolute", inset: 0 }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 0 0 72px", width: 640, height: "100%" }}>
          <div style={{ fontSize: 26, fontWeight: 600, color: "#0071e3" }}>Pour les apps et logiciels grand public</div>
          <div style={{ fontSize: 64, fontWeight: 700, color: "#1d1d1f", lineHeight: 1.05, letterSpacing: -2, marginTop: 16 }}>
            Des vues qui deviennent des téléchargements.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 36, fontSize: 28, fontWeight: 600, color: "#1d1d1f" }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: "#1d1d1f" }} />
            {APP_NAME.toLowerCase()}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
