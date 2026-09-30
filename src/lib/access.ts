// Vérification du jeton Cloudflare Access (défense en profondeur).
// Access protège déjà /admin et /api/admin en amont ; le Worker revérifie la
// signature du jeton pour ne jamais dépendre d'une règle mal configurée.
// Aucune authentification maison : on ne fait que contrôler ce qu'Access a émis.
import { env } from "cloudflare:workers";

interface Jwk extends JsonWebKey {
  kid: string;
}

let cacheCles: { cles: Jwk[]; expire: number } | null = null;

async function clesPubliques(equipe: string): Promise<Jwk[]> {
  if (cacheCles && cacheCles.expire > Date.now()) return cacheCles.cles;
  const r = await fetch(`https://${equipe}/cdn-cgi/access/certs`);
  if (!r.ok) throw new Error(`Certificats Access indisponibles (${r.status})`);
  const { keys } = (await r.json()) as { keys: Jwk[] };
  cacheCles = { cles: keys, expire: Date.now() + 60 * 60 * 1000 };
  return keys;
}

function base64url(s: string): Uint8Array<ArrayBuffer> {
  const b = atob(s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "="));
  return new Uint8Array(Array.from(b, (c) => c.charCodeAt(0)));
}

function decoder<T>(partie: string): T {
  return JSON.parse(new TextDecoder().decode(base64url(partie))) as T;
}

/** Renvoie l'e-mail de la personne connectée, ou null si le jeton est absent ou invalide. */
export async function verifierAccess(request: Request): Promise<string | null> {
  const url = new URL(request.url);
  const equipe = env.ACCESS_TEAM_DOMAIN;
  const audience = env.ACCESS_AUD;

  // Développement local uniquement : sans configuration Access, on laisse passer localhost.
  if (!equipe && !audience && (url.hostname === "localhost" || url.hostname === "127.0.0.1")) {
    return "dev@localhost";
  }
  // En production, une configuration manquante ferme l'accès.
  if (!equipe || !audience) return null;

  const jeton =
    request.headers.get("Cf-Access-Jwt-Assertion") ??
    /(?:^|;\s*)CF_Authorization=([^;]+)/.exec(request.headers.get("Cookie") ?? "")?.[1];
  if (!jeton) return null;

  const [entete64, charge64, signature64] = jeton.split(".");
  if (!entete64 || !charge64 || !signature64) return null;

  try {
    const entete = decoder<{ alg: string; kid: string }>(entete64);
    const charge = decoder<{ aud: string | string[]; exp: number; nbf?: number; iss: string; email?: string }>(charge64);
    if (entete.alg !== "RS256") return null;

    const jwk = (await clesPubliques(equipe)).find((k) => k.kid === entete.kid);
    if (!jwk) return null;
    const cle = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    const valide = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      cle,
      base64url(signature64),
      new TextEncoder().encode(`${entete64}.${charge64}`),
    );
    if (!valide) return null;

    const maintenant = Date.now() / 1000;
    const audiences = Array.isArray(charge.aud) ? charge.aud : [charge.aud];
    if (!audiences.includes(audience)) return null;
    if (charge.iss !== `https://${equipe}`) return null;
    if (charge.exp < maintenant || (charge.nbf && charge.nbf > maintenant + 60)) return null;
    return charge.email ?? null;
  } catch {
    return null;
  }
}
