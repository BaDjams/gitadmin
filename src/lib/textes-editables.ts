// Textes du site modifiables dans l'admin (table `textes`), dans l'ordre d'affichage.
export const TEXTES_EDITABLES = [
  { cle: "accueil.titre", libelle: "Accueil : titre principal", long: false },
  { cle: "accueil.intro", libelle: "Accueil : phrase d'introduction (aussi utilisée pour Google)", long: false },
  { cle: "accueil.lieu", libelle: "Accueil : présentation du lieu", long: true },
  { cle: "accueil.peche", libelle: "Accueil : encadré sur la pêche (laisser vide pour le masquer)", long: true },
  { cle: "contact.intro", libelle: "Contact : introduction", long: false },
  { cle: "contact.adresse", libelle: "Contact : adresse", long: true },
  { cle: "contact.telephone", libelle: "Contact : téléphone (laisser vide pour le masquer)", long: false },
  { cle: "contact.acces", libelle: "Contact : accès", long: true },
  { cle: "tarifs.taxe_sejour", libelle: "Tarifs : mention sur la taxe de séjour", long: true },
] as const;

export const CLES_TEXTES: ReadonlySet<string> = new Set(TEXTES_EDITABLES.map((t) => t.cle));
