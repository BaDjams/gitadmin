// Mise en forme des dates et libellés dans l'admin.
import type { StatutDemande } from "./admin";
import { nbNuits } from "./dates";

export const LIBELLES_STATUT: Record<StatutDemande, string> = {
  nouvelle: "Nouvelles",
  traitee: "Traitées",
  archivee: "Archivées",
};

const fmtDate = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const fmtDateHeure = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Paris" });

export function dateCourte(iso: string): string {
  return fmtDate.format(new Date(`${iso}T00:00:00Z`));
}

/** Horodatage SQLite (UTC, « AAAA-MM-JJ HH:MM:SS ») affiché à l'heure de Paris. */
export function dateHeure(sqlite: string | null): string {
  return sqlite ? fmtDateHeure.format(new Date(`${sqlite.replace(" ", "T")}Z`)) : "jamais";
}

export function periode(arrivee: string, depart: string | null): string {
  if (!depart) return dateCourte(arrivee);
  const n = nbNuits(arrivee, depart);
  return `${dateCourte(arrivee)} → ${dateCourte(depart)} (${n} nuit${n > 1 ? "s" : ""})`;
}
