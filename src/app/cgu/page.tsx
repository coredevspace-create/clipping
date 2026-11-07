import { LegalPage } from "@/components/legal";
import { APP_NAME, LEGAL, PLANS } from "@/lib/config";

export const metadata = { title: "Conditions générales d'utilisation" };

export default function Page() {
  return (
    <LegalPage title="Conditions générales d'utilisation">
      <p>Les présentes conditions encadrent l&apos;utilisation de {APP_NAME}, édité par {LEGAL.company}. Créer un compte vaut acceptation de ces conditions.</p>
      <h2>1. Le service</h2>
      <p>
        {APP_NAME} permet aux créateurs de gérer des équipes de clippeurs : publication d&apos;annonces, réception des clips, suivi des vues, détection des vues suspectes,
        calcul des rémunérations et discussion d&apos;équipe. {APP_NAME} n&apos;est pas partie à la relation entre un créateur et ses clippeurs.
      </p>
      <h2>2. Comptes</h2>
      <p>Tu dois fournir des informations exactes et garder ton mot de passe confidentiel. Un compte de plateforme (TikTok, Instagram, YouTube) ne peut être connecté que par son titulaire.</p>
      <h2>3. Abonnements</h2>
      <p>
        Les créateurs souscrivent un abonnement mensuel ({Object.values(PLANS).map((p) => `${p.label} ${p.priceEur} €`).join(", ")} par mois, TTC) sans engagement.
        {APP_NAME} ne prélève aucune commission sur les sommes versées aux clippeurs. L&apos;inscription des clippeurs est gratuite.
      </p>
      <h2>4. Rémunération des clippeurs</h2>
      <p>
        Les montants affichés sont calculés selon les règles fixées par chaque créateur (rémunération pour 1 000 vues, seuil, plafond, délai de vérification). Le paiement est
        effectué directement par le créateur ; {APP_NAME} ne détient pas de fonds. Les clippeurs sont responsables de leurs obligations fiscales et sociales.
      </p>
      <h2>5. Fraude et contenus interdits</h2>
      <ul>
        <li>Il est interdit d&apos;acheter ou de générer artificiellement des vues, likes ou commentaires, et de soumettre une vidéo dont on n&apos;est pas l&apos;auteur.</li>
        <li>Un clip signalé par l&apos;anti-fraude peut être refusé par le créateur et n&apos;ouvre droit à aucune rémunération.</li>
        <li>Les contenus illicites, haineux ou portant atteinte aux droits d&apos;autrui sont interdits, y compris dans la discussion d&apos;équipe.</li>
      </ul>
      <p>Tout manquement peut entraîner la suspension du compte.</p>
      <h2>6. Plateformes tierces</h2>
      <p>L&apos;utilisation de TikTok, Instagram, YouTube et X reste soumise à leurs propres conditions. L&apos;utilisation des services API YouTube implique l&apos;acceptation des <a href="https://www.youtube.com/t/terms" target="_blank" rel="noreferrer">Conditions d&apos;utilisation de YouTube</a>.</p>
      <h2>7. Responsabilité</h2>
      <p>Les statistiques dépendent des plateformes et peuvent comporter des délais ou des écarts. La détection de fraude est une aide à la décision : la décision finale appartient au créateur.</p>
      <h2>8. Résiliation et droit applicable</h2>
      <p>Tu peux supprimer ton compte à tout moment en écrivant à {LEGAL.email}. Les présentes conditions sont soumises au droit français.</p>
    </LegalPage>
  );
}
