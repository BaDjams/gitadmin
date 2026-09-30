// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

// Site rendu à la demande sur un Worker Cloudflare unique (site public, admin,
// API et tâche planifiée). Le contenu vient de D1, les photos de R2.
export default defineConfig({
  site: "https://domainedeganzeville.fr",
  output: "server",
  trailingSlash: "never",
  adapter: cloudflare({
    // Les photos sont déjà optimisées (WebP) avant envoi : aucune transformation.
    imageService: "passthrough",
  }),
  i18n: {
    locales: ["fr", "en"],
    defaultLocale: "fr",
    routing: { prefixDefaultLocale: false },
  },
  build: { format: "file" },
  // Pas de sessions Astro : l'authentification de l'admin est assurée par Cloudflare Access.
  session: false,
  devToolbar: { enabled: false },
});
