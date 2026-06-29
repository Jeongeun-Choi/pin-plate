import { createClient } from '@/utils/supabase/client';
import type { CreateSharedMapPayload, SharedMap } from '../types/sharedMap';
import { createShareSlug } from '../utils/slug';

const MAX_SHARED_PLACES = 100;
const MAX_SLUG_RETRIES = 3;

interface SupabaseError {
  code?: string;
  message?: string;
}

interface CreateSharedMapRpcPlace {
  source_place_id: string;
  kakao_place_id: string;
  place_name: string;
  address: string;
  lat: number;
  lng: number;
  status: string;
  tags: string[];
  avg_rating: number | null;
  first_image: string | null;
  visit_count: number;
  sort_order: number;
}

interface CreateSharedMapRpcParams {
  p_owner_id: string;
  p_slug: string;
  p_title: string;
  p_description: string;
  p_criteria_type: string;
  p_criteria_value: string;
  p_place_count: number;
  p_cover_image_url: string | null;
  p_places: CreateSharedMapRpcPlace[];
}

interface SupabaseRpcClient {
  rpc: (
    functionName: string,
    params: CreateSharedMapRpcParams,
  ) => Promise<{ data: unknown; error: SupabaseError | null }>;
}

export const createSharedMap = async (
  ownerId: string,
  payload: CreateSharedMapPayload,
): Promise<SharedMap> => {
  const selectedPlaces = payload.places.slice(0, MAX_SHARED_PLACES);

  if (selectedPlaces.length === 0) {
    throw new Error('shared_map_requires_places');
  }

  const supabase = createClient();
  const coverImageUrl =
    selectedPlaces.map((place) => place.first_image).find(Boolean) ?? null;
  const rpcClient = supabase as unknown as SupabaseRpcClient;
  const rpcPlaces = selectedPlaces.map((place, index) => ({
    source_place_id: place.id,
    kakao_place_id: place.kakao_place_id,
    place_name: place.place_name,
    address: place.address,
    lat: place.lat,
    lng: place.lng,
    status: place.status,
    tags: place.tags,
    avg_rating: place.avg_rating,
    first_image: place.first_image,
    visit_count: place.visit_count,
    sort_order: index,
  }));
  const baseParams = {
    p_owner_id: ownerId,
    p_title: payload.title.trim(),
    p_description: payload.description.trim(),
    p_criteria_type: payload.criteriaType,
    p_criteria_value: payload.criteriaValue.trim(),
    p_place_count: selectedPlaces.length,
    p_cover_image_url: coverImageUrl,
    p_places: rpcPlaces,
  };

  for (
    let attemptIndex = 0;
    attemptIndex <= MAX_SLUG_RETRIES;
    attemptIndex += 1
  ) {
    const { data: createdSharedMap, error: createSharedMapError } =
      await rpcClient.rpc('create_shared_map_with_places', {
        ...baseParams,
        p_slug: createShareSlug(payload.title),
      });

    if (!createSharedMapError) {
      return createdSharedMap as SharedMap;
    }

    if (
      createSharedMapError.code !== '23505' ||
      attemptIndex === MAX_SLUG_RETRIES
    ) {
      throw createSharedMapError;
    }
  }

  throw new Error('shared_map_create_failed');
};
