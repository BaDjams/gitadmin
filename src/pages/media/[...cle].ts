// Photos servies depuis R2 par le Worker. En production, elles passent par le
// sous-domaine du bucket (img.domainedeganzeville.fr) ; cette route sert en local
// et de secours.
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const GET: APIRoute = async ({ params, request }) => {
  const cle = params.cle ?? "";
  if (!cle || cle.includes("..")) return new Response(null, { status: 404 });

  const objet = await env.PHOTOS.get(cle, { onlyIf: request.headers });
  if (!objet) return new Response(null, { status: 404 });

  const entetes = new Headers();
  objet.writeHttpMetadata(entetes);
  entetes.set("ETag", objet.httpEtag);
  // Les clés sont versionnées : une photo modifiée change de clé.
  entetes.set("Cache-Control", "public, max-age=31536000, immutable");
  if (!("body" in objet)) return new Response(null, { status: 304, headers: entetes });
  return new Response(objet.body, { headers: entetes });
};
