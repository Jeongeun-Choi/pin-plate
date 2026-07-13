const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.png', '.webp', '.gif'];
const DEFAULT_IMAGE_PUBLIC_BASE_URL = 'https://pinonplate.com';

const getS3ImageBaseUrls = (): string[] => {
  const bucketName = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME?.trim();
  const region = process.env.NEXT_PUBLIC_AWS_REGION?.trim();

  if (!bucketName || !region) {
    return [];
  }

  return [
    `https://${bucketName}.s3.dualstack.${region}.amazonaws.com`,
    `https://${bucketName}.s3.${region}.amazonaws.com`,
  ];
};

const getImagePublicBaseUrl = (): string => {
  const configuredImageBaseUrl = process.env.IMAGE_PUBLIC_BASE_URL?.trim();

  if (configuredImageBaseUrl) {
    return configuredImageBaseUrl.replace(/\/+$/g, '');
  }

  const [s3DualStackBaseUrl] = getS3ImageBaseUrls();

  if (s3DualStackBaseUrl) {
    return s3DualStackBaseUrl;
  }

  return DEFAULT_IMAGE_PUBLIC_BASE_URL;
};

const getTrustedImageBaseUrls = (): string[] => [
  getImagePublicBaseUrl(),
  ...getS3ImageBaseUrls(),
];

const hasAllowedImageExtension = (imageKey: string): boolean =>
  ALLOWED_IMAGE_EXTENSIONS.some((extension) =>
    imageKey.toLowerCase().endsWith(extension),
  );

export const isTrustedImageKey = (imageKey: string): boolean =>
  !imageKey.includes('://') &&
  !imageKey.startsWith('/') &&
  !imageKey.includes('..') &&
  imageKey.startsWith('uploads/') &&
  hasAllowedImageExtension(imageKey);

export const isTrustedUserImageKey = (
  imageKey: string,
  userId: string,
): boolean =>
  isTrustedImageKey(imageKey) &&
  imageKey.startsWith(`uploads/users/${userId}/`);

export const buildPublicImageUrl = (imageKey: string): string =>
  new URL(imageKey, `${getImagePublicBaseUrl()}/`).toString();

export const getTrustedImageKeyFromUrl = (
  imageUrl: string | null,
): string | null => {
  if (!imageUrl) return null;

  try {
    const parsedImageUrl = new URL(imageUrl);
    const trustedImageOrigins = getTrustedImageBaseUrls().map(
      (imageBaseUrl) => new URL(imageBaseUrl).origin,
    );

    if (
      parsedImageUrl.protocol !== 'https:' ||
      !trustedImageOrigins.includes(parsedImageUrl.origin)
    ) {
      return null;
    }

    const imageKey = parsedImageUrl.pathname.replace(/^\/+/, '');

    return isTrustedImageKey(imageKey) ? imageKey : null;
  } catch {
    return null;
  }
};

export const getTrustedImageUrl = (imageUrl: string | null): string | null => {
  const trustedImageKey = getTrustedImageKeyFromUrl(imageUrl);

  return trustedImageKey ? buildPublicImageUrl(trustedImageKey) : null;
};
