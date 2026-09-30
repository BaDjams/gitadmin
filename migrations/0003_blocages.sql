-- Dates bloquées à la main depuis l'admin (famille, travaux…).
-- Même convention que `bookings` : `fin` est exclusif (premier jour de nouveau libre).
CREATE TABLE blocages (
  id       INTEGER PRIMARY KEY,
  gite_id  INTEGER NOT NULL REFERENCES gites(id) ON DELETE CASCADE,
  debut    TEXT    NOT NULL,
  fin      TEXT    NOT NULL,
  motif    TEXT    NOT NULL DEFAULT '',  -- visible uniquement dans l'admin
  cree_le  TEXT    NOT NULL DEFAULT (datetime('now')),
  CHECK (fin > debut)
);
CREATE INDEX blocages_gite ON blocages (gite_id, debut);
