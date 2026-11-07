"use client";

import { useState } from "react";
import { PlatformIcon } from "./platform-icon";

/** Miniature de la vidéo, avec un visuel de remplacement si elle est absente ou expirée. */
export function Thumb({ src, platform, alt }: { src?: string | null; platform: string; alt: string }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return (
      <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_30%_20%,#2a2a30,#0d0d0f_70%)]">
        <div className="flex flex-col items-center gap-2 opacity-80">
          <PlatformIcon platform={platform} size={36} />
          <span className="font-mono text-[10px] uppercase tracking-widest text-paper/50">aperçu indisponible</span>
        </div>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" referrerPolicy="no-referrer" onError={() => setBroken(true)} className="h-full w-full object-cover" />;
}
