import { LEGAL } from "@/lib/config";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl">
      <div className="eyebrow text-zinc-500">Dernière mise à jour : {LEGAL.updatedAt}</div>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-[-0.03em] sm:text-5xl">{title}</h1>
      <div className="legal mt-10 space-y-4 text-[15px] leading-relaxed text-zinc-700">{children}</div>
    </article>
  );
}
