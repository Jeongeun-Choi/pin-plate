import type { createClient } from '@/utils/supabase/server';
import type { IncomingPostPayload } from './postRequest';

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

interface PlaceReference {
  id: string;
  status?: string | null;
}

const findPlaceByKakaoId = async (
  supabase: SupabaseServerClient,
  userId: string,
  kakaoPlaceId: string,
): Promise<PlaceReference | null> => {
  const { data, error } = await supabase
    .from('places')
    .select('id, status')
    .eq('user_id', userId)
    .eq('kakao_place_id', kakaoPlaceId)
    .maybeSingle();

  if (error) throw error;

  return data as PlaceReference | null;
};

const createPlaceForPost = async (
  supabase: SupabaseServerClient,
  payload: IncomingPostPayload,
  userId: string,
): Promise<PlaceReference> => {
  const { data, error } = await supabase
    .from('places')
    .insert({
      user_id: userId,
      kakao_place_id: payload.kakao_place_id,
      place_name: payload.place_name,
      address: payload.address,
      lat: payload.lat,
      lng: payload.lng,
      status: 'visited',
      tags: payload.tags,
    })
    .select('id, status')
    .single();

  if (error) throw error;

  return data as PlaceReference;
};

export const resolvePostPlaceId = async (
  supabase: SupabaseServerClient,
  payload: IncomingPostPayload,
  userId: string,
): Promise<string> => {
  if (payload.place_id) return payload.place_id;

  const existingPlace = await findPlaceByKakaoId(
    supabase,
    userId,
    payload.kakao_place_id,
  );
  if (existingPlace) return existingPlace.id;

  try {
    const createdPlace = await createPlaceForPost(supabase, payload, userId);
    return createdPlace.id;
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    ) {
      const racedPlace = await findPlaceByKakaoId(
        supabase,
        userId,
        payload.kakao_place_id,
      );
      if (racedPlace) return racedPlace.id;
    }

    throw error;
  }
};
