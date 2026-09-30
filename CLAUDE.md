# Site web des gîtes de Ganzeville

## Objectif
Site vitrine de 3 gîtes normands situés à Ganzeville (Seine-Maritime, 76), à environ 3 km de Fécamp. Une page publique par gîte, avec photos, description, tarifs et calendrier de disponibilités. Un mini CMS d'administration, utilisable depuis un téléphone, permet de modifier les textes et les photos sans toucher au code.

Langue du site et des commentaires de code : français.

## Stack (tout sur Cloudflare)
- **Cloudflare Pages** + Functions pour le site public. Site statique en priorité, contenu dynamique lu depuis D1.
- **D1** (SQLite) pour les textes, tarifs, sources de calendrier et périodes occupées.
- **R2** pour les photos, servies via un sous-domaine dédié (`img.domainedeganzeville.fr`).
- **Cloudflare Access** pour protéger `/admin` et les routes d'écriture. Ne pas coder d'authentification maison.
- **Worker avec Cron Trigger** pour synchroniser les disponibilités.
- Nom de domaine visé : `domainedeganzeville.fr`. Enregistré chez OVH (Cloudflare ne gère pas le .fr), DNS délégués à Cloudflare.

Décision ouverte : partir d'un CMS open source existant (**EmDash**, basé sur Astro + D1 + R2) ou d'un squelette sur mesure. Avant d'écrire du code, évaluer EmDash rapidement, en vérifiant surtout s'il permet de définir un type de contenu « Gîte » avec des champs personnalisés. Proposer une recommandation argumentée, puis attendre ma validation.

## Pages
- `/` : accueil, présentation du lieu, cartes des 3 gîtes.
- `/gites/<slug>` : une page par gîte (galerie, description, équipements, tarifs, calendrier de disponibilités, formulaire de demande de séjour).
- `/contact` : coordonnées, accès, formulaire.
- `/mentions-legales` et politique de confidentialité (conformité RGPD, pas de traceur inutile).
- `/admin` : édition des gîtes, photos, tarifs, liens de calendrier. Mobile-first.

## Modèle de données (D1), à affiner
- `gites` : id, slug, nom, accroche, description, capacité, chambres, équipements (JSON), règles, ordre d'affichage.
- `photos` : id, gite_id, clé R2, légende, ordre, version miniature et version pleine.
- `tarifs` : gite_id, période, prix par nuit, séjour minimum.
- `calendar_sources` : gite_id, type (`ical` | `channel_manager`), URL ou identifiant, dernière synchro, statut.
- `bookings` : gite_id, arrivée, départ, source. Reconstruite à chaque synchronisation.

## Disponibilités
Les plateformes (Airbnb, Booking.com, Vrbo) ne donnent pas d'API aux hébergeurs individuels. La première version utilise donc leurs **exports iCal**. Plus tard, la conciergerie fournira l'**API REST de son channel manager** (produit encore inconnu).

Règles d'architecture :
- Définir une interface `AvailabilityProvider` qui retourne pour un gîte une liste de périodes occupées. Implémentation initiale `ical`, future implémentation `channel-manager`. Les pages et la base ne doivent pas savoir quelle source est utilisée.
- Le Worker planifié interroge les sources toutes les 15 à 30 minutes, fusionne les flux (une date est occupée si elle l'est sur au moins une source) et écrit dans D1. Les pages lisent uniquement D1, jamais les plateformes.
- Les URL iCal contiennent un jeton secret : stockage côté serveur uniquement, jamais dans le dépôt ni renvoyées au navigateur.
- Dans iCal, `DTEND` est exclusif : le jour de départ reste disponible pour une nouvelle arrivée.
- Les disponibilités affichées sont indicatives (l'iCal a un délai de rafraîchissement). Le site propose une **demande de séjour**, pas une réservation ferme.
- Gérer proprement les erreurs de synchro : conserver la dernière version valide et signaler l'échec dans l'admin.

## Photos
- Compression **côté navigateur avant envoi** (canvas), conversion en WebP, 1600 px de large maximum pour la version pleine, environ 400 px pour la miniature.
- Stockage R2, jamais d'originaux volumineux.
- Chargement différé, dimensions déclarées (pas de décalage de mise en page), texte alternatif obligatoire.
- Prévoir la possibilité d'un filigrane léger.

## Contraintes
- Mobile-first, rapide, accessible (contrastes, navigation clavier, `alt`).
- SEO local : balises meta, données structurées schema.org (hébergement de vacances), sitemap, URL propres.
- Peu de dépendances, pas de framework lourd sans justification.
- TypeScript, migrations D1 versionnées dans le dépôt, configuration dans `wrangler.toml`.
- Aucun secret dans le dépôt (utiliser les secrets Cloudflare).
- Avant toute décision structurante, me présenter les options plutôt que de trancher seul.

## Contenu de démonstration (placeholders)
Ton : chaleureux, sobre, sans exagération. Tout ce qui suit est provisoire et à remplacer par les vrais éléments (noms, capacités, équipements, tarifs). Ne rien inventer de précis au-delà : marquer chaque donnée fictive `[À REMPLACER]`.

**Le lieu** : trois gîtes normands à Ganzeville, en Seine-Maritime, à 3 km de Fécamp et de la mer. Une propriété calme, un havre de paix, bordée par un ruisseau accessible directement depuis le terrain, où l'on peut pêcher. Idéal pour se ressourcer, marcher, découvrir la Côte d'Albâtre.

**Gîtes fictifs** (noms provisoires) :
1. **Le Ruisseau** : le plus proche de l'eau, au bord du ruisseau. `[À REMPLACER]` couple ou petite famille.
2. **Le Colombier** : gîte de caractère en pierre et colombages. `[À REMPLACER]` famille.
3. **Le Clos** : gîte lumineux ouvert sur le jardin. `[À REMPLACER]` groupe d'amis.

Chaque fiche : accroche d'une phrase, description de 3 à 4 phrases, liste d'équipements type, 3 à 4 photos factices, tarif fictif par nuit et séjour minimum.

**Point à vérifier avant publication** : la pêche dans le ruisseau est un argument fort, mais elle peut être soumise à réglementation (carte de pêche, droits de pêche du riverain, période). Ne rien promettre sur le site tant que ce n'est pas confirmé, et prévoir une mention adaptée.

## Ordre de travail proposé
1. Évaluer EmDash vs squelette sur mesure, me faire une recommandation.
2. Mettre en place le projet, D1, R2 et la structure des pages avec les placeholders.
3. Construire la fiche de gîte et la galerie.
4. Construire l'admin (Access, formulaires, envoi de photos).
5. Implémenter la synchro iCal avec l'interface `AvailabilityProvider`.
6. Mentions légales, SEO, tests mobiles, mise en ligne sur le domaine.

## Décisions validées
- **Squelette sur mesure avec Astro** (EmDash écarté : schéma défini en base et non versionné, tarifs et disponibilités hors de son modèle, envoi de photos sans compression navigateur, trop lourd pour 3 gîtes).
- **Worker unique** (Workers + fichiers statiques) : site public, admin, API et Cron dans le même projet. Point d'entrée : `src/worker.ts`.
- **Demandes** : enregistrées dans D1, notifiées par e-mail via le binding `send_email` de Cloudflare, protégées par Turnstile.
- **Tarifs** : trois saisons (basse, moyenne, haute) dont les périodes sont communes aux gîtes ; prix par nuit et séjour minimum par gîte et par saison. Frais de ménage et caution par gîte, mention de la taxe de séjour.
- **Calendrier** : affiché sur 12 mois.
- **Admin** : deux personnes, depuis téléphone ou ordinateur ; règles Access par adresse e-mail.
- **Langues** : français (sans préfixe) et anglais (`/en/...`).
- **Filigrane** : optionnel, réglable dans l'admin, texte par défaut `domainedeganzeville.fr`.
- **Carte** : OpenStreetMap chargée uniquement au clic.
- **Compte Cloudflare dédié** au site.
