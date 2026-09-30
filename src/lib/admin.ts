// Requêtes D1 de l'administration. Les URL iCal ne sortent jamais d'ici en clair :
// l'admin n'en reçoit qu'une version masquée.
import { env } from "cloudflare:workers";
import { SAISONS, type Saison } from "./db";
import type { Langue } from "./i18n";

const db = () => env.DB;

// ——— Tableau de bord ———

export interface SourceEnErreur {
  id: number;
  gite_id: number;
  gite: string;
  libelle: string;
  derniere_erreur: string | null;
  dernier_succes: string | null;
}

export async function tableauDeBord() {
  const [nouvelles, erreurs] = await db().batch([
    db().prepare(`SELECT COUNT(*) AS n FROM demandes WHERE statut = 'nouvelle'`),
    db().prepare(
      `SELECT s.id, s.gite_id, t.nom AS gite, s.libelle, s.derniere_erreur, s.dernier_succes
         FROM calendar_sources s JOIN gites_textes t ON t.gite_id = s.gite_id AND t.langue = 'fr'
        WHERE s.actif = 1 AND s.statut = 'erreur' ORDER BY t.nom`,
    ),
  ]);
  return {
    nouvelles: (nouvelles.results[0] as { n: number }).n,
    erreurs: erreurs.results as SourceEnErreur[],
  };
}

// ——— Demandes ———

export type StatutDemande = "nouvelle" | "traitee" | "archivee";
export const STATUTS_DEMANDE: StatutDemande[] = ["nouvelle", "traitee", "archivee"];

export interface Demande {
  id: number;
  gite_id: number | null;
  gite: string | null;
  arrivee: string | null;
  depart: string | null;
  adultes: number | null;
  enfants: number | null;
  nom: string;
  email: string;
  telephone: string | null;
  message: string;
  langue: Langue;
  statut: StatutDemande;
  email_envoye: number;
  cree_le: string;
}

const SELECT_DEMANDE = `
  SELECT d.*, t.nom AS gite FROM demandes d
    LEFT JOIN gites_textes t ON t.gite_id = d.gite_id AND t.langue = 'fr'`;

export async function listeDemandes(statut: StatutDemande): Promise<Demande[]> {
  const { results } = await db()
    .prepare(`${SELECT_DEMANDE} WHERE d.statut = ? ORDER BY d.cree_le DESC LIMIT 200`)
    .bind(statut)
    .all<Demande>();
  return results;
}

export async function demande(id: number): Promise<Demande | null> {
  return db().prepare(`${SELECT_DEMANDE} WHERE d.id = ?`).bind(id).first<Demande>();
}

export async function changerStatutDemande(id: number, statut: StatutDemande): Promise<void> {
  await db().prepare(`UPDATE demandes SET statut = ? WHERE id = ?`).bind(statut, id).run();
}

export async function supprimerDemande(id: number): Promise<void> {
  await db().prepare(`DELETE FROM demandes WHERE id = ?`).bind(id).run();
}

// ——— Gîtes ———

export interface GiteListe {
  id: number;
  slug: string;
  nom: string;
  publie: number;
  nb_photos: number;
}

export async function listeGites(): Promise<GiteListe[]> {
  const { results } = await db()
    .prepare(
      `SELECT g.id, g.slug, t.nom, g.publie, (SELECT COUNT(*) FROM photos WHERE gite_id = g.id) AS nb_photos
         FROM gites g JOIN gites_textes t ON t.gite_id = g.id AND t.langue = 'fr'
        ORDER BY g.ordre, g.id`,
    )
    .all<GiteListe>();
  return results;
}

export interface TextesGite {
  nom: string;
  accroche: string;
  description: string;
  regles: string;
}

export interface GiteEdition {
  id: number;
  slug: string;
  capacite: number;
  chambres: number;
  surface_m2: number | null;
  equipements: string[];
  frais_menage: number | null;
  caution: number | null;
  ordre: number;
  publie: boolean;
  textes: Record<Langue, TextesGite>;
}

export async function giteEdition(id: number): Promise<GiteEdition | null> {
  const [g, tx] = await db().batch([
    db().prepare(`SELECT * FROM gites WHERE id = ?`).bind(id),
    db().prepare(`SELECT langue, nom, accroche, description, regles FROM gites_textes WHERE gite_id = ?`).bind(id),
  ]);
  const ligne = g.results[0] as (Omit<GiteEdition, "equipements" | "publie" | "textes"> & { equipements: string; publie: number }) | undefined;
  if (!ligne) return null;
  const vide: TextesGite = { nom: "", accroche: "", description: "", regles: "" };
  const textes: Record<Langue, TextesGite> = { fr: { ...vide }, en: { ...vide } };
  for (const t of tx.results as (TextesGite & { langue: Langue })[]) {
    textes[t.langue] = { nom: t.nom, accroche: t.accroche, description: t.description, regles: t.regles };
  }
  let equipements: string[] = [];
  try {
    equipements = JSON.parse(ligne.equipements);
  } catch {
    /* JSON invalide : liste vide */
  }
  return { ...ligne, equipements, publie: ligne.publie === 1, textes };
}

export async function enregistrerGite(g: GiteEdition): Promise<void> {
  const ops = [
    db()
      .prepare(
        `UPDATE gites SET slug = ?, capacite = ?, chambres = ?, surface_m2 = ?, equipements = ?, frais_menage = ?,
                caution = ?, ordre = ?, publie = ?, maj_le = datetime('now') WHERE id = ?`,
      )
      .bind(g.slug, g.capacite, g.chambres, g.surface_m2, JSON.stringify(g.equipements), g.frais_menage, g.caution, g.ordre, g.publie ? 1 : 0, g.id),
  ];
  for (const langue of ["fr", "en"] as const) {
    const t = g.textes[langue];
    ops.push(
      db()
        .prepare(
          `INSERT INTO gites_textes (gite_id, langue, nom, accroche, description, regles) VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT (gite_id, langue) DO UPDATE SET nom = excluded.nom, accroche = excluded.accroche,
             description = excluded.description, regles = excluded.regles`,
        )
        .bind(g.id, langue, t.nom || g.textes.fr.nom, t.accroche, t.description, t.regles),
    );
  }
  await db().batch(ops);
}

export async function slugPris(slug: string, saufId: number): Promise<boolean> {
  return (await db().prepare(`SELECT 1 FROM gites WHERE slug = ? AND id != ?`).bind(slug, saufId).first()) !== null;
}

async function toucherGite(id: number) {
  await db().prepare(`UPDATE gites SET maj_le = datetime('now') WHERE id = ?`).bind(id).run();
}

// ——— Photos ———

export interface PhotoAdmin {
  id: number;
  cle_pleine: string;
  cle_miniature: string;
  largeur_min: number;
  hauteur_min: number;
  alt_fr: string;
  alt_en: string;
  ordre: number;
}

export async function photosGite(giteId: number): Promise<PhotoAdmin[]> {
  const { results } = await db()
    .prepare(
      `SELECT id, cle_pleine, cle_miniature, largeur_min, hauteur_min, alt_fr, alt_en, ordre
         FROM photos WHERE gite_id = ? ORDER BY ordre, id`,
    )
    .bind(giteId)
    .all<PhotoAdmin>();
  return results;
}

export async function ajouterPhoto(p: {
  gite_id: number;
  cle_pleine: string;
  cle_miniature: string;
  largeur: number;
  hauteur: number;
  largeur_min: number;
  hauteur_min: number;
  alt_fr: string;
  alt_en: string;
}): Promise<void> {
  await db()
    .prepare(
      `INSERT INTO photos (gite_id, cle_pleine, cle_miniature, largeur, hauteur, largeur_min, hauteur_min, alt_fr, alt_en, ordre)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, (SELECT COALESCE(MAX(ordre), 0) + 1 FROM photos WHERE gite_id = ?))`,
    )
    .bind(p.gite_id, p.cle_pleine, p.cle_miniature, p.largeur, p.hauteur, p.largeur_min, p.hauteur_min, p.alt_fr, p.alt_en, p.gite_id)
    .run();
  await toucherGite(p.gite_id);
}

export async function majLegendesPhoto(giteId: number, id: number, altFr: string, altEn: string): Promise<void> {
  await db().prepare(`UPDATE photos SET alt_fr = ?, alt_en = ? WHERE id = ? AND gite_id = ?`).bind(altFr, altEn, id, giteId).run();
}

/** Supprime la ligne et renvoie les clés R2 à effacer. */
export async function supprimerPhoto(giteId: number, id: number): Promise<string[]> {
  const p = await db()
    .prepare(`DELETE FROM photos WHERE id = ? AND gite_id = ? RETURNING cle_pleine, cle_miniature`)
    .bind(id, giteId)
    .first<{ cle_pleine: string; cle_miniature: string }>();
  await toucherGite(giteId);
  return p ? [p.cle_pleine, p.cle_miniature].filter((c) => !c.startsWith("placeholder/")) : [];
}

/** Échange la position d'une photo avec sa voisine (sens -1 : vers le début). */
export async function deplacerPhoto(giteId: number, id: number, sens: -1 | 1): Promise<void> {
  const photos = await photosGite(giteId);
  const i = photos.findIndex((p) => p.id === id);
  const j = i + sens;
  if (i < 0 || j < 0 || j >= photos.length) return;
  [photos[i], photos[j]] = [photos[j]!, photos[i]!];
  await db().batch(photos.map((p, k) => db().prepare(`UPDATE photos SET ordre = ? WHERE id = ?`).bind(k + 1, p.id)));
  await toucherGite(giteId);
}

// ——— Saisons et tarifs ———

export interface PeriodeAdmin {
  id: number;
  saison: Saison;
  debut: string;
  fin: string;
}

export async function listePeriodes(): Promise<PeriodeAdmin[]> {
  const { results } = await db().prepare(`SELECT id, saison, debut, fin FROM saisons ORDER BY debut`).all<PeriodeAdmin>();
  return results;
}

export async function ajouterPeriode(saison: Saison, debut: string, fin: string): Promise<void> {
  await db().prepare(`INSERT INTO saisons (saison, debut, fin) VALUES (?, ?, ?)`).bind(saison, debut, fin).run();
}

export async function supprimerPeriode(id: number): Promise<void> {
  await db().prepare(`DELETE FROM saisons WHERE id = ?`).bind(id).run();
}

export interface TarifAdmin {
  gite_id: number;
  saison: Saison;
  prix_nuit: number;
  sejour_min: number;
}

export async function listeTarifs(): Promise<TarifAdmin[]> {
  const { results } = await db().prepare(`SELECT gite_id, saison, prix_nuit, sejour_min FROM tarifs`).all<TarifAdmin>();
  return results;
}

export async function enregistrerTarifs(tarifs: TarifAdmin[]): Promise<void> {
  if (!tarifs.length) return;
  await db().batch(
    tarifs.map((t) =>
      db()
        .prepare(
          `INSERT INTO tarifs (gite_id, saison, prix_nuit, sejour_min) VALUES (?, ?, ?, ?)
           ON CONFLICT (gite_id, saison) DO UPDATE SET prix_nuit = excluded.prix_nuit, sejour_min = excluded.sejour_min`,
        )
        .bind(t.gite_id, t.saison, t.prix_nuit, t.sejour_min),
    ),
  );
}

export function estSaison(v: string): v is Saison {
  return (SAISONS as string[]).includes(v);
}

// ——— Calendriers et blocages ———

export interface SourceAdmin {
  id: number;
  type: "ical" | "channel_manager";
  libelle: string;
  url_masquee: string;
  actif: number;
  statut: "jamais" | "ok" | "erreur";
  derniere_synchro: string | null;
  dernier_succes: string | null;
  derniere_erreur: string | null;
  nb_periodes: number;
}

/** Ne laisse voir que l'hôte : le chemin et la requête contiennent le jeton secret. */
export function masquerUrl(url: string): string {
  try {
    return `${new URL(url).host}/…`;
  } catch {
    return "…";
  }
}

export async function sourcesGite(giteId: number): Promise<SourceAdmin[]> {
  const { results } = await db()
    .prepare(
      `SELECT s.id, s.type, s.libelle, s.url, s.actif, s.statut, s.derniere_synchro, s.dernier_succes, s.derniere_erreur,
              (SELECT COUNT(*) FROM bookings b WHERE b.source_id = s.id) AS nb_periodes
         FROM calendar_sources s WHERE s.gite_id = ? ORDER BY s.libelle`,
    )
    .bind(giteId)
    .all<Omit<SourceAdmin, "url_masquee"> & { url: string }>();
  return results.map(({ url, ...s }) => ({ ...s, url_masquee: masquerUrl(url) }));
}

export async function ajouterSource(giteId: number, libelle: string, url: string): Promise<void> {
  await db()
    .prepare(`INSERT INTO calendar_sources (gite_id, type, libelle, url) VALUES (?, 'ical', ?, ?)`)
    .bind(giteId, libelle, url)
    .run();
}

export async function remplacerUrlSource(giteId: number, id: number, url: string): Promise<void> {
  await db()
    .prepare(`UPDATE calendar_sources SET url = ?, statut = 'jamais', derniere_erreur = NULL WHERE id = ? AND gite_id = ?`)
    .bind(url, id, giteId)
    .run();
}

export async function basculerSource(giteId: number, id: number): Promise<void> {
  await db().prepare(`UPDATE calendar_sources SET actif = 1 - actif WHERE id = ? AND gite_id = ?`).bind(id, giteId).run();
}

export async function supprimerSource(giteId: number, id: number): Promise<void> {
  // Les périodes importées de cette source partent avec elle (ON DELETE CASCADE).
  await db().prepare(`DELETE FROM calendar_sources WHERE id = ? AND gite_id = ?`).bind(id, giteId).run();
}

export interface Blocage {
  id: number;
  debut: string;
  fin: string;
  motif: string;
}

export async function blocagesGite(giteId: number, depuis: string): Promise<Blocage[]> {
  const { results } = await db()
    .prepare(`SELECT id, debut, fin, motif FROM blocages WHERE gite_id = ? AND fin > ? ORDER BY debut`)
    .bind(giteId, depuis)
    .all<Blocage>();
  return results;
}

export async function ajouterBlocage(giteId: number, debut: string, fin: string, motif: string): Promise<void> {
  await db().prepare(`INSERT INTO blocages (gite_id, debut, fin, motif) VALUES (?, ?, ?, ?)`).bind(giteId, debut, fin, motif).run();
}

export async function supprimerBlocage(giteId: number, id: number): Promise<void> {
  await db().prepare(`DELETE FROM blocages WHERE id = ? AND gite_id = ?`).bind(id, giteId).run();
}

// ——— Textes et réglages ———

export async function tousLesTextes(): Promise<Record<string, Record<Langue, string>>> {
  const { results } = await db().prepare(`SELECT cle, langue, valeur FROM textes`).all<{ cle: string; langue: Langue; valeur: string }>();
  const r: Record<string, Record<Langue, string>> = {};
  for (const t of results) (r[t.cle] ??= { fr: "", en: "" })[t.langue] = t.valeur;
  return r;
}

export async function enregistrerTextes(valeurs: { cle: string; langue: Langue; valeur: string }[]): Promise<void> {
  if (!valeurs.length) return;
  await db().batch(
    valeurs.map((v) =>
      db()
        .prepare(`INSERT INTO textes (cle, langue, valeur) VALUES (?, ?, ?) ON CONFLICT (cle, langue) DO UPDATE SET valeur = excluded.valeur`)
        .bind(v.cle, v.langue, v.valeur),
    ),
  );
}

export async function enregistrerParametres(valeurs: Record<string, string>): Promise<void> {
  await db().batch(
    Object.entries(valeurs).map(([cle, valeur]) =>
      db()
        .prepare(`INSERT INTO parametres (cle, valeur) VALUES (?, ?) ON CONFLICT (cle) DO UPDATE SET valeur = excluded.valeur`)
        .bind(cle, valeur),
    ),
  );
}
