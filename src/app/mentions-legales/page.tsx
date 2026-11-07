import { LegalPage } from "@/components/legal";
import { APP_NAME, LEGAL } from "@/lib/config";

export const metadata = { title: "Mentions légales" };

export default function Page() {
  return (
    <LegalPage title="Mentions légales">
      <h2>Éditeur</h2>
      <p>
        {APP_NAME} est édité par <strong>{LEGAL.company}</strong>, {LEGAL.form}, immatriculée sous le numéro {LEGAL.siren}, dont le siège est situé {LEGAL.address}.
      </p>
      <p>Directeur de la publication : {LEGAL.director}. Contact : {LEGAL.email}.</p>
      <h2>Hébergement</h2>
      <p>Application : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis (vercel.com).</p>
      <p>Base de données : Prisma Data, Inc. (Prisma Postgres), hébergée dans la région de Francfort (Allemagne).</p>
      <h2>Propriété intellectuelle</h2>
      <p>
        Les éléments du site (textes, interface, logo) sont protégés. Les vidéos et contenus publiés par les utilisateurs restent leur propriété ;
        les marques TikTok, Instagram, YouTube et X appartiennent à leurs propriétaires respectifs, sans affiliation avec {APP_NAME}.
      </p>
    </LegalPage>
  );
}
