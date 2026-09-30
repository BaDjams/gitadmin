import { env } from "cloudflare:workers";

/** Vérifie côté serveur le jeton Cloudflare Turnstile (anti-spam sans cookie traceur). */
export async function verifierTurnstile(jeton: string, ip: string | null): Promise<boolean> {
  if (!jeton) return false;
  const corps = new FormData();
  corps.append("secret", env.TURNSTILE_SECRET_KEY);
  corps.append("response", jeton);
  if (ip) corps.append("remoteip", ip);
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: corps });
    const data = (await r.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
