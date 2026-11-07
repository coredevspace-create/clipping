import { disconnectAccount } from "@/app/actions/accounts";
import { Flash, PageTitle } from "@/components/ui";
import { Submit } from "@/components/submit";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { dateFr } from "@/lib/format";
import { OAUTH_PLATFORMS, PROVIDERS } from "@/lib/oauth/providers";
import { ensureVerifyCode } from "@/lib/verify";
import { VerifyCode } from "@/components/verify-code";

export const metadata = { title: "Comptes connectés" };

const WHY: Record<string, string> = {
  TIKTOK: "Vues, likes, commentaires et partages lus directement chez TikTok, et preuve que les vidéos sont bien les tiennes.",
  INSTAGRAM: "Vues et engagement de tes Reels lus via ton compte professionnel (Créateur ou Entreprise).",
  YOUTUBE: "Vues de tes Shorts, preuve de propriété et pays de tes spectateurs (anti-fraude).",
};

export default async function Page({ searchParams }: { searchParams: Promise<{ erreur?: string; ok?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const [accounts, code] = await Promise.all([db.connectedAccount.findMany({ where: { userId: user.id } }), ensureVerifyCode(user.id)]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle
        title="Comptes connectés"
        subtitle="Connecte tes comptes pour que tes vues soient vérifiées automatiquement. Les créateurs privilégient les clippeurs vérifiés."
      />
      <Flash sp={sp} />
      <div className="mb-6"><VerifyCode code={code} /></div>
      <div className="space-y-4">
        {OAUTH_PLATFORMS.map((p) => {
          const provider = PROVIDERS[p];
          const acc = accounts.find((a) => a.platform === p);
          const available = provider.configured();
          return (
            <div key={p} className="card flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-display text-xl font-bold">{provider.label}</span>
                  {acc && <span className="rounded-full bg-lime px-2 py-0.5 font-mono text-[11px] font-semibold">✓ CONNECTÉ</span>}
                </div>
                {acc ? (
                  <p className="mt-1 text-sm text-zinc-600">
                    <strong>{acc.username}</strong> · depuis le {dateFr(acc.createdAt)}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-zinc-600">{WHY[p]}</p>
                )}
              </div>
              {acc ? (
                <form action={disconnectAccount.bind(null, p)}>
                  <Submit className="btn-danger">Déconnecter</Submit>
                </form>
              ) : available ? (
                <a href={`/api/oauth/${p.toLowerCase()}/start?back=/app/comptes`} className="btn">
                  Connecter {provider.label}
                </a>
              ) : (
                <span className="rounded-full bg-paper-2 px-3 py-1.5 text-sm text-zinc-500">Bientôt disponible</span>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-sm text-zinc-500">
        Accès en lecture seule : on ne publie jamais rien à ta place. Tes jetons d&apos;accès sont chiffrés, et tu peux déconnecter un compte à tout moment.
        X (Twitter) n&apos;est pas connectable : le créateur saisit les statistiques.
      </p>
    </div>
  );
}
