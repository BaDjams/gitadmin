// Accès en lecture/écriture à D1. Les pages ne lisent que D1 : jamais les plateformes.
import { env } from "cloudflare:workers";
import type { Langue } from "./i18n";

export type Saison = "basse" | "moyenne" | "haute";
export const SAISONS: Saison[] = ["basse", "moyenne", "haute"];

export interface Photo {
  id: number;
  cle_pleine: string;
  cle_miniature: string;
  largeur: number;
  hauteur: number;
  largeur_min: number;
  hauteur_min: number;
  alt: string;
}

export interface Tarif {
  saison: Saison;
  prix_nuit: number;
  sejour_min: number;
}

export interface GiteResume {
  id: number;
  slug: string;
  nom: string;
  accroche: string;
  capacite: number;
  chambres: number;
  surface_m2: number | null;
  prix_min: number | null;
  photo: Photo | null;
}

export interface Gite extends GiteResume {
  description: string;
  regles: string;
  equipements: string[];
  frais_menage: number | null;
  caution: number | null;
  photos: Photo[];
  tarifs: Tarif[];
}

export interface PeriodeSaison {
  saison: Saison;
  debut: string;
  fin: string;
}

export interface Occupation {
  arrivee: string;
  depart: string; // exclusif
}

// Les textes anglais manquants retombent sur le français.
const TEXTES_GITE = `
  COALESCE(tl.nom, tf.nom) AS nom,
  COALESCE(NULLIF(tl.accroche, ''), tf.accroche) AS accroche`;

const JOINTURE_TEXTES = `
  JOIN gites_textes tf ON tf.gite_id = g.id AND tf.langue = 'fr'
  LEFT JOIN gites_textes tl ON tl.gite_id = g.id AND tl.langue = ?1`;

const COLONNES_PHOTO = (lang: Langue) =>
  `id, cle_pleine, cle_miniature, largeur, hauteur, largeur_min, hauteur_min,
   ${lang === "en" ? "COALESCE(NULLIF(alt_en, ''), alt_fr)" : "alt_fr"} AS alt`;

export async function listerGites(lang: Langue): Promise<GiteResume[]> {
  const { results } = await env.DB.prepare(
    `SELECT g.id, g.slug, g.capacite, g.chambres, g.surface_m2, ${TEXTES_GITE},
            (SELECT MIN(prix_nuit) FROM tarifs WHERE gite_id = g.id) AS prix_min
       FROM gites g ${JOINTURE_TEXTES}
      WHERE g.publie = 1
      ORDER BY g.ordre, g.id`,
  )
    .bind(lang)
    .all<Omit<GiteResume, "photo">>();

  const { results: photos } = await env.DB.prepare(
    `SELECT gite_id, ${COLONNES_PHOTO(lang)} FROM photos p
      WHERE ordre = (SELECT MIN(ordre) FROM photos WHERE gite_id = p.gite_id)`,
  ).all<Photo & { gite_id: number }>();
  const parGite = new Map(photos.map((p) => [p.gite_id, p]));

  return results.map((g) => ({ ...g, photo: parGite.get(g.id) ?? null }));
}

export async function giteParSlug(slug: string, lang: Langue): Promise<Gite | null> {
  const g = await env.DB.prepare(
    `SELECT g.id, g.slug, g.capacite, g.chambres, g.surface_m2, g.equipements,
            g.frais_menage, g.caution, ${TEXTES_GITE},
            COALESCE(NULLIF(tl.description, ''), tf.description) AS description,
            COALESCE(NULLIF(tl.regles, ''), tf.regles) AS regles
       FROM gites g ${JOINTURE_TEXTES}
      WHERE g.slug = ?2 AND g.publie = 1`,
  )
    .bind(lang, slug)
    .first<Omit<Gite, "equipements" | "photos" | "tarifs" | "prix_min" | "photo"> & { equipements: string }>();
  if (!g) return null;

  const [photos, tarifs] = await env.DB.batch([
    env.DB.prepare(`SELECT ${COLONNES_PHOTO(lang)} FROM photos WHERE gite_id = ? ORDER BY ordre, id`).bind(g.id),
    env.DB.prepare(
      `SELECT saison, prix_nuit, sejour_min FROM tarifs WHERE gite_id = ?
        ORDER BY CASE saison WHEN 'basse' THEN 1 WHEN 'moyenne' THEN 2 ELSE 3 END`,
    ).bind(g.id),
  ]);
  const listePhotos = photos.results as Photo[];
  const listeTarifs = tarifs.results as Tarif[];

  return {
    ...g,
    equipements: parseListe(g.equipements),
    photos: listePhotos,
    photo: listePhotos[0] ?? null,
    tarifs: listeTarifs,
    prix_min: listeTarifs.length ? Math.min(...listeTarifs.map((t) => t.prix_nuit)) : null,
  };
}

/** Périodes de saison qui se terminent aujourd'hui ou plus tard. */
export async function periodesSaison(depuis: string): Promise<PeriodeSaison[]> {
  const { results } = await env.DB.prepare(
    `SELECT saison, debut, fin FROM saisons WHERE fin >= ? ORDER BY debut`,
  )
    .bind(depuis)
    .all<PeriodeSaison>();
  return results;
}

/**
 * Périodes occupées d'un gîte qui recoupent [debut, fin[ : toutes sources de
 * calendrier actives confondues, plus les blocages saisis dans l'admin.
 */
export async function occupations(giteId: number, debut: string, fin: string): Promise<Occupation[]> {
  const { results } = await env.DB.prepare(
    `SELECT b.arrivee, b.depart FROM bookings b
       JOIN calendar_sources s ON s.id = b.source_id AND s.actif = 1
      WHERE b.gite_id = ?1 AND b.depart > ?2 AND b.arrivee < ?3
     UNION ALL
     SELECT debut, fin FROM blocages
      WHERE gite_id = ?1 AND fin > ?2 AND debut < ?3
      ORDER BY 1`,
  )
    .bind(giteId, debut, fin)
    .all<Occupation>();
  return results;
}

/** Textes éditables d'une langue, avec repli sur le français. */
export async function textes(lang: Langue): Promise<Record<string, string>> {
  const { results } = await env.DB.prepare(
    `SELECT cle, valeur, langue FROM textes WHERE langue IN ('fr', ?) ORDER BY langue = ?`,
  )
    .bind(lang, lang)
    .all<{ cle: string; valeur: string }>();
  // Tri : le français d'abord, la langue demandée écrase ensuite.
  const r: Record<string, string> = {};
  for (const { cle, valeur } of results) if (valeur.trim()) r[cle] = valeur;
  return r;
}

export async function parametres(): Promise<Record<string, string>> {
  const { results } = await env.DB.prepare(`SELECT cle, valeur FROM parametres`).all<{ cle: string; valeur: string }>();
  return Object.fromEntries(results.map((p) => [p.cle, p.valeur]));
}

export async function slugsPublies(): Promise<{ slug: string; maj_le: string }[]> {
  const { results } = await env.DB.prepare(
    `SELECT slug, maj_le FROM gites WHERE publie = 1 ORDER BY ordre, id`,
  ).all<{ slug: string; maj_le: string }>();
  return results;
}

export interface NouvelleDemande {
  gite_id: number | null;
  arrivee: string | null;
  depart: string | null;
  adultes: number | null;
  enfants: number | null;
  nom: string;
  email: string;
  telephone: string | null;
  message: string;
  langue: Langue;
}

export async function enregistrerDemande(d: NouvelleDemande): Promise<number> {
  const r = await env.DB.prepare(
    `INSERT INTO demandes (gite_id, arrivee, depart, adultes, enfants, nom, email, telephone, message, langue)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
  )
    .bind(d.gite_id, d.arrivee, d.depart, d.adultes, d.enfants, d.nom, d.email, d.telephone, d.message, d.langue)
    .first<{ id: number }>();
  return r!.id;
}

export async function marquerEmailEnvoye(id: number): Promise<void> {
  await env.DB.prepare(`UPDATE demandes SET email_envoye = 1 WHERE id = ?`).bind(id).run();
}

export async function nomGite(id: number): Promise<{ nom: string; slug: string } | null> {
  return env.DB.prepare(
    `SELECT t.nom, g.slug FROM gites g JOIN gites_textes t ON t.gite_id = g.id AND t.langue = 'fr' WHERE g.id = ?`,
  )
    .bind(id)
    .first<{ nom: string; slug: string }>();
}

function parseListe(json: string): string[] {
  try {
    const v: unknown = JSON.parse(json);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}
