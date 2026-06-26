import { db } from '../db';

interface PresignedUploadItem {
  url: string;
  fields: Record<string, string>;
  publicUrl: string;
  imageKey: string;
}

interface UploadedImageResult {
  url: string;
  key: string;
}

export async function uploadLocalImagesToS3(
  imageIds: string[],
): Promise<UploadedImageResult[]> {
  if (imageIds.length === 0) return [];

  const images = await Promise.all(imageIds.map((id) => db.images.get(id)));
  const validImages = images.filter(
    (img): img is NonNullable<typeof img> => img !== undefined,
  );

  if (validImages.length === 0) return [];

  const presignedRes = await fetch('/api/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      files: validImages.map((_, i) => ({
        filename: `local-image-${i}.webp`,
        type: 'image/webp',
      })),
    }),
  });

  if (!presignedRes.ok) throw new Error('Failed to get presigned URLs');

  const { urls } = (await presignedRes.json()) as {
    urls: PresignedUploadItem[];
  };

  return Promise.all(
    urls.map(async (item, i) => {
      const formData = new FormData();
      Object.entries(item.fields).forEach(([k, v]) => formData.append(k, v));
      formData.append(
        'file',
        new File([validImages[i].blob], 'image.webp', { type: 'image/webp' }),
      );

      const s3Res = await fetch(item.url, { method: 'POST', body: formData });
      if (!s3Res.ok) throw new Error(`S3 upload failed: ${s3Res.status}`);

      return { url: item.publicUrl, key: item.imageKey };
    }),
  );
}
