"use client";

import { useState } from "react";

/** Code personnel à copier dans la description des vidéos. */
export function VerifyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-ink p-4 text-paper sm:p-5">
      <div className="min-w-0 flex-1">
        <div className="eyebrow text-lime">Ton code de vérification</div>
        <p className="mt-1 text-sm text-paper/75">
          Mets-le dans la description de chaque vidéo (TikTok, YouTube, X) avant d&apos;envoyer le lien : c&apos;est la preuve que la vidéo est à toi.
          Tu peux aussi <a href="/app/comptes" className="font-semibold text-lime underline">connecter tes comptes</a>.
        </p>
      </div>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(`#${code}`).catch(() => {});
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="flex items-center gap-3 rounded-xl bg-lime px-4 py-2.5 font-mono text-lg font-bold text-ink transition hover:bg-lime-2"
      >
        #{code}
        <span className="font-sans text-xs font-semibold">{copied ? "Copié ✓" : "Copier"}</span>
      </button>
    </div>
  );
}
