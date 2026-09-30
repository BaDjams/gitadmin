// Plan du site, avec les versions française et anglaise de chaque page.
import type { APIRoute } from "astro";
import { slugsPublies } from "../lib/db";
import { chemin, type PageId } from "../lib/i18n";
import { absolu } from "../lib/photos";

export const GET: APIRoute = async () => {
  const pages: { page: PageId; slug?: string; maj?: string }[] = [
    { page: "accueil" },
    ...(await slugsPublies()).map((g) => ({ page: "gite" as const, slug: g.slug, maj: g.maj_le.slice(0, 10) })),
    { page: "contact" },
    { page: "mentions" },
    { page: "confidentialite" },
  ];

  const urls = pages.flatMap(({ page, slug, maj }) => {
    const fr = absolu(chemin("fr", page, slug));
    const en = absolu(chemin("en", page, slug));
    const alternatives = `
    <xhtml:link rel="alternate" hreflang="fr" href="${fr}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${en}"/>`;
    return [fr, en].map(
      (loc) => `  <url>
    <loc>${loc}</loc>${maj ? `\n    <lastmod>${maj}</lastmod>` : ""}${alternatives}
  </url>`,
    );
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
