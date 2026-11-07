"use client";

import { useState } from "react";

/** Code personnel à copier dans la description des vidéos. */
export function VerifyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-[20px] bg-ink p-5 text-white sm:p-6">
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium text-zinc-400">Ton code de vérification</div>
        <p className="mt-1 text-sm text-zinc-300">
          Mets-le dans la description de chaque vidéo (TikTok, YouTube, X) avant d&apos;envoyer le lien : c&apos;est la preuve que la vidéo est à toi.
          Tu peux aussi <a href="/app/comptes" className="font-medium text-[#2997ff] hover:underline">connecter tes comptes</a>.
        </p>
      </div>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(`#${code}`).catch(() => {});
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="flex items-center gap-3 rounded-full bg-white px-5 py-2.5 font-mono text-lg font-bold text-ink transition hover:bg-zinc-100"
      >
        #{code}
        <span className="font-sans text-xs font-semibold">{copied ? "Copié ✓" : "Copier"}</span>
      </button>
    </div>
  );
}
