import type { Options } from 'browser-image-compression';

const COMPRESSION_OPTIONS: Options = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/webp',
};

const SKIP_COMPRESSION_TYPES = new Set(['image/gif', 'image/svg+xml']);

export const compressImages = async (files: File[]): Promise<File[]> => {
  if (files.length === 0) return [];

  const shouldCompressAny = files.some(
    (file) => !SKIP_COMPRESSION_TYPES.has(file.type),
  );

  // GIF나 SVG처럼 압축이 필요 없는 파일만 있다면 dynamic import조차 수행하지 않음!
  if (!shouldCompressAny) {
    return files;
  }

  const { default: imageCompression } =
    await import('browser-image-compression');

  return Promise.all(
    files.map(async (file) => {
      if (SKIP_COMPRESSION_TYPES.has(file.type)) {
        return file;
      }
      try {
        return await imageCompression(file, COMPRESSION_OPTIONS);
      } catch {
        return file;
      }
    }),
  );
};
