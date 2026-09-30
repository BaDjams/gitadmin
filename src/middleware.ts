import { defineMiddleware } from "astro:middleware";
import { verifierAccess } from "./lib/access";

const estAdmin = (chemin: string) =>
  chemin === "/admin" || chemin.startsWith("/admin/") || chemin.startsWith("/api/admin/");

export const onRequest = defineMiddleware(async (ctx, suite) => {
  if (!estAdmin(ctx.url.pathname)) {
    const reponse = await suite();
    reponse.headers.set("X-Content-Type-Options", "nosniff");
    reponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    return reponse;
  }

  const email = await verifierAccess(ctx.request);
  if (!email) return new Response("Accès refusé", { status: 403 });
  ctx.locals.admin = { email };

  const reponse = await suite();
  reponse.headers.set("Cache-Control", "no-store");
  reponse.headers.set("X-Robots-Tag", "noindex, nofollow");
  reponse.headers.set("X-Content-Type-Options", "nosniff");
  reponse.headers.set("Referrer-Policy", "same-origin");
  reponse.headers.set("X-Frame-Options", "DENY");
  return reponse;
});
