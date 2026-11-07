"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Barre de progression en haut de l'écran pendant les changements de page
 * (clic sur un lien ou envoi d'un formulaire), pour que l'utilisateur sache que ça charge.
 */
export function NavProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [progress, setProgress] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const safety = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    if (safety.current) clearTimeout(safety.current);
    timer.current = null;
    setProgress((p) => (p === null ? null : 100));
    setTimeout(() => setProgress(null), 250);
  };

  const start = () => {
    if (timer.current) return;
    setProgress(8);
    timer.current = setInterval(() => setProgress((p) => (p === null ? null : p + (90 - p) * 0.08)), 120);
    safety.current = setTimeout(stop, 15000); // ne jamais rester bloqué
  };

  // fin de navigation : l'URL a changé
  useEffect(() => {
    stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname.startsWith("/api/")) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      start();
    };
    const onSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement;
      if (form.dataset.noProgress !== undefined) return;
      start();
      // une action sans changement d'URL : on termine quand le bouton n'est plus en attente
      const check = setInterval(() => {
        if (!form.isConnected || !form.querySelector("[aria-busy=true]")) {
          clearInterval(check);
          setTimeout(() => timer.current && stop(), 150);
        }
      }, 200);
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, []);

  if (progress === null) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px]" role="progressbar" aria-label="Chargement">
      <div className="h-full bg-lime shadow-[0_0_12px_var(--color-lime)] transition-[width] duration-200 ease-out" style={{ width: `${progress}%` }} />
    </div>
  );
}
