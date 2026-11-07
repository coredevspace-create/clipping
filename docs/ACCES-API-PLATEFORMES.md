# Obtenir l'accès aux API des plateformes

> Dernière vérification : novembre 2026. Les conditions des plateformes changent souvent : relis toujours la doc officielle au moment de déposer ta demande.

## Ce qu'il faut préparer AVANT toute demande (toutes plateformes)

Les plateformes refusent les dossiers incomplets. Prépare d'abord :

1. **Un nom de domaine** et l'app déployée dessus en HTTPS (ex. `clipsquad.fr`).
2. **Une page Politique de confidentialité** (RGPD : quelles données, pourquoi, combien de temps, comment les supprimer).
3. **Des CGU** et des **mentions légales**.
4. **Une société** (SIREN) : Meta exige une vérification d'entreprise, et c'est plus simple partout ailleurs.
5. **Une vidéo de démo** (screencast de 2-3 min) qui montre : le clippeur clique sur « Connecter mon compte », l'écran d'autorisation de la plateforme, puis où et comment ses statistiques sont affichées au créateur.
6. **Une adresse email de contact** sur ton domaine (pas Gmail).

## Ordre recommandé et délais

| # | Plateforme | Difficulté | Délai typique | Statut dans le MVP |
|---|---|---|---|---|
| 1 | YouTube (clé API) | Facile | 10 minutes | ✅ Branché (`YOUTUBE_API_KEY`) |
| 2 | TikTok (Login Kit + Display API) | Moyen | 1 à 4 semaines | 🔜 À brancher après validation |
| 3 | Instagram (API Instagram avec Instagram Login) | Difficile | 2 à 6 semaines | 🔜 À brancher après validation |
| 4 | YouTube Analytics (OAuth) | Moyen | 2 à 6 semaines | 🔜 Pour l'anti-fraude géographique |
| 5 | X | Facile mais payant | Immédiat | ⏸ Saisie manuelle au lancement |

**Lance les demandes 2, 3 et 4 en parallèle dès que le site est en ligne** : ce sont les délais de validation qui te bloqueront, pas le code.

---

## 1. YouTube Data API v3 — à faire tout de suite

Donne les vues, likes et commentaires publics de n'importe quelle vidéo, sans que le clippeur ait à se connecter.

1. Va sur https://console.cloud.google.com, crée un projet « Clipsquad ».
2. *API et services → Bibliothèque* → active **YouTube Data API v3**.
3. *Identifiants → Créer des identifiants → Clé API*. Restreins la clé à « YouTube Data API v3 ».
4. Colle-la dans `YOUTUBE_API_KEY`.

**Quota :** 10 000 unités/jour gratuites ; une lecture de stats coûte 1 unité et peut regrouper jusqu'à 50 vidéos. Au-delà de quelques milliers de clips suivis, demande une extension de quota via le formulaire « YouTube API Services – Audit and Quota Extension » (Google contrôle alors que tu respectes leurs conditions d'utilisation).

## 2. TikTok — Login Kit + Display API

Seule voie officielle pour un SaaS commercial (la *Research API* est réservée aux chercheurs). Le clippeur **connecte son compte TikTok** ; tu lis alors les stats de **ses** vidéos (`view_count`, `like_count`, `comment_count`, `share_count`). Bonus anti-fraude : ça prouve que la vidéo lui appartient.

1. Crée un compte sur https://developers.tiktok.com et une organisation (ta société).
2. *Manage apps → Connect an app*. Renseigne l'icône, le nom, la catégorie, et les URL de **CGU** et de **politique de confidentialité**.
3. Ajoute les produits **Login Kit** (web) et **Display API**.
4. Scopes à demander : `user.info.basic`, `video.list`. N'en demande pas plus : chaque scope inutile augmente le risque de refus.
5. Renseigne l'URL de redirection : `https://<ton-domaine>/api/oauth/tiktok/callback`, puis vérifie la propriété de ton domaine.
6. Pour chaque produit, explique précisément son usage (ex. : « Le clippeur connecte son compte pour que le créateur qui le rémunère puisse vérifier les vues de ses vidéos et le payer »). Joins la vidéo de démo et soumets l'app.
7. Tant que l'app n'est pas validée, tu peux tester en mode **Sandbox** avec des comptes ajoutés manuellement.

## 3. Instagram — API Instagram avec Instagram Login

Fonctionne uniquement pour les **comptes professionnels** (Créateur ou Entreprise, gratuit à activer dans l'app Instagram). Donne les insights de chaque Reel : **`views`**, `likes`, `comments`, `shares`, `saved`, `reach`, et la démographie de l'audience au niveau du compte. Attention : les données peuvent avoir **jusqu'à 48 h de retard**.

1. Crée un compte sur https://developers.facebook.com puis une app de type **Business**.
2. Ajoute le produit **Instagram → API setup with Instagram login**.
3. Permissions : `instagram_business_basic` et `instagram_business_manage_insights`.
4. Fais la **vérification d'entreprise** (Business Verification) dans le Business Manager : Kbis ou avis de situation SIREN, et le domaine.
5. Pendant le développement, l'accès *Standard* fonctionne pour les comptes que tu ajoutes toi-même comme testeurs.
6. Pour les comptes de vrais clippeurs, demande l'**Advanced Access** via l'*App Review* : un screencast par permission, et une explication de l'usage de chaque donnée.
7. Ajoute un endpoint de **suppression des données** (Data Deletion Callback) : Meta l'exige.

## 4. YouTube Analytics API (OAuth) — pour l'anti-fraude avancé

Si le clippeur connecte sa chaîne, tu obtiens la **répartition géographique**, la rétention et les sources de trafic. Le moteur anti-fraude en tient déjà compte (règle `GEO_MISMATCH` : un clip en français vu à 70 % hors francophonie).

1. Dans le même projet Google Cloud, active **YouTube Analytics API**.
2. Configure l'**écran de consentement OAuth** (type Externe, logo, domaine, confidentialité).
3. Scope : `https://www.googleapis.com/auth/yt-analytics.readonly`. C'est un scope sensible, donc Google doit **vérifier l'app** : vidéo de démo et justification. Compte 2 à 6 semaines.

## 5. X (Twitter)

Depuis février 2026, l'API est en **paiement à l'usage**, sans offre gratuite pour les nouveaux comptes. La lecture d'un post coûte environ 0,005 $, et relire le même post dans la même journée (UTC) n'est facturé qu'une fois. Un suivi quotidien de 1 000 clips représente donc ~5 $/jour. Le format clip est peu présent sur X : **garde la saisie manuelle au lancement** et branche l'API seulement si tes clients la demandent. Les tarifs évoluent : vérifie sur https://docs.x.com.

---

## Ce que je code quand tu as les accès

Pour chaque plateforme validée :
- le bouton « Connecter mon compte » côté clippeur (OAuth), avec stockage chiffré des jetons et leur rafraîchissement ;
- un fournisseur dans `src/lib/views/` (modèle : `youtube.ts`), enregistré dans `src/lib/views/index.ts` ;
- la vérification que le clip soumis appartient bien au compte connecté ;
- l'envoi de la part d'audience francophone au moteur anti-fraude (`expectedAudienceShare`).

Tant qu'une plateforme n'est pas branchée, le créateur peut saisir les stats à la main sur la fiche du clip. L'anti-fraude s'applique quand même.

### Sources
- TikTok Display API : https://developers.tiktok.com/doc/display-api-get-started/
- TikTok App Review Guidelines : https://developers.tiktok.com/docs/en/app-review-guidelines
- Insights Instagram avec Instagram Login : https://developers.facebook.com/blog/post/2025/03/24/user-and-media-insights-on-instagram-api-with-instagram-login/
- Instagram Media Insights : https://developers.facebook.com/docs/instagram-platform/reference/instagram-media/insights/
- Tarifs X API 2026 (synthèse, à confirmer sur docs.x.com) : https://www.socialcrawl.dev/blog/x-twitter-api-2026
