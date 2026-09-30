// Réception d'une photo déjà compressée par le navigateur (version pleine + miniature).
// Protégé par Cloudflare Access (middleware). On revérifie format, poids et dimensions :
// aucun original volumineux n'est stocké.
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { ajouterPhoto, giteEdition } from "../../../lib/admin";
import { entier, texte } from "../../../lib/formulaire";

const POIDS_MAX_PLEINE = 2 * 1024 * 1024;
const POIDS_MAX_MINIATURE = 300 * 1024;

/** Type réel d'après les premiers octets (on ne fait pas confiance au type annoncé). */
async function formatImage(f: File): Promise<"webp" | "jpg" | null> {
  const o = new Uint8Array(await f.slice(0, 12).arrayBuffer());
  const ascii = (a: number, b: number) => String.fromCharCode(...o.slice(a, b));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  if (o[0] === 0xff && o[1] === 0xd8 && o[2] === 0xff) return "jpg";
  return null;
}

const erreur = (message: string, status = 400) => Response.json({ ok: false, message }, { status });

export const POST: APIRoute = async ({ request }) => {
  const f = await request.formData();
  const giteId = entier(f, "gite_id", 1, Number.MAX_SAFE_INTEGER);
  const altFr = texte(f, "alt_fr", 200);
  const altEn = texte(f, "alt_en", 200);
  const largeur = entier(f, "largeur", 1, 1600);
  const hauteur = entier(f, "hauteur", 1, 4000);
  const largeurMin = entier(f, "largeur_min", 1, 400);
  const hauteurMin = entier(f, "hauteur_min", 1, 1000);
  const pleine = f.get("pleine");
  const miniature = f.get("miniature");

  if (giteId === null || !(await giteEdition(giteId))) return erreur("Gîte inconnu");
  if (!altFr) return erreur("Texte alternatif obligatoire");
  if (largeur === null || hauteur === null || largeurMin === null || hauteurMin === null) return erreur("Dimensions invalides");
  if (!(pleine instanceof File) || !(miniature instanceof File)) return erreur("Fichiers manquants");
  if (pleine.size > POIDS_MAX_PLEINE || miniature.size > POIDS_MAX_MINIATURE) return erreur("Fichier trop lourd", 413);

  const [fmtPleine, fmtMin] = await Promise.all([formatImage(pleine), formatImage(miniature)]);
  if (!fmtPleine || !fmtMin) return erreur("Format non accepté (WebP ou JPEG)", 415);

  // Clé unique : une photo modifiée change d'adresse, le cache peut donc être permanent.
  const base = `gites/${giteId}/${crypto.randomUUID()}`;
  const clePleine = `${base}-1600.${fmtPleine}`;
  const cleMin = `${base}-400.${fmtMin}`;
  const meta = (fmt: string) => ({
    httpMetadata: {
      contentType: fmt === "webp" ? "image/webp" : "image/jpeg",
      cacheControl: "public, max-age=31536000, immutable",
    },
  });

  await Promise.all([
    env.PHOTOS.put(clePleine, await pleine.arrayBuffer(), meta(fmtPleine)),
    env.PHOTOS.put(cleMin, await miniature.arrayBuffer(), meta(fmtMin)),
  ]);
  try {
    await ajouterPhoto({
      gite_id: giteId,
      cle_pleine: clePleine,
      cle_miniature: cleMin,
      largeur,
      hauteur,
      largeur_min: largeurMin,
      hauteur_min: hauteurMin,
      alt_fr: altFr,
      alt_en: altEn,
    });
  } catch (e) {
    await env.PHOTOS.delete([clePleine, cleMin]);
    throw e;
  }
  return Response.json({ ok: true });
};
