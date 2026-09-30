// Réception des demandes de séjour et des messages de contact.
// Enregistrement dans D1 (même si l'e-mail échoue), puis notification des propriétaires.
import type { APIRoute } from "astro";
import { ajouterJours, aujourdhui, estDateIso } from "../../lib/dates";
import { enregistrerDemande, marquerEmailEnvoye, nomGite, type NouvelleDemande } from "../../lib/db";
import { notifierDemande } from "../../lib/email";
import { estLangue } from "../../lib/i18n";
import { absolu } from "../../lib/photos";
import { verifierTurnstile } from "../../lib/turnstile";

const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;

function texte(f: FormData, nom: string, max: number): string {
  const v = f.get(nom);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function entier(f: FormData, nom: string, min: number, max: number): number | null {
  const s = texte(f, nom, 10);
  if (!s) return null;
  const v = Number(s);
  return Number.isInteger(v) && v >= min && v <= max ? v : null;
}

export const POST: APIRoute = async ({ request, redirect, clientAddress }) => {
  let f: FormData;
  try {
    f = await request.formData();
  } catch {
    return new Response("Requête invalide", { status: 400 });
  }

  // Retour uniquement vers une page du site (pas de redirection ouverte).
  const retourBrut = texte(f, "retour", 200);
  const retour = /^\/(?!\/)[\w\-/]*$/.test(retourBrut) ? retourBrut : "/contact";
  const sejour = f.has("arrivee");
  const ancre = sejour ? "#demande" : "#ecrire";
  const vers = (statut: string) => redirect(`${retour}?demande=${statut}${ancre}`, 303);

  // Piège à robots rempli : on fait comme si tout allait bien.
  if (texte(f, "site_web", 200)) return vers("ok");

  const ip = request.headers.get("CF-Connecting-IP") ?? clientAddress ?? null;
  if (!(await verifierTurnstile(texte(f, "cf-turnstile-response", 2048), ip))) return vers("captcha");

  const langue = texte(f, "langue", 2);
  const giteBrut = texte(f, "gite_id", 10);
  const giteId = giteBrut ? entier(f, "gite_id", 1, 1_000_000) : null;
  const gite = giteId != null ? await nomGite(giteId) : null;

  const d: NouvelleDemande = {
    gite_id: gite ? giteId : null,
    arrivee: sejour ? texte(f, "arrivee", 10) : null,
    depart: sejour ? texte(f, "depart", 10) : null,
    adultes: sejour ? entier(f, "adultes", 1, 20) : null,
    enfants: sejour ? entier(f, "enfants", 0, 20) : null,
    nom: texte(f, "nom", 120),
    email: texte(f, "email", 200),
    telephone: texte(f, "telephone", 40) || null,
    message: texte(f, "message", 4000),
    langue: estLangue(langue) ? langue : "fr",
  };

  const valide =
    d.nom.length > 0 &&
    EMAIL.test(d.email) &&
    (giteBrut === "" || gite !== null) &&
    (sejour
      ? d.gite_id !== null &&
        estDateIso(d.arrivee!) &&
        estDateIso(d.depart!) &&
        d.arrivee! >= aujourdhui() &&
        d.depart! > d.arrivee! &&
        d.depart! <= ajouterJours(aujourdhui(), 2 * 365) &&
        d.adultes !== null &&
        d.enfants !== null
      : d.message.length > 0);
  if (!valide) return vers("erreur");

  const id = await enregistrerDemande(d);
  try {
    await notifierDemande({ ...d, id, giteNom: gite?.nom ?? null, lienAdmin: absolu(`/admin/demandes/${id}`) });
    await marquerEmailEnvoye(id);
  } catch (e) {
    // La demande reste visible dans l'admin (email_envoye = 0).
    console.error("Échec de l'envoi de la notification", id, e);
  }
  return vers("ok");
};
