import { env } from "cloudflare:workers";

/**
 * URL publique d'un objet photo.
 * - `placeholder/…` : images de démonstration livrées avec le site (dossier public).
 * - sinon : sous-domaine R2 (`img.domainedeganzeville.fr`), ou `/media` en local.
 */
export function urlPhoto(cle: string): string {
  if (cle.startsWith("placeholder/")) return `/placeholders/${cle.slice("placeholder/".length)}`;
  const base = (env.IMG_BASE_URL || "/media").replace(/\/$/, "");
  return `${base}/${cle.split("/").map(encodeURIComponent).join("/")}`;
}

/** URL absolue (balises Open Graph, données structurées, sitemap). */
export function absolu(chemin: string): string {
  if (/^https?:\/\//.test(chemin)) return chemin;
  return `${(env.SITE_URL || "https://domainedeganzeville.fr").replace(/\/$/, "")}${chemin}`;
}
