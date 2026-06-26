import { db } from '../db';
import { setObjectUrl } from './objectUrlCache';

const MAX_DIMENSION = 1280;
const WEBP_QUALITY = 0.8;

export function processImageFile(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { naturalWidth: w, naturalHeight: h } = img;
      if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
        const scale = Math.min(MAX_DIMENSION / w, MAX_DIMENSION / h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);

      canvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error('canvas.toBlob failed')),
        'image/webp',
        WEBP_QUALITY,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Image load failed'));
    };

    img.src = objectUrl;
  });
}

export async function saveFilesToLocalDB(
  files: File[],
): Promise<Array<{ id: string; previewUrl: string }>> {
  return Promise.all(
    files.map(async (file) => {
      const blob = await processImageFile(file);
      const id = crypto.randomUUID();

      await db.images.add({
        id,
        blob,
        mime_type: 'image/webp',
        created_at: new Date().toISOString(),
      });

      const previewUrl = URL.createObjectURL(blob);
      setObjectUrl(id, previewUrl);

      return { id, previewUrl };
    }),
  );
}
