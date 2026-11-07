"use client";

import { useState } from "react";
import { PlatformIcon } from "./platform-icon";

/** Miniature de la vidéo, avec un visuel de remplacement si elle est absente ou expirée. */
export function Thumb({ src, platform, alt }: { src?: string | null; platform: string; alt: string }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return (
      <div className="grid h-full w-full place-items-center bg-gradient-to-b from-[#e8e8ed] to-[#d2d2d7]">
        <div className="flex flex-col items-center gap-2 opacity-80">
          <PlatformIcon platform={platform} size={36} />
          <span className="text-[11px] font-medium text-zinc-500">Aperçu indisponible</span>
        </div>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" referrerPolicy="no-referrer" onError={() => setBroken(true)} className="h-full w-full object-cover" />;
}
