import { ajouterJours, ajouterMois } from "./dates";
import type { Occupation } from "./db";

export type EtatJour = "libre" | "occupe" | "passe";

export interface Jour {
  date: string;
  jour: number;
  etat: EtatJour;
}

export interface Mois {
  annee: number;
  mois: number; // 0-11
  /** Nombre de cases vides avant le 1er (semaine commençant le lundi). */
  decalage: number;
  jours: Jour[];
}

/**
 * Construit la grille des `nbMois` mois à partir du mois de `aujourdhui`.
 * Une date est « occupée » si la nuit qui commence ce jour-là l'est sur au moins
 * une source. Le jour de départ (DTEND exclusif) reste donc libre pour une arrivée.
 */
export function construireCalendrier(aujourdhui: string, occupations: Occupation[], nbMois = 12): Mois[] {
  const nuitsOccupees = new Set<string>();
  for (const o of occupations) {
    for (let d = o.arrivee; d < o.depart; d = ajouterJours(d, 1)) nuitsOccupees.add(d);
  }

  const premier = `${aujourdhui.slice(0, 7)}-01`;
  const resultat: Mois[] = [];
  for (let i = 0; i < nbMois; i++) {
    const debut = ajouterMois(premier, i);
    const d0 = new Date(`${debut}T00:00:00Z`);
    const annee = d0.getUTCFullYear();
    const mois = d0.getUTCMonth();
    const nbJours = new Date(Date.UTC(annee, mois + 1, 0)).getUTCDate();
    const jours: Jour[] = [];
    for (let j = 1; j <= nbJours; j++) {
      const date = `${debut.slice(0, 8)}${String(j).padStart(2, "0")}`;
      const etat: EtatJour = date < aujourdhui ? "passe" : nuitsOccupees.has(date) ? "occupe" : "libre";
      jours.push({ date, jour: j, etat });
    }
    resultat.push({ annee, mois, decalage: (d0.getUTCDay() + 6) % 7, jours });
  }
  return resultat;
}
