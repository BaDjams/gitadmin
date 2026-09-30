# Domaine de Ganzeville

Site des trois gîtes de Ganzeville (Seine-Maritime), près de Fécamp. Français et anglais, mobile d'abord, hébergé entièrement sur Cloudflare.

- **Astro** rendu côté serveur sur un **Worker unique** (site, API, admin, tâches planifiées).
- **D1** pour les contenus, tarifs, disponibilités et demandes ; **R2** pour les photos.
- Aucune dépendance d'exécution en dehors d'Astro et de son adaptateur Cloudflare.

Le cahier des charges et les décisions prises sont dans [`CLAUDE.md`](CLAUDE.md).

## Avancement

| Étape | État |
| --- | --- |
| 1. Choix EmDash / sur mesure | ✅ Sur mesure avec Astro |
| 2. Projet, D1, R2, pages avec contenu de démonstration | ✅ |
| 3. Fiche gîte, galerie, tarifs, calendrier, demande de séjour | ✅ |
| 4. Admin (Cloudflare Access, formulaires, envoi de photos) | à faire |
| 5. Synchro iCal (`AvailabilityProvider`) | à faire |
| 6. Mentions légales définitives, SEO, tests mobiles, mise en ligne | en partie (pages légales avec champs `[À REMPLACER]`) |

## Pages

| Français | Anglais |
| --- | --- |
| `/` | `/en` |
| `/gites/<slug>` | `/en/cottages/<slug>` |
| `/contact` | `/en/contact` |
| `/mentions-legales` | `/en/legal-notice` |
| `/confidentialite` | `/en/privacy` |

Plus `/sitemap.xml`, `/robots.txt`, `/api/demande` (formulaires) et `/media/<clé>` (photos R2 servies par le Worker, utile en local).

Tant que le paramètre `mode_demo` vaut `1` (table `parametres`), un bandeau « site en préparation » s'affiche et le site est fermé aux moteurs de recherche.

## Structure

```
migrations/          Migrations D1 versionnées (schéma, puis contenu de démonstration)
public/placeholders/ Photos factices (SVG)
src/worker.ts        Point d'entrée du Worker : pages Astro + Cron
src/lib/             Accès D1, i18n, dates, calendrier, e-mail, Turnstile, photos
src/components/      Galerie, calendrier, tarifs, formulaire, carte de gîte
src/views/           Pages partagées entre les deux langues
src/pages/           Routes (fichiers minces qui appellent les vues)
src/styles/          Feuille de style unique (palette « bocage normand »)
```

## Développement local

Prérequis : Node.js 22 ou plus.

```sh
npm install
cp .dev.vars.example .dev.vars   # clés Turnstile de test, destinataire fictif
npm run db:migrate:local         # crée la base D1 locale avec le contenu de démonstration
npm run dev                      # http://localhost:4321
```

En local, les e-mails ne partent pas : le simulateur de Cloudflare les écrit dans la console.

Vérifications : `npm run check` (types), `npm run build`.

## Mise en place sur Cloudflare

À faire une fois, depuis le compte Cloudflare dédié au site.

1. **Nom de domaine** : dans l'espace client OVH, remplacer les serveurs DNS de `domainedeganzeville.fr` par ceux indiqués par Cloudflare en ajoutant le domaine.
2. **Connexion de Wrangler** : `npx wrangler login`.
3. **Base D1** : `npx wrangler d1 create ganzeville`, copier l'identifiant renvoyé dans `database_id` de `wrangler.toml`, puis `npm run db:migrate:remote`.
4. **Bucket R2** : `npx wrangler r2 bucket create ganzeville-photos`, puis, dans le tableau de bord (R2, bucket, Settings, Custom Domains), rattacher `img.domainedeganzeville.fr`.
5. **E-mail** : activer Email Routing sur le domaine et y **vérifier les adresses** qui recevront les demandes. L'expéditeur est `demandes@domainedeganzeville.fr` (modifiable dans `wrangler.toml`).
6. **Turnstile** : créer un widget pour `domainedeganzeville.fr` et récupérer la clé de site et la clé secrète.
7. **Secrets** (jamais dans le dépôt) :
   ```sh
   npx wrangler secret put TURNSTILE_SITE_KEY
   npx wrangler secret put TURNSTILE_SECRET_KEY
   npx wrangler secret put DEMANDE_DESTINATAIRES   # adresses séparées par des virgules
   ```
8. **Déploiement** : `npm run deploy`, puis rattacher `domainedeganzeville.fr` au Worker (Settings, Domains & Routes).
9. **Cloudflare Access** (étape 4) : protéger `/admin*` et les routes d'écriture de l'admin, avec une règle autorisant les deux adresses e-mail des propriétaires.

## Palette

| Rôle | Couleur |
| --- | --- |
| Vert bocage (titres, liens) | `#2f5d50` / `#22463c` |
| Blanc craie (fond) | `#f7f4ec` |
| Ardoise (texte) | `#2b3640` |
| Galet (bordures) | `#d9d2c2` |
| Brique (boutons, dates occupées) | `#9a472d` |

Polices système uniquement : aucun appel à un service de polices externe (RGPD, rapidité).
