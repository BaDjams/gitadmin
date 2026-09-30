import { env } from "cloudflare:workers";
import type { NouvelleDemande } from "./db";

/**
 * Prévient les propriétaires d'une nouvelle demande. « Répondre » depuis la
 * messagerie écrit directement au voyageur (en-tête Reply-To).
 */
export async function notifierDemande(
  d: NouvelleDemande & { id: number; giteNom: string | null; lienAdmin: string },
): Promise<void> {
  const destinataires = env.DEMANDE_DESTINATAIRES.split(",").map((a) => a.trim()).filter(Boolean);
  if (!destinataires.length) throw new Error("DEMANDE_DESTINATAIRES non configuré");

  const objet = d.arrivee
    ? `Demande de séjour – ${d.giteNom ?? "gîte au choix"} – ${d.arrivee} → ${d.depart}`
    : `Message de contact – ${d.nom}`;

  const lignes = [
    `Nouvelle ${d.arrivee ? "demande de séjour" : "prise de contact"} n° ${d.id} (${d.langue.toUpperCase()})`,
    "",
    d.giteNom ? `Gîte : ${d.giteNom}` : null,
    d.arrivee ? `Arrivée : ${d.arrivee}` : null,
    d.depart ? `Départ : ${d.depart}` : null,
    d.adultes != null ? `Voyageurs : ${d.adultes} adulte(s), ${d.enfants ?? 0} enfant(s)` : null,
    "",
    `Nom : ${d.nom}`,
    `E-mail : ${d.email}`,
    d.telephone ? `Téléphone : ${d.telephone}` : null,
    "",
    d.message ? `Message :\n${d.message}` : null,
    "",
    "Répondez directement à cet e-mail pour écrire au voyageur.",
    `Voir dans l'admin : ${d.lienAdmin}`,
  ].filter((l): l is string => l !== null);

  // Le nom saisi par le visiteur sert d'affichage : on retire tout caractère de contrôle.
  const nomAffiche = d.nom.replace(/[\r\n"<>]/g, " ").slice(0, 80);

  await env.EMAIL.send({
    from: { name: "Site Domaine de Ganzeville", email: env.EMAIL_EXPEDITEUR },
    to: destinataires,
    replyTo: { name: nomAffiche, email: d.email },
    subject: objet,
    text: lignes.join("\n"),
  });
}
