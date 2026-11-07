# Brancher TikTok, Instagram et YouTube

> Dernière vérification : novembre 2026. Les plateformes changent souvent leurs formulaires : en cas de doute, la doc officielle fait foi.

Le code est **prêt** : dès que tu colles les clés dans Vercel, le bouton « Connecter » apparaît chez les clippeurs (page **Comptes connectés**), les vues sont lues directement chez la plateforme et l'anti-fraude vérifie que chaque vidéo appartient bien au clippeur.

Dans tout ce guide, remplace `https://TON-DOMAINE` par l'adresse de ton site (ex. `https://clipsquad.fr` ou `https://clipping-xxx.vercel.app`).

---

## Étape 0 — Prérequis (communs aux 3 plateformes)

1. **Un nom de domaine à toi** (ex. `clipsquad.fr`, ~10 €/an chez OVH, Gandi ou Namecheap), branché sur Vercel : *Settings → Domains*.
   TikTok demande de **vérifier la propriété du domaine**, ce qui est impossible avec une adresse `vercel.app`.
2. **Compléter les informations légales** dans Vercel (*Settings → Environment Variables*) puis *Redeploy* :
   `LEGAL_COMPANY`, `LEGAL_FORM`, `LEGAL_ADDRESS`, `LEGAL_SIREN`, `LEGAL_DIRECTOR`, `LEGAL_EMAIL`.
   Elles s'affichent dans ces pages, **déjà en ligne** et exigées par les plateformes :
   - Politique de confidentialité : `https://TON-DOMAINE/confidentialite`
   - Conditions d'utilisation : `https://TON-DOMAINE/cgu`
   - Mentions légales : `https://TON-DOMAINE/mentions-legales`
   - Suppression des données : `https://TON-DOMAINE/suppression-donnees`
3. **Une vidéo de démo** (2-3 min, voir le script en bas de page).
4. Une **icône** carrée 1024×1024 (le logo) et un email de contact sur ton domaine.

**Bonne nouvelle :** sur les 3 plateformes, tu peux **tester tout de suite** avec quelques comptes ajoutés à la main (mode test / sandbox), avant même la validation.

---

## 1. YouTube (Google) — le plus rapide

### a) Clé API (stats publiques) — 10 minutes
1. https://console.cloud.google.com → crée un projet « Clipsquad ».
2. *API et services → Bibliothèque* → active **YouTube Data API v3** et **YouTube Analytics API**.
3. *Identifiants → Créer des identifiants → Clé API* → restreins-la à « YouTube Data API v3 ».
4. Vercel : `YOUTUBE_API_KEY` = la clé.

### b) Connexion des chaînes (propriété + pays des spectateurs)
1. *API et services → Écran de consentement OAuth* : type **Externe**, nom « Clipsquad », logo, email, domaine autorisé `TON-DOMAINE`, liens vers `/confidentialite` et `/cgu`.
2. *Scopes* : ajoute `.../auth/youtube.readonly` et `.../auth/yt-analytics.readonly`.
3. *Utilisateurs test* : ajoute les emails Google de tes premiers clippeurs (jusqu'à 100) → ils peuvent connecter leur chaîne **dès maintenant** (avec un avertissement « application non validée »).
4. *Identifiants → Créer → ID client OAuth → Application Web* :
   - Origine JavaScript autorisée : `https://TON-DOMAINE`
   - URI de redirection autorisée : `https://TON-DOMAINE/api/oauth/youtube/callback`
5. Vercel : `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET`.
6. Quand tout fonctionne : *Écran de consentement → Publier l'application* puis **demander la validation** (scopes sensibles) avec la vidéo de démo. Compte **2 à 6 semaines**.

Quota : 10 000 unités/jour gratuites (1 unité par lecture de vidéo). Au-delà de quelques milliers de clips suivis, demande une extension via le formulaire « YouTube API Services – Audit and Quota Extension ».

---

## 2. TikTok — Login Kit + Display API

1. https://developers.tiktok.com → connecte-toi → crée une **organisation** (ta société).
2. *Manage apps → Connect an app* → type **Web**.
3. Renseigne : icône, nom « Clipsquad », catégorie (*Business / Productivity*), description (texte ci-dessous), **Terms of Service URL** `https://TON-DOMAINE/cgu`, **Privacy Policy URL** `https://TON-DOMAINE/confidentialite`, **Web/Desktop URL** `https://TON-DOMAINE`.
4. **Vérifie ton domaine** (*URL properties → Verify*) : TikTok te donne un enregistrement **TXT** à ajouter chez ton registrar (OVH/Gandi…), ou un fichier à déposer.
5. *Add products* : **Login Kit** et **Display API**.
6. Login Kit → *Redirect URI* : `https://TON-DOMAINE/api/oauth/tiktok/callback`
7. *Scopes* : coche **uniquement** `user.info.basic` et `video.list` (chaque scope en trop augmente le risque de refus).
8. Copie **Client key** et **Client secret** → Vercel : `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`.
9. **Tester avant validation** : onglet *Sandbox* → crée un sandbox → ajoute les comptes TikTok de tes clippeurs test (*Target users*).
10. *Submit for review* avec la vidéo de démo et les textes ci-dessous. Compte **1 à 4 semaines**.

---

## 3. Instagram — API Instagram avec Instagram Login

Fonctionne avec les comptes **professionnels** (Créateur ou Entreprise — gratuit à activer dans l'app Instagram : *Paramètres → Type de compte*). Les clippeurs doivent le savoir : prévois-le dans tes consignes.

1. https://developers.facebook.com → *My Apps → Create App* → cas d'usage **« Manage messaging & content on Instagram »** (ou type *Business*).
2. Produit **Instagram → API setup with Instagram login**.
3. *Set up Instagram business login* :
   - **OAuth redirect URI** : `https://TON-DOMAINE/api/oauth/instagram/callback`
   - **Deauthorize callback URL** : `https://TON-DOMAINE/api/meta/deauthorize`
   - **Data deletion request URL** : `https://TON-DOMAINE/api/meta/data-deletion`
4. Permissions : `instagram_business_basic` et `instagram_business_manage_insights`.
5. Copie **Instagram app ID** et **Instagram app secret** (attention : ceux de la section Instagram, pas ceux de l'app Facebook) → Vercel : `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`.
6. *App settings → Basic* : URL de confidentialité, CGU, icône, catégorie, email.
7. **Tester avant validation** : *App roles → Roles → Instagram testers* → ajoute les comptes Instagram de tes clippeurs test ; chacun accepte l'invitation dans Instagram (*Paramètres → Apps et sites web → Invitations de testeur*).
8. **Business verification** (*Business Settings → Security Center*) : Kbis ou avis de situation INSEE + justificatif du domaine.
9. *App Review* → demande l'**Advanced Access** pour les deux permissions, avec un screencast par permission. Compte **2 à 6 semaines**.
10. Passe l'app en mode **Live**.

---

## 4. X (Twitter)

API payante à l'usage (environ 0,005 $ par post lu). Le format clip y est minoritaire : **saisie manuelle** au lancement, branchement plus tard si tes clients le demandent.

---

## Textes à copier dans les formulaires (en anglais, les équipes de validation lisent l'anglais)

**Description de l'app**
> Clipsquad helps founders and creators manage the teams of "clippers" who repurpose their long-form videos into short clips. Clippers submit links to the clips they published; Clipsquad tracks the clips' views, detects artificially inflated views, and computes how much each clipper should be paid. Clippers connect their own account in read-only mode so their clip statistics are verified directly from the platform.

**TikTok — `video.list`**
> Used to read the view, like, comment and share counts of the videos that the logged-in user submits to Clipsquad. The creator who pays the clipper per view relies on these verified numbers, and we check that the submitted video belongs to the connected account (preventing people from claiming someone else's video). We never post or modify content.

**TikTok — `user.info.basic`**
> Used to display the connected account's name in the user's settings so they can confirm which TikTok account is linked, and to associate the account with the right Clipsquad user.

**Instagram — `instagram_business_basic`**
> Used to identify the connected professional account (username) and list its media so we can match the Reels the user submitted to Clipsquad and confirm they belong to them.

**Instagram — `instagram_business_manage_insights`**
> Used to read the views, likes, comments and shares of the Reels the user submitted, so the creator who pays them per view sees verified numbers and our fraud detection can flag artificially inflated views. Read-only; displayed only to the user and to the creator of the team they submitted the clip to.

**Google — `youtube.readonly` / `yt-analytics.readonly`**
> youtube.readonly identifies the user's channel to confirm that the Shorts they submit are their own. yt-analytics.readonly reads the per-country view breakdown of those Shorts only, to detect bot traffic (for example French content viewed mostly from unrelated countries). Read-only, never shared outside the team the clip was submitted to.

---

## Script de la vidéo de démo (2-3 min, à enregistrer avec OBS ou Loom)

1. Ouvre `https://TON-DOMAINE`, montre la page d'accueil et le lien « Confidentialité » en bas.
2. Connecte-toi avec un **compte clippeur** test → *Mon espace → Comptes connectés*.
3. Clique **Connecter TikTok** (ou Instagram / YouTube) → montre l'**écran d'autorisation** de la plateforme avec les permissions → accepte.
4. Retour sur Clipsquad : le compte apparaît « ✓ Connecté ».
5. Dans une équipe, **envoie le lien** d'une vidéo de ce compte → montre les vues qui s'affichent.
6. Connecte-toi en **créateur** → ouvre le clip : vues, « ✓ vidéo sur le compte connecté du clippeur », score anti-fraude.
7. Reviens côté clippeur → **Déconnecter** le compte → montre qu'il disparaît (suppression des jetons).

Sous-titre ou commente en anglais chaque étape.

---

## Ce qui se passe dans l'app une fois les clés ajoutées

| Situation | Résultat |
|---|---|
| Clippeur connecté, vidéo à lui | Vues lues chez la plateforme, badge **✓ compte vérifié** |
| Clippeur connecté, vidéo d'un autre compte | Clip mis en **quarantaine** (« pas son compte », +60 au score) |
| YouTube connecté | En plus : part d'**audience francophone** ; si < 40 %, alerte anti-fraude |
| Clippeur non connecté | YouTube : stats publiques via la clé API ; TikTok/Instagram : saisie manuelle par le créateur |
| Option « Exiger un compte vérifié » (Réglages de l'équipe) | Impossible d'envoyer un clip TikTok/Instagram/YouTube sans compte connecté |

Les jetons sont **chiffrés** (AES-256) et rafraîchis automatiquement (Instagram : jeton de 60 jours renouvelé avant expiration).
⚠️ Ne change plus `AUTH_SECRET` (ou `TOKEN_ENCRYPTION_KEY` si tu l'utilises) une fois des comptes connectés : les jetons existants deviendraient illisibles et les clippeurs devraient se reconnecter.

### Sources
- TikTok Display API : https://developers.tiktok.com/doc/display-api-get-started/
- TikTok App Review Guidelines : https://developers.tiktok.com/docs/en/app-review-guidelines
- Insights Instagram avec Instagram Login : https://developers.facebook.com/blog/post/2025/03/24/user-and-media-insights-on-instagram-api-with-instagram-login/
- Instagram Media Insights : https://developers.facebook.com/docs/instagram-platform/reference/instagram-media/insights/
