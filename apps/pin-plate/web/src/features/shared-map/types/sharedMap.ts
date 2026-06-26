import type { PlaceStatus } from '@/features/place/types/place';

export type SharedMapCriteriaType = 'status' | 'tag' | 'region' | 'manual';

export interface SharedMapPlace {
  id: string;
  shared_map_id: string;
  source_place_id: string;
  kakao_place_id: string;
  place_name: string;
  address: string;
  lat: number;
  lng: number;
  status: PlaceStatus;
  tags: string[];
  avg_rating: number | null;
  first_image: string | null;
  visit_count: number;
  sort_order: number;
  created_at: string;
}

export interface SharedMap {
  id: string;
  owner_id: string | null;
  slug: string;
  title: string;
  description: string;
  criteria_type: SharedMapCriteriaType;
  criteria_value: string;
  place_count: number;
  cover_image_url: string | null;
  created_at: string;
  shared_map_places: SharedMapPlace[];
}

export interface CreateSharedMapPayload {
  title: string;
  description: string;
  criteriaType: SharedMapCriteriaType;
  criteriaValue: string;
  places: {
    id: string;
    kakao_place_id: string;
    place_name: string;
    address: string;
    lat: number;
    lng: number;
    status: PlaceStatus;
    tags: string[];
    avg_rating: number | null;
    first_image: string | null;
    visit_count: number;
  }[];
}
