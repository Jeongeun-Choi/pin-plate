import type { PlaceStatus } from '@/features/place/types/place';

export interface LocalPlace {
  id: string;
  kakao_place_id: string;
  place_name: string;
  address: string;
  lat: number;
  lng: number;
  status: PlaceStatus;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface LocalPost {
  id: string;
  place_id: string;
  kakao_place_id: string;
  place_name: string;
  address: string;
  lat: number;
  lng: number;
  content: string;
  rating: number;
  image_ids: string[];
  legacy_image_urls?: string[];
  legacy_image_keys?: string[];
  tags: string[];
  created_at: string;
}

export interface LocalImage {
  id: string;
  blob: Blob;
  mime_type: 'image/webp';
  created_at: string;
}

export interface LocalPostWithUrls extends LocalPost {
  image_urls: string[];
}

export interface LocalPlaceWithStats extends LocalPlace {
  posts: Array<{
    id: string;
    rating: number;
    image_urls: string[];
    created_at: string;
  }>;
  visit_count: number;
  avg_rating: number | null;
  last_visited_at: string | null;
  first_image: string | null;
}

export type CreateLocalPlaceInput = Omit<LocalPlace, 'id'>;
export type CreateLocalPostInput = Omit<LocalPost, 'id'>;
export type UpdateLocalPostInput = Partial<
  Omit<LocalPost, 'id' | 'created_at'>
>;
export type UpdateLocalPlaceInput = Partial<
  Omit<LocalPlace, 'id' | 'created_at'>
>;
