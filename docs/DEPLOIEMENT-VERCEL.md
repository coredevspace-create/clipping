# Mettre Clipsquad en ligne sur Vercel

Compte environ 15 minutes. Tout se fait depuis le navigateur.

## 1. Importer le projet

1. Crée un compte sur https://vercel.com avec **« Continue with GitHub »**.
2. Clique sur **Add New… → Project**, puis sur **Import** à côté du dépôt `coredevspace-create/clipping`.
   - Si le dépôt n'apparaît pas, clique sur « Adjust GitHub App Permissions » et autorise l'accès à ce dépôt.
3. **Ne clique pas encore sur Deploy.** Ouvre **Environment Variables** et ajoute ces variables :

| Nom | Valeur |
|---|---|
| `AUTH_SECRET` | Une longue chaîne aléatoire (32 caractères ou plus), par exemple générée sur https://generate-secret.vercel.app/32 |
| `CRON_SECRET` | Une autre chaîne aléatoire, différente de la première |
| `VIEWS_DEMO_MODE` | `true` pendant tes tests (vues TikTok et Instagram simulées), puis `false` au lancement réel |
| `YOUTUBE_API_KEY` | Ta clé YouTube (facultatif pour l'instant) |

4. Clique sur **Deploy**. **Ce premier déploiement va échouer**, car il n'y a pas encore de base de données. C'est normal.

## 2. Créer la base de données (gratuit)

> Si Vercel te propose **Prisma Postgres** pendant l'import, clique simplement sur **Add** : ça fonctionne aussi (région Frankfurt). Sinon, utilise Neon comme ci-dessous.

1. Dans ton projet Vercel, ouvre l'onglet **Storage → Create Database → Neon (Serverless Postgres) → Continue**.
2. Choisis la région **Frankfurt (eu-central-1)** (proche de la France, et utile pour le RGPD), puis l'offre gratuite.
3. Coche les environnements **Production, Preview et Development**, puis clique sur **Connect**.
   Vercel ajoute alors automatiquement `DATABASE_URL` et `DATABASE_URL_UNPOOLED` : tu n'as rien à copier.
4. Ouvre l'onglet **Deployments**, clique sur les **⋯** du dernier déploiement, puis sur **Redeploy**.
   Pendant le build, les tables sont créées automatiquement.

## 3. Adresse du site

Rien à faire : l'adresse Vercel est détectée automatiquement pour les liens d'invitation.
Si tu ajoutes ton propre nom de domaine, ajoute la variable `APP_URL` (ex. `https://clipsquad.fr`).

## 4. Relevé automatique des vues

- **Vercel** appelle déjà le relevé **une fois par jour**, grâce au fichier `vercel.json`. L'offre gratuite ne permet pas mieux.
- **Toutes les heures**, c'est le rôle d'un workflow GitHub Actions, gratuit et déjà présent dans le dépôt. Dans GitHub, va dans **Settings → Secrets and variables → Actions → New repository secret** et crée deux secrets :
  - `APP_URL` : l'adresse de ton site ;
  - `CRON_SECRET` : la même valeur que sur Vercel.
- Pour vérifier : onglet **Actions → Relevé des vues → Run workflow**. Le résultat doit afficher `"refreshed": …`.

## 5. Tester

1. Ouvre ton adresse Vercel et crée ton compte créateur, puis ton équipe.
2. Dans l'onglet **Clippeurs**, copie le lien d'invitation et ouvre-le dans une fenêtre de navigation privée (ou sur ton téléphone) pour créer un compte clippeur.
3. Envoie un lien de clip TikTok. En mode démo, ses vues sont simulées et environ 1 clip sur 5 simule des bots, ce qui te permet de voir l'anti-fraude réagir.

## Ensuite

- **Nom de domaine :** dans **Settings → Domains**, ajoute par exemple `clipsquad.fr`, puis mets à jour `APP_URL`.
- **Lancement réel :** passe `VIEWS_DEMO_MODE=false`.
- **Chaque `git push` sur la branche de production** redéploie le site automatiquement. La branche de production se règle dans **Settings → Git**.
