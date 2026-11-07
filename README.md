# Clipsquad (nom provisoire)

**Le clipping pour les apps, SaaS et logiciels grand public.**
Les fondateurs recrutent et gèrent leur équipe de clippeurs, vérifient chaque vue, bloquent les bots
et mesurent le **coût par téléchargement (ou par inscription) de chaque clippeur**.
Interface en français. Modèle économique : abonnement (49 / 99 / 199 €), sans commission.

Spécificités « apps » :
- **Lien intelligent par clippeur** : iPhone → App Store (campagne `clipsquad-<code>` visible dans App Store Connect),
  Android → Play Store (`utm_content=<code>` dans la Play Console), ordinateur → site. Clics comptés par appareil.
- **Conversions** : URL de conversion pour les SaaS web (`/api/conversion?key=…&ref=<code>&type=signup|purchase|install&id=…`)
  et saisie manuelle des téléchargements pour les apps → coût par conversion de chaque clippeur.
- **Consignes prêtes à l'emploi** (démo express, faceless, réaction, storytime).
- **Preuve de propriété** : code personnel dans la description des vidéos ou compte connecté.

## Ce que fait le MVP

**Côté créateur**
- Créer une équipe (= un produit), inviter des clippeurs avec un lien (limite selon l'offre).
- Liste des clips avec vues, taux d'engagement, score de fraude et statut ; validation ou refus en un clic.
- Fiche clip : courbe des vues, raisons détaillées du score anti-fraude, saisie manuelle des stats.
- **Moments à clipper** : déposer une vidéo longue (live, podcast, démo) et découper les passages ; chaque clippeur réserve le sien (3 réservations max non publiées), zéro doublon.
- **Liens traqués** : chaque clippeur a un lien `/r/<code>` vers le produit (UTM inclus). Les clics uniques sont comptés par clippeur.
- **Paiements** : CPM, seuil minimum, plafond par clip, délai de vérification. Génération d'un lot de paiement (paiement uniquement de la différence depuis le dernier lot), export CSV (IBAN / PayPal), marquage « payé ».

**Côté clippeur**
- Rejoindre via l'invitation, soumettre ses liens (TikTok, Shorts, Reels, X), réserver des moments.
- Voir ses vues, ses gains estimés et ce qu'il a déjà reçu ; renseigner son IBAN ou son PayPal.

**Anti-fraude** (`src/lib/fraud.ts`) : score de 0 à 100 avec des raisons lisibles.
- Engagement anormalement bas.
- Pic brutal par rapport au rythme du clip.
- Vues qui montent sans likes.
- Clip hors norme pour ce clippeur.
- Vidéo publiée bien avant la soumission.
- Audience hors des pays ciblés (quand l'OAuth est branché).

Au-dessus du seuil, le clip est mis en quarantaine et n'est jamais payé sans validation humaine. Les doublons sont bloqués à la soumission.

**Suivi des vues** : relevé toutes les heures pendant les 72 premières heures, puis toutes les 12 h jusqu'à 30 jours (`/api/cron/refresh-views`).
- YouTube : branché, il suffit d'une clé API.
- TikTok, Instagram et X : voir [docs/ACCES-API-PLATEFORMES.md](docs/ACCES-API-PLATEFORMES.md). En attendant : saisie manuelle, ou mode démo en local.

## Lancer en local

Il te faut Node.js 20 ou plus et une base PostgreSQL. Le plus simple : Docker, avec `docker compose up -d`.

```bash
npm install
```

```bash
cp .env.example .env
```

```bash
docker compose up -d
```

```bash
npx prisma migrate deploy
```

```bash
npm run db:seed
```

```bash
npm run dev
```

Puis ouvre http://localhost:3000.

**Comptes de démo** (mot de passe `demo1234` pour tous) :
- Créateur : `demo@clipsquad.fr`
- Clippeurs : `lea@clipsquad.fr`, `sami@clipsquad.fr`, `noah@clipsquad.fr`

Le lien d'invitation de démo est http://localhost:3000/rejoindre/demo-invite. La démo contient 2 clips « bottés » pour voir l'anti-fraude en action.

## Tests

```bash
npm test
```

```bash
npm run lint
```

## Mise en production

Voir le guide pas à pas : [docs/DEPLOIEMENT-VERCEL.md](docs/DEPLOIEMENT-VERCEL.md) (Vercel + Neon PostgreSQL, relevé horaire des vues via GitHub Actions).

## Structure

```
prisma/schema.prisma      modèle de données
src/lib/fraud.ts          moteur anti-fraude (fonction pure, testée)
src/lib/payouts.ts        calcul des paiements (fonction pure, testée)
src/lib/platforms.ts      reconnaissance des liens de clips
src/lib/views/            fournisseurs de statistiques par plateforme
src/lib/tracking.ts       relevés de vues + réévaluation de la fraude
src/app/actions/          actions serveur (créateur, clippeur, auth)
src/app/app/e/[id]/       espace créateur
src/app/app/c/[id]/       espace clippeur
```

## Prochaines étapes

1. **OAuth TikTok / Instagram / YouTube Analytics** dès que les accès sont validés : preuve de propriété et audience géographique.
2. **Stripe Billing** pour les abonnements (l'offre est déjà stockée et la limite de clippeurs appliquée).
3. **Regroupement des appels YouTube** (50 vidéos par requête) pour tenir le quota à grande échelle.
4. **Paiement des clippeurs via Stripe Connect** (V2) : vérifie d'abord avec un comptable les obligations DAC7 et le statut des clippeurs.
5. **Transcription automatique des sources** et suggestion des meilleurs moments par IA.
6. **Réinitialisation du mot de passe** et emails transactionnels (nouveau clip, clip suspect, paiement effectué).
