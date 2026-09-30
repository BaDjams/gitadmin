// Langues, URL et libellés de l'interface. Le contenu éditable (textes des gîtes,
// accueil…) vit dans D1 ; ici ne figurent que les libellés fixes.

export const LANGUES = ["fr", "en"] as const;
export type Langue = (typeof LANGUES)[number];

export function estLangue(v: unknown): v is Langue {
  return v === "fr" || v === "en";
}

/** Identifiants des pages, communs aux deux langues. */
export type PageId = "accueil" | "gite" | "contact" | "mentions" | "confidentialite";

const CHEMINS: Record<Langue, Record<Exclude<PageId, "gite">, string> & { gite: (slug: string) => string }> = {
  fr: {
    accueil: "/",
    gite: (slug) => `/gites/${slug}`,
    contact: "/contact",
    mentions: "/mentions-legales",
    confidentialite: "/confidentialite",
  },
  en: {
    accueil: "/en",
    gite: (slug) => `/en/cottages/${slug}`,
    contact: "/en/contact",
    mentions: "/en/legal-notice",
    confidentialite: "/en/privacy",
  },
};

export function chemin(lang: Langue, page: PageId, slug?: string): string {
  const c = CHEMINS[lang];
  if (page === "gite") return c.gite(slug ?? "");
  return c[page];
}

const fr = {
  siteNom: "Domaine de Ganzeville",
  siteSousTitre: "Gîtes en Normandie, près de Fécamp",
  navAccueil: "Accueil",
  navGites: "Les gîtes",
  navContact: "Contact",
  allerAuContenu: "Aller au contenu",
  filAriane: "Fil d'Ariane",
  autreLangue: "English",
  autreLangueCode: "en",
  menu: "Menu",
  bandeauDemo: "Site en préparation : les textes, photos et tarifs sont provisoires.",
  voirLeGite: "Découvrir le gîte",
  personnes: (n: number) => `${n} ${n > 1 ? "personnes" : "personne"}`,
  chambres: (n: number) => `${n} ${n > 1 ? "chambres" : "chambre"}`,
  surface: (n: number) => `${n} m²`,
  aPartirDe: (p: string) => `à partir de ${p} / nuit`,
  lesGites: "Nos trois gîtes",
  leLieu: "Le lieu",
  galerie: "Photos",
  photoSur: (i: number, n: number) => `Photo ${i} sur ${n}`,
  fermer: "Fermer",
  precedente: "Photo précédente",
  suivante: "Photo suivante",
  description: "Le gîte",
  equipements: "Équipements",
  regles: "Bon à savoir",
  tarifs: "Tarifs",
  saison: "Saison",
  prixNuit: "Prix par nuit",
  sejourMin: "Séjour minimum",
  nuits: (n: number) => `${n} ${n > 1 ? "nuits" : "nuit"}`,
  saisons: { basse: "Basse saison", moyenne: "Moyenne saison", haute: "Haute saison" },
  periodesSaison: "Périodes de moyenne et haute saison",
  horsPeriodes: "En dehors de ces périodes : basse saison.",
  fraisMenage: (p: string) => `Frais de ménage : ${p} par séjour, à la charge du locataire.`,
  caution: (p: string) => `Un dépôt de garantie de ${p} est demandé à l'arrivée, restitué après l'état des lieux.`,
  du: "du",
  au: "au",
  disponibilites: "Disponibilités",
  dispoIndicatives:
    "Calendrier indicatif, mis à jour régulièrement. La disponibilité est confirmée en réponse à votre demande.",
  libre: "Disponible",
  occupe: "Occupé",
  passe: "Date passée",
  moisSuivants: "Voir les mois suivants",
  jours: ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."],
  joursLongs: ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"],
  demandeTitre: "Demande de séjour",
  demandeIntro:
    "Indiquez vos dates et le nombre de voyageurs : nous vous répondons rapidement pour confirmer la disponibilité. Ce formulaire n'est pas une réservation ferme.",
  contactTitre: "Nous écrire",
  arrivee: "Arrivée",
  depart: "Départ",
  adultes: "Adultes",
  enfants: "Enfants",
  nom: "Nom",
  email: "E-mail",
  telephone: "Téléphone (facultatif)",
  message: "Message",
  messageFacultatif: "Message (facultatif)",
  facultatif: "facultatif",
  gite: "Gîte",
  giteIndifferent: "Pas de préférence",
  envoyer: "Envoyer la demande",
  envoyerMessage: "Envoyer le message",
  champsObligatoires: "Tous les champs sont obligatoires sauf mention contraire.",
  consentement:
    "Vos informations servent uniquement à répondre à votre demande. Voir notre politique de confidentialité.",
  merci: "Merci ! Votre demande a bien été envoyée. Nous vous répondons rapidement.",
  erreurs: {
    general: "La demande n'a pas pu être envoyée. Merci de vérifier le formulaire ou de réessayer.",
    captcha: "La vérification anti-spam a échoué. Merci de réessayer.",
  },
  coordonnees: "Coordonnées",
  tel: "Téléphone",
  deuxPoints: "\u00a0: ",
  adresse: "Adresse",
  acces: "Accès",
  carte: "Carte",
  afficherCarte: "Afficher la carte (OpenStreetMap)",
  carteInfo:
    "La carte est chargée depuis OpenStreetMap uniquement si vous cliquez sur le bouton.",
  voirSurOsm: "Ouvrir dans OpenStreetMap",
  mentionsLegales: "Mentions légales",
  confidentialite: "Confidentialité",
  prix: (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n),
  date: (iso: string) =>
    new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
      .format(new Date(iso))
      .replace(/^1 /, "1er "),
  mois: (annee: number, mois: number) =>
    new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" }).format(Date.UTC(annee, mois, 1)),
};

type Dictionnaire = typeof fr;

const en: Dictionnaire = {
  siteNom: "Domaine de Ganzeville",
  siteSousTitre: "Holiday cottages in Normandy, near Fécamp",
  navAccueil: "Home",
  navGites: "The cottages",
  navContact: "Contact",
  allerAuContenu: "Skip to content",
  filAriane: "Breadcrumb",
  autreLangue: "Français",
  autreLangueCode: "fr",
  menu: "Menu",
  bandeauDemo: "Site under construction: texts, photos and prices are provisional.",
  voirLeGite: "Discover the cottage",
  personnes: (n) => `${n} ${n > 1 ? "guests" : "guest"}`,
  chambres: (n) => `${n} ${n > 1 ? "bedrooms" : "bedroom"}`,
  surface: (n) => `${n} m²`,
  aPartirDe: (p) => `from ${p} / night`,
  lesGites: "Our three cottages",
  leLieu: "The place",
  galerie: "Photos",
  photoSur: (i, n) => `Photo ${i} of ${n}`,
  fermer: "Close",
  precedente: "Previous photo",
  suivante: "Next photo",
  description: "The cottage",
  equipements: "Amenities",
  regles: "Good to know",
  tarifs: "Prices",
  saison: "Season",
  prixNuit: "Price per night",
  sejourMin: "Minimum stay",
  nuits: (n) => `${n} ${n > 1 ? "nights" : "night"}`,
  saisons: { basse: "Low season", moyenne: "Mid season", haute: "High season" },
  periodesSaison: "Mid and high season periods",
  horsPeriodes: "Outside these periods: low season.",
  fraisMenage: (p) => `Cleaning fee: ${p} per stay, paid by the guest.`,
  caution: (p) => `A security deposit of ${p} is required on arrival and returned after check-out inspection.`,
  du: "from",
  au: "to",
  disponibilites: "Availability",
  dispoIndicatives:
    "This calendar is indicative and updated regularly. Availability is confirmed when we reply to your request.",
  libre: "Available",
  occupe: "Booked",
  passe: "Past date",
  moisSuivants: "Show the following months",
  jours: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  joursLongs: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  demandeTitre: "Booking request",
  demandeIntro:
    "Tell us your dates and the number of guests: we will reply quickly to confirm availability. This form is not a confirmed booking.",
  contactTitre: "Write to us",
  arrivee: "Arrival",
  depart: "Departure",
  adultes: "Adults",
  enfants: "Children",
  nom: "Name",
  email: "Email",
  telephone: "Phone (optional)",
  message: "Message",
  messageFacultatif: "Message (optional)",
  facultatif: "optional",
  gite: "Cottage",
  giteIndifferent: "No preference",
  envoyer: "Send request",
  envoyerMessage: "Send message",
  champsObligatoires: "All fields are required unless stated otherwise.",
  consentement: "Your details are only used to reply to your request. See our privacy policy.",
  merci: "Thank you! Your request has been sent. We will reply shortly.",
  erreurs: {
    general: "Your request could not be sent. Please check the form or try again.",
    captcha: "The anti-spam check failed. Please try again.",
  },
  coordonnees: "Contact details",
  tel: "Phone",
  deuxPoints: ": ",
  adresse: "Address",
  acces: "Getting here",
  carte: "Map",
  afficherCarte: "Show the map (OpenStreetMap)",
  carteInfo: "The map is only loaded from OpenStreetMap if you click the button.",
  voirSurOsm: "Open in OpenStreetMap",
  mentionsLegales: "Legal notice",
  confidentialite: "Privacy",
  prix: (n) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n),
  date: (iso) =>
    new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(iso)),
  mois: (annee, mois) =>
    new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(Date.UTC(annee, mois, 1)),
};

const DICTIONNAIRES: Record<Langue, Dictionnaire> = { fr, en };

export function t(lang: Langue): Dictionnaire {
  return DICTIONNAIRES[lang];
}
