import type { Langue } from "./i18n";

// Catalogue fermé d'équipements : l'admin coche des cases, la traduction est
// assurée ici. Ajouter une entrée suffit pour la proposer dans l'admin.
export const EQUIPEMENTS = {
  wifi: { fr: "Wi-Fi", en: "Wi-Fi" },
  cuisine_equipee: { fr: "Cuisine équipée", en: "Fully equipped kitchen" },
  lave_linge: { fr: "Lave-linge", en: "Washing machine" },
  lave_vaisselle: { fr: "Lave-vaisselle", en: "Dishwasher" },
  poele_bois: { fr: "Poêle à bois", en: "Wood-burning stove" },
  cheminee: { fr: "Cheminée", en: "Fireplace" },
  chauffage: { fr: "Chauffage", en: "Heating" },
  tv: { fr: "Télévision", en: "TV" },
  terrasse: { fr: "Terrasse", en: "Terrace" },
  jardin: { fr: "Jardin", en: "Garden" },
  barbecue: { fr: "Barbecue", en: "Barbecue" },
  mobilier_jardin: { fr: "Salon de jardin", en: "Garden furniture" },
  acces_ruisseau: { fr: "Accès au ruisseau", en: "Access to the stream" },
  parking: { fr: "Stationnement sur place", en: "On-site parking" },
  lit_bebe: { fr: "Lit bébé sur demande", en: "Baby cot on request" },
  draps_fournis: { fr: "Draps fournis", en: "Bed linen provided" },
  serviettes_fournies: { fr: "Serviettes fournies", en: "Towels provided" },
  animaux_acceptes: { fr: "Animaux acceptés", en: "Pets welcome" },
  plain_pied: { fr: "De plain-pied", en: "Single storey" },
} as const satisfies Record<string, Record<Langue, string>>;

export type CleEquipement = keyof typeof EQUIPEMENTS;

export function estEquipement(cle: string): cle is CleEquipement {
  return Object.hasOwn(EQUIPEMENTS, cle);
}

export function libellesEquipements(cles: string[], lang: Langue): string[] {
  return cles.filter(estEquipement).map((c) => EQUIPEMENTS[c][lang]);
}
