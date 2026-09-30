// Point d'entrée du Worker unique : pages Astro (fetch) et tâches planifiées (cron).
import { handle } from "@astrojs/cloudflare/handler";

/** Durée de conservation des demandes (RGPD) : 3 ans. */
const CONSERVATION_DEMANDES = "-3 years";

export default {
  fetch: handle,

  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(
      env.DB.prepare(`DELETE FROM demandes WHERE cree_le < datetime('now', ?)`).bind(CONSERVATION_DEMANDES).run(),
    );
  },
} satisfies ExportedHandler<Env>;
