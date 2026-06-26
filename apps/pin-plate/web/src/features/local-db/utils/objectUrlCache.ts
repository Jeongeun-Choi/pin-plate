import { db } from '../db';

const urlCache = new Map<string, string>();

export async function getObjectUrl(imageId: string): Promise<string | null> {
  const cached = urlCache.get(imageId);
  if (cached) return cached;

  const image = await db.images.get(imageId);
  if (!image) return null;

  const url = URL.createObjectURL(image.blob);
  urlCache.set(imageId, url);
  return url;
}

export function setObjectUrl(imageId: string, url: string): void {
  urlCache.set(imageId, url);
}

export function clearObjectUrlCache(): void {
  urlCache.forEach((url) => URL.revokeObjectURL(url));
  urlCache.clear();
}
