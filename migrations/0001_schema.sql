-- Schéma initial du site des gîtes de Ganzeville.
-- Montants en euros entiers. Dates au format ISO AAAA-MM-JJ.

PRAGMA foreign_keys = ON;

-- Un gîte : données non traduisibles.
CREATE TABLE gites (
  id            INTEGER PRIMARY KEY,
  slug          TEXT    NOT NULL UNIQUE,
  capacite      INTEGER NOT NULL,          -- nombre de voyageurs
  chambres      INTEGER NOT NULL,
  surface_m2    INTEGER,
  equipements   TEXT    NOT NULL DEFAULT '[]', -- JSON : clés du catalogue (src/lib/equipements.ts)
  frais_menage  INTEGER,                   -- à la charge du locataire, par séjour
  caution       INTEGER,                   -- dépôt de garantie
  ordre         INTEGER NOT NULL DEFAULT 0,
  publie        INTEGER NOT NULL DEFAULT 1,
  maj_le        TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Textes d'un gîte, par langue.
CREATE TABLE gites_textes (
  gite_id     INTEGER NOT NULL REFERENCES gites(id) ON DELETE CASCADE,
  langue      TEXT    NOT NULL CHECK (langue IN ('fr', 'en')),
  nom         TEXT    NOT NULL,
  accroche    TEXT    NOT NULL DEFAULT '',
  description TEXT    NOT NULL DEFAULT '',  -- paragraphes séparés par une ligne vide
  regles      TEXT    NOT NULL DEFAULT '',
  PRIMARY KEY (gite_id, langue)
);

-- Photos : deux versions WebP dans R2 (pleine ≤ 1600 px, miniature ≈ 400 px).
CREATE TABLE photos (
  id              INTEGER PRIMARY KEY,
  gite_id         INTEGER NOT NULL REFERENCES gites(id) ON DELETE CASCADE,
  cle_pleine      TEXT    NOT NULL,
  cle_miniature   TEXT    NOT NULL,
  largeur         INTEGER NOT NULL,
  hauteur         INTEGER NOT NULL,
  largeur_min     INTEGER NOT NULL,
  hauteur_min     INTEGER NOT NULL,
  alt_fr          TEXT    NOT NULL CHECK (length(trim(alt_fr)) > 0), -- texte alternatif obligatoire
  alt_en          TEXT    NOT NULL DEFAULT '',
  ordre           INTEGER NOT NULL DEFAULT 0,
  cree_le         TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX photos_gite ON photos (gite_id, ordre);

-- Périodes de saison, communes aux trois gîtes. Hors période : basse saison.
CREATE TABLE saisons (
  id      INTEGER PRIMARY KEY,
  saison  TEXT NOT NULL CHECK (saison IN ('basse', 'moyenne', 'haute')),
  debut   TEXT NOT NULL,  -- inclus
  fin     TEXT NOT NULL,  -- inclus
  CHECK (fin >= debut)
);

-- Tarifs par gîte et par saison.
CREATE TABLE tarifs (
  gite_id     INTEGER NOT NULL REFERENCES gites(id) ON DELETE CASCADE,
  saison      TEXT    NOT NULL CHECK (saison IN ('basse', 'moyenne', 'haute')),
  prix_nuit   INTEGER NOT NULL,
  sejour_min  INTEGER NOT NULL DEFAULT 1, -- en nuits
  PRIMARY KEY (gite_id, saison)
);

-- Sources de disponibilités. L'URL iCal contient un jeton secret :
-- elle n'est jamais renvoyée au navigateur (l'admin n'en affiche qu'un extrait masqué).
CREATE TABLE calendar_sources (
  id              INTEGER PRIMARY KEY,
  gite_id         INTEGER NOT NULL REFERENCES gites(id) ON DELETE CASCADE,
  type            TEXT    NOT NULL CHECK (type IN ('ical', 'channel_manager')),
  libelle         TEXT    NOT NULL,        -- ex. « Airbnb », « Booking.com »
  url             TEXT    NOT NULL,        -- URL iCal ou identifiant côté channel manager
  actif           INTEGER NOT NULL DEFAULT 1,
  derniere_synchro TEXT,                   -- dernière tentative
  dernier_succes  TEXT,
  statut          TEXT    NOT NULL DEFAULT 'jamais' CHECK (statut IN ('jamais', 'ok', 'erreur')),
  derniere_erreur TEXT
);

-- Périodes occupées, reconstruites source par source à chaque synchro réussie.
-- En cas d'échec, les lignes de la source sont conservées (dernière version valide).
CREATE TABLE bookings (
  id        INTEGER PRIMARY KEY,
  gite_id   INTEGER NOT NULL REFERENCES gites(id) ON DELETE CASCADE,
  source_id INTEGER NOT NULL REFERENCES calendar_sources(id) ON DELETE CASCADE,
  arrivee   TEXT    NOT NULL,  -- première nuit occupée
  depart    TEXT    NOT NULL,  -- exclusif (DTEND iCal) : jour libre pour une nouvelle arrivée
  CHECK (depart > arrivee)
);
CREATE INDEX bookings_gite ON bookings (gite_id, arrivee);

-- Demandes de séjour et messages de contact.
CREATE TABLE demandes (
  id         INTEGER PRIMARY KEY,
  gite_id    INTEGER REFERENCES gites(id) ON DELETE SET NULL, -- NULL : message de contact général
  arrivee    TEXT,
  depart     TEXT,
  adultes    INTEGER,
  enfants    INTEGER,
  nom        TEXT    NOT NULL,
  email      TEXT    NOT NULL,
  telephone  TEXT,
  message    TEXT    NOT NULL DEFAULT '',
  langue     TEXT    NOT NULL DEFAULT 'fr',
  statut     TEXT    NOT NULL DEFAULT 'nouvelle' CHECK (statut IN ('nouvelle', 'traitee', 'archivee')),
  email_envoye INTEGER NOT NULL DEFAULT 0,
  cree_le    TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX demandes_date ON demandes (cree_le);

-- Textes éditables du site (accueil, contact, mentions…), par langue.
CREATE TABLE textes (
  cle     TEXT NOT NULL,
  langue  TEXT NOT NULL CHECK (langue IN ('fr', 'en')),
  valeur  TEXT NOT NULL,
  PRIMARY KEY (cle, langue)
);

-- Réglages simples (clé / valeur).
CREATE TABLE parametres (
  cle     TEXT PRIMARY KEY,
  valeur  TEXT NOT NULL
);
