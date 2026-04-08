import imageCompression from 'browser-image-compression';

const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

const SKIP_COMPRESSION_TYPES = new Set(['image/gif', 'image/svg+xml']);

export const compressImages = (files: File[]): Promise<File[]> =>
  Promise.all(
    files.map(async (file) => {
      if (SKIP_COMPRESSION_TYPES.has(file.type)) return file;
      try {
        return await imageCompression(file, COMPRESSION_OPTIONS);
      } catch {
        return file;
      }
    }),
  );
