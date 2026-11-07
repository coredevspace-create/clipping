import Link from "next/link";
import { LegalPage } from "@/components/legal";
import { APP_NAME, LEGAL } from "@/lib/config";

export const metadata = { title: "Politique de confidentialité" };

export default function Page() {
  return (
    <LegalPage title="Politique de confidentialité">
      <p>
        Cette politique explique quelles données {APP_NAME} collecte, pourquoi, combien de temps elles sont conservées et comment exercer tes droits,
        conformément au Règlement général sur la protection des données (RGPD). Responsable du traitement : {LEGAL.company}, {LEGAL.address} — {LEGAL.email}.
      </p>

      <h2>1. Données collectées</h2>
      <table>
        <tbody>
          <tr><th>Compte</th><td>Nom ou pseudo, adresse email, mot de passe (stocké uniquement sous forme chiffrée irréversible), rôle (créateur ou clippeur).</td></tr>
          <tr><th>Annonces</th><td>Contenu des annonces des créateurs et des profils de clippeurs (présentation, niches, liens de portfolio, contact facultatif).</td></tr>
          <tr><th>Clips</th><td>Liens des vidéos soumises, statistiques publiques ou fournies par les plateformes (vues, likes, commentaires, partages, date de publication) et leur historique.</td></tr>
          <tr><th>Comptes connectés</th><td>Si tu connectes TikTok, Instagram ou YouTube : identifiant et nom du compte, jetons d&apos;accès (chiffrés), statistiques de tes vidéos et, pour YouTube, la répartition des vues par pays.</td></tr>
          <tr><th>Paiements</th><td>IBAN ou adresse PayPal renseignés par le clippeur, montants calculés et historique des paiements.</td></tr>
          <tr><th>Discussion</th><td>Messages échangés dans les salons d&apos;équipe.</td></tr>
          <tr><th>Liens traqués</th><td>Nombre de clics sur les liens des clippeurs ; le visiteur est représenté par une empreinte anonymisée et renouvelée chaque jour (aucune adresse IP n&apos;est conservée).</td></tr>
        </tbody>
      </table>

      <h2>2. Données issues des plateformes</h2>
      <p>Lorsque tu connectes un compte, {APP_NAME} accède en <strong>lecture seule</strong> aux données suivantes, uniquement pour suivre les vues de tes clips et détecter la fraude :</p>
      <ul>
        <li><strong>TikTok</strong> (Login Kit, Display API — autorisations <code>user.info.basic</code>, <code>video.list</code>) : identifiant et nom d&apos;affichage, liste et statistiques de tes vidéos publiques.</li>
        <li><strong>Instagram</strong> (API Instagram — <code>instagram_business_basic</code>, <code>instagram_business_manage_insights</code>) : nom d&apos;utilisateur, publications et leurs statistiques (vues, likes, commentaires, partages).</li>
        <li><strong>YouTube</strong> (API YouTube Data et YouTube Analytics — <code>youtube.readonly</code>, <code>yt-analytics.readonly</code>) : identité de la chaîne, statistiques des vidéos et répartition des vues par pays.</li>
      </ul>
      <p>
        {APP_NAME} ne publie jamais rien à ta place, ne lit pas tes messages privés et ne vend aucune donnée. Les statistiques d&apos;un clip sont visibles par toi
        et par le créateur de l&apos;équipe à laquelle tu l&apos;as soumis. L&apos;utilisation des données YouTube respecte les{" "}
        <a href="https://www.youtube.com/t/terms" target="_blank" rel="noreferrer">Conditions d&apos;utilisation de YouTube</a> et la{" "}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Règle de confidentialité de Google</a> ; tu peux aussi retirer l&apos;accès depuis{" "}
        <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">les paramètres de sécurité de ton compte Google</a>.
      </p>

      <h2>3. Finalités et bases légales</h2>
      <ul>
        <li>Fournir le service (gestion des équipes, suivi des clips, calcul des paiements, discussion) — <em>exécution du contrat</em>.</li>
        <li>Détecter les vues frauduleuses et les clips réclamés à tort — <em>intérêt légitime</em> des créateurs à ne payer que des vues réelles.</li>
        <li>Mettre en relation créateurs et clippeurs via les annonces — <em>exécution du contrat</em>.</li>
        <li>Respecter nos obligations légales (comptabilité, réquisitions) — <em>obligation légale</em>.</li>
      </ul>

      <h2>4. Destinataires et sous-traitants</h2>
      <p>
        Les données sont hébergées par Vercel (application) et Prisma Data (base de données, région de Francfort). Les plateformes (TikTok, Meta, Google) reçoivent les requêtes
        nécessaires à la lecture des statistiques. Certains sous-traitants peuvent traiter des données hors de l&apos;Union européenne ; ces transferts sont encadrés par les
        clauses contractuelles types de la Commission européenne.
      </p>

      <h2>5. Durées de conservation</h2>
      <ul>
        <li>Compte et contenus : tant que le compte est actif, puis suppression sous 30 jours après une demande de suppression.</li>
        <li>Jetons d&apos;accès aux plateformes : supprimés immédiatement à la déconnexion du compte.</li>
        <li>Historique des paiements : conservé 10 ans (obligation comptable).</li>
      </ul>

      <h2>6. Sécurité</h2>
      <p>Connexions chiffrées (HTTPS), mots de passe hachés, jetons d&apos;accès chiffrés (AES-256), accès aux données limité aux membres de chaque équipe.</p>

      <h2>7. Cookies</h2>
      <p>{APP_NAME} n&apos;utilise qu&apos;un cookie de session, strictement nécessaire à la connexion, et un cookie technique temporaire lors de la connexion d&apos;un compte de plateforme. Aucun cookie publicitaire ni de mesure d&apos;audience.</p>

      <h2>8. Tes droits</h2>
      <p>
        Tu peux accéder à tes données, les rectifier, les supprimer, t&apos;opposer à leur traitement ou demander leur portabilité en écrivant à {LEGAL.email}.
        Pour supprimer uniquement les données issues d&apos;une plateforme, déconnecte le compte dans « Comptes connectés » (voir aussi{" "}
        <Link href="/suppression-donnees">la page de suppression des données</Link>). Tu peux introduire une réclamation auprès de la CNIL (cnil.fr).
      </p>
    </LegalPage>
  );
}
