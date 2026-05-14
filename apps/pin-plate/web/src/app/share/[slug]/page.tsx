import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { getSharedMapBySlug } from '@/features/shared-map/api/getSharedMapBySlug';
import { SharedMapView } from '@/features/shared-map/components/SharedMapView';
import {
  SHARE_PREVIEW_SITE_NAME,
  buildSharePreviewUrl,
  buildSharePreview,
  resolveSharePreviewImageUrl,
} from '@/features/shared-map/utils/sharePreview';
import * as s from './page.css';

interface Props {
  params: Promise<{ slug: string }>;
}

const getCachedSharedMapBySlug = cache(getSharedMapBySlug);

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { slug } = await params;
  const sharedMap = await getCachedSharedMapBySlug(slug);

  if (!sharedMap) {
    return {
      title: '공유 지도를 찾을 수 없어요 | Pin Plate',
    };
  }

  const preview = buildSharePreview({
    title: sharedMap.title,
    description: sharedMap.description,
    placeCount: sharedMap.place_count,
    coverImageUrl: sharedMap.cover_image_url,
  });
  const previewImageUrl = await resolveSharePreviewImageUrl(
    sharedMap.cover_image_url,
  );
  const previewUrl = buildSharePreviewUrl(slug);

  return {
    title: preview.title,
    description: preview.description,
    openGraph: {
      title: preview.title,
      description: preview.description,
      images: [{ url: previewImageUrl }],
      url: previewUrl,
      siteName: SHARE_PREVIEW_SITE_NAME,
      type: 'website',
    },
  };
};

export default async function SharePage({ params }: Props) {
  const { slug } = await params;
  const sharedMap = await getCachedSharedMapBySlug(slug);

  if (!sharedMap) notFound();

  return (
    <main className={s.page}>
      <SharedMapView sharedMap={sharedMap} />
    </main>
  );
}
