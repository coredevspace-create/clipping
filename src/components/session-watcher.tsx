"use client";

import { useEffect, useState } from "react";

const KEY = "clipsquad-session";

/**
 * Un navigateur = un compte connecté. Si l'utilisateur se connecte avec un autre compte (ou se déconnecte)
 * dans un autre onglet, les onglets ouverts ne correspondent plus au compte actif : on le signale et on propose de recharger.
 */
export function SessionWatcher({ userId }: { userId: string | null }) {
  const [stale, setStale] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, userId ?? "");
    } catch {}
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && (e.newValue ?? "") !== (userId ?? "")) setStale(true);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [userId]);

  if (!stale) return null;
  return (
    <div className="fixed inset-0 z-[200] grid place-items-center bg-ink/70 p-4 backdrop-blur-sm" role="alertdialog" aria-modal="true">
      <div className="max-w-md rounded-3xl bg-paper p-6 text-center shadow-2xl">
        <div className="font-display text-2xl font-extrabold">Tu as changé de compte</div>
        <p className="mt-2 text-sm text-zinc-600">
          Tu t&apos;es connecté (ou déconnecté) avec un autre compte dans un autre onglet. Un navigateur ne peut utiliser qu&apos;un compte à la fois :
          cette page n&apos;est plus à jour.
        </p>
        <p className="mt-2 text-xs text-zinc-500">Pour tester créateur et clippeur en même temps, utilise une fenêtre de navigation privée ou un autre navigateur.</p>
        <button onClick={() => location.reload()} className="btn mt-5">Recharger la page</button>
      </div>
    </div>
  );
}
