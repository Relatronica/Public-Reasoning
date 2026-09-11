import type { Area } from 'react-easy-crop';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (e) => reject(e));
    img.crossOrigin = 'anonymous';
    img.src = src;
  });
}

/** Esporta il ritaglio come WebP (fallback JPEG). */
export async function getCroppedImageBlob(
  imageSrc: string,
  crop: Area,
  options?: { maxEdge?: number; quality?: number; mimeType?: string }
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const maxEdge = options?.maxEdge ?? 1600;
  const quality = options?.quality ?? 0.82;
  const mimeType = options?.mimeType ?? 'image/webp';

  let { width, height } = crop;
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  width = Math.round(width * scale);
  height = Math.round(height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas non disponibile');

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    width,
    height
  );

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), mimeType, quality);
  });

  if (blob) return blob;

  // Safari / ambienti senza WebP
  const jpeg = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/jpeg', quality);
  });
  if (!jpeg) throw new Error('Esportazione immagine fallita');
  return jpeg;
}
