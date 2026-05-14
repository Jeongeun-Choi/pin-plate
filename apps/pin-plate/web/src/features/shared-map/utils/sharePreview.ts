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

const SITE_URL_FALLBACK = 'http://localhost:3000';
const DEFAULT_OG_IMAGE_PATH = '/og-default.png';

const getSiteOrigin = (): string => {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configuredSiteUrl) return SITE_URL_FALLBACK;

  return configuredSiteUrl.replace(/\/+$/g, '');
};

const toAbsoluteUrl = (url: string): string =>
  new URL(url, getSiteOrigin()).toString();

export const buildSharePreview = ({
  title,
  description,
  placeCount,
  coverImageUrl,
}: SharePreviewInput): SharePreview => ({
  title: `${title} | Pin Plate`,
  description:
    description.trim() ||
    `추천 장소 ${placeCount}곳을 지도와 리스트로 확인해 보세요.`,
  imageUrl: toAbsoluteUrl(coverImageUrl ?? DEFAULT_OG_IMAGE_PATH),
});
