// Messages affichés après une action dans l'admin. Seuls des codes transitent
// dans l'URL : aucun texte arbitraire n'est reflété dans la page.
export const MESSAGES_OK = {
  enregistre: "Enregistré.",
  supprime: "Supprimé.",
  ajoute: "Ajouté.",
  photo: "Photo ajoutée.",
} as const;

export const MESSAGES_ERREUR = {
  invalide: "Certains champs sont invalides : vérifiez le formulaire.",
  slug: "Cette adresse (slug) est déjà utilisée par un autre gîte.",
  dates: "Les dates sont invalides : la fin doit suivre le début.",
  url: "L'adresse du calendrier doit commencer par https://.",
  alt: "Le texte alternatif en français est obligatoire.",
  photo: "La photo n'a pas pu être enregistrée.",
} as const;

export type CodeOk = keyof typeof MESSAGES_OK;
export type CodeErreur = keyof typeof MESSAGES_ERREUR;

/** Redirection 303 après un POST, avec un code de message. */
export function apres(chemin: string, message: { ok: CodeOk } | { erreur: CodeErreur }, ancre = ""): Response {
  const [cle, code] = "ok" in message ? ["ok", message.ok] : ["erreur", message.erreur];
  return new Response(null, { status: 303, headers: { Location: `${chemin}?${cle}=${code}${ancre}` } });
}
