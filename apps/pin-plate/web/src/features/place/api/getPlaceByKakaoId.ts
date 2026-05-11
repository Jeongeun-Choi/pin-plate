import { createClient } from '@/utils/supabase/client';
import type { Place } from '../types/place';

export const getPlaceByKakaoId = async (
  userId: string,
  kakaoPlaceId: string,
): Promise<Place | null> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('user_id', userId)
    .eq('kakao_place_id', kakaoPlaceId)
    .maybeSingle();

  if (error) throw error;
  return data as Place | null;
};
