// Lecture défensive des champs de formulaire.

export function texte(f: FormData, nom: string, max: number): string {
  const v = f.get(nom);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/** Texte multiligne : conserve les retours à la ligne, normalise les fins de ligne. */
export function texteLong(f: FormData, nom: string, max: number): string {
  return texte(f, nom, max).replace(/\r\n?/g, "\n");
}

export function entier(f: FormData, nom: string, min: number, max: number): number | null {
  const s = texte(f, nom, 12);
  if (!s) return null;
  const v = Number(s);
  return Number.isInteger(v) && v >= min && v <= max ? v : null;
}

export function coche(f: FormData, nom: string): boolean {
  return f.get(nom) === "on" || f.get(nom) === "1";
}

export const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;
