import type { APIRoute } from "astro";
import { parametres } from "../lib/db";
import { absolu } from "../lib/photos";

// En mode démonstration, le site entier est fermé aux robots.
export const GET: APIRoute = async () => {
  const demo = (await parametres()).mode_demo === "1";
  const corps = demo
    ? "User-agent: *\nDisallow: /\n"
    : `User-agent: *\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${absolu("/sitemap.xml")}\n`;
  return new Response(corps, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
