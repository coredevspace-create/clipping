import Link from "next/link";
import { LegalPage } from "@/components/legal";
import { APP_NAME, LEGAL } from "@/lib/config";

export const metadata = { title: "Suppression des données" };

export default async function Page({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;
  return (
    <LegalPage title="Suppression de tes données">
      {code && (
        <p className="rounded-2xl bg-[#e3f5e8] p-4 font-medium text-ink">
          Ta demande a bien été traitée : les données issues d&apos;Instagram ont été supprimées. Code de confirmation : <code>{code}</code>
        </p>
      )}
      <h2>Données d&apos;une plateforme (TikTok, Instagram, YouTube)</h2>
      <ul>
        <li>Connecte-toi, ouvre <Link href="/app/comptes">Comptes connectés</Link> et clique sur « Déconnecter » : les jetons d&apos;accès et les données d&apos;audience issues de cette plateforme sont supprimés immédiatement.</li>
        <li>Tu peux aussi retirer l&apos;accès depuis la plateforme elle-même (paramètres de sécurité de TikTok, « Apps et sites web » d&apos;Instagram, autorisations de ton compte Google) : {APP_NAME} supprime alors les données correspondantes.</li>
      </ul>
      <h2>Suppression complète du compte</h2>
      <p>
        Écris à {LEGAL.email} depuis l&apos;adresse de ton compte en indiquant « Suppression de compte ». Tes données sont supprimées sous 30 jours, à l&apos;exception de
        l&apos;historique des paiements, conservé 10 ans pour respecter nos obligations comptables.
      </p>
    </LegalPage>
  );
}
