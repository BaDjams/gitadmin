// Informations géographiques communes (SEO local, carte).
// [À REMPLACER] Coordonnées approximatives du centre du village : mettre celles de la propriété.
export const LIEU = {
  commune: "Ganzeville",
  codePostal: "76400",
  departement: "Seine-Maritime",
  region: "Normandie",
  pays: "FR",
  latitude: 49.7335,
  longitude: 0.4158,
} as const;

export const ADRESSE_SCHEMA = {
  "@type": "PostalAddress",
  addressLocality: LIEU.commune,
  postalCode: LIEU.codePostal,
  addressRegion: LIEU.region,
  addressCountry: LIEU.pays,
};

export const GEO_SCHEMA = {
  "@type": "GeoCoordinates",
  latitude: LIEU.latitude,
  longitude: LIEU.longitude,
};
