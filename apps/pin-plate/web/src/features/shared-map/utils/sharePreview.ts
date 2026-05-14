import { getTrustedImageUrl } from '@/features/image/utils/imageReference';

interface SharePreviewInput {
  title: string;
  description: string;
  placeCount: number;
  coverImageUrl: string | null;
}

interface SharePreview {
  title: string;
  description: string;
  imageUrl: string;
}

const SITE_URL_FALLBACK =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://pinonplate.com';
const DEFAULT_OG_IMAGE_PATH = '/og-default.png';
const IMAGE_HEAD_TIMEOUT_MS = 1500;
export const SHARE_PREVIEW_SITE_NAME = 'Pin Plate';

const getSiteOrigin = (): string => {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configuredSiteUrl) return SITE_URL_FALLBACK;

  return configuredSiteUrl.replace(/\/+$/g, '');
};

const toAbsoluteUrl = (url: string): string =>
  new URL(url, getSiteOrigin()).toString();

export const buildSharePreviewUrl = (slug: string): string =>
  toAbsoluteUrl(`/share/${slug}`);

const getDefaultOgImageUrl = (): string => toAbsoluteUrl(DEFAULT_OG_IMAGE_PATH);

const isImageResponse = (response: Response): boolean => {
  const contentType = response.headers.get('content-type');

  return !contentType || contentType.startsWith('image/');
};

export const resolveSharePreviewImageUrl = async (
  coverImageUrl: string | null,
): Promise<string> => {
  if (!coverImageUrl) {
    return getDefaultOgImageUrl();
  }

  const imageUrl = getTrustedImageUrl(toAbsoluteUrl(coverImageUrl));

  if (!imageUrl) {
    return getDefaultOgImageUrl();
  }

  const abortController = new AbortController();
  const timeoutId = setTimeout(
    () => abortController.abort(),
    IMAGE_HEAD_TIMEOUT_MS,
  );

  try {
    const response = await fetch(imageUrl, {
      method: 'HEAD',
      signal: abortController.signal,
    });

    if (response.ok && isImageResponse(response)) {
      return imageUrl;
    }
  } catch {
    return getDefaultOgImageUrl();
  } finally {
    clearTimeout(timeoutId);
  }

  return getDefaultOgImageUrl();
};

export const buildSharePreview = ({
  title,
  description,
  placeCount,
  coverImageUrl,
}: SharePreviewInput): SharePreview => ({
  title: `${title} | ${SHARE_PREVIEW_SITE_NAME}`,
  description:
    description.trim() ||
    `추천 장소 ${placeCount}곳을 지도와 리스트로 확인해 보세요.`,
  imageUrl: toAbsoluteUrl(coverImageUrl ?? DEFAULT_OG_IMAGE_PATH),
});
