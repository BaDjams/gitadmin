// Préparation des photos dans le navigateur, avant envoi :
// redimensionnement (1600 px et 400 px de large au plus), filigrane optionnel,
// encodage WebP (JPEG si le navigateur ne sait pas encoder le WebP, ex. Safari).
// Le réencodage par canvas supprime aussi les métadonnées (GPS, appareil).

const LARGEUR_PLEINE = 1600;
const LARGEUR_MINIATURE = 400;
const QUALITE = 0.82;

export interface PhotoPreparee {
  pleine: Blob;
  miniature: Blob;
  largeur: number;
  hauteur: number;
  largeurMin: number;
  hauteurMin: number;
}

function dessiner(source: ImageBitmap, largeurMax: number): HTMLCanvasElement {
  const echelle = Math.min(1, largeurMax / source.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(source.width * echelle);
  canvas.height = Math.round(source.height * echelle);
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/** Filigrane léger en bas à droite : texte blanc semi-transparent, ombre discrète. */
function filigraner(canvas: HTMLCanvasElement, texte: string) {
  const ctx = canvas.getContext("2d")!;
  const taille = Math.max(12, Math.round(canvas.width / 45));
  ctx.font = `600 ${taille}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = taille / 4;
  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  const marge = Math.round(taille * 0.9);
  ctx.fillText(texte, canvas.width - marge, canvas.height - marge);
}

function encoder(canvas: HTMLCanvasElement): Promise<Blob> {
  const essai = (type: string) =>
    new Promise<Blob | null>((ok) => canvas.toBlob(ok, type, QUALITE));
  return essai("image/webp").then(async (blob) => {
    if (blob && blob.type === "image/webp") return blob;
    const jpeg = await essai("image/jpeg");
    if (!jpeg) throw new Error("Encodage impossible");
    return jpeg;
  });
}

export async function preparerPhoto(fichier: File, filigrane: string): Promise<PhotoPreparee> {
  // L'orientation EXIF (photos de téléphone) est appliquée au décodage.
  const source = await createImageBitmap(fichier, { imageOrientation: "from-image" });
  try {
    const pleine = dessiner(source, LARGEUR_PLEINE);
    if (filigrane) filigraner(pleine, filigrane);
    const miniature = dessiner(source, LARGEUR_MINIATURE);
    return {
      pleine: await encoder(pleine),
      miniature: await encoder(miniature),
      largeur: pleine.width,
      hauteur: pleine.height,
      largeurMin: miniature.width,
      hauteurMin: miniature.height,
    };
  } finally {
    source.close();
  }
}
