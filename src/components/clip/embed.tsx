import { PlatformIcon } from "./platform-icon";
import { Thumb } from "./thumb";

/** Lecteur intégré de la plateforme (vertical). X n'a pas de lecteur intégrable simple : on montre la miniature et la légende. */
export function ClipEmbed({ platform, externalId, url, thumbnailUrl, caption }: { platform: string; externalId: string; url: string; thumbnailUrl: string | null; caption: string | null }) {
  const src =
    platform === "YOUTUBE" ? `https://www.youtube.com/embed/${encodeURIComponent(externalId)}?rel=0`
    : platform === "TIKTOK" ? `https://www.tiktok.com/embed/v2/${encodeURIComponent(externalId)}`
    : platform === "INSTAGRAM" ? `https://www.instagram.com/reel/${encodeURIComponent(externalId)}/embed/`
    : null;
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-ink">
      <div className="relative aspect-[9/16] w-full">
        {src ? (
          <iframe
            src={src}
            title="Lecteur vidéo"
            className="absolute inset-0 h-full w-full"
            allow="encrypted-media; picture-in-picture; fullscreen"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
          />
        ) : (
          <div className="absolute inset-0"><Thumb src={thumbnailUrl} platform={platform} alt="Aperçu" /></div>
        )}
      </div>
      <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 border-t border-paper/10 px-3 py-2.5 text-sm text-paper/80 hover:text-paper">
        <PlatformIcon platform={platform} size={18} /> Ouvrir sur la plateforme ↗
      </a>
      {caption && <p className="line-clamp-4 border-t border-paper/10 px-3 py-2.5 text-xs text-paper/60">{caption}</p>}
    </div>
  );
}
