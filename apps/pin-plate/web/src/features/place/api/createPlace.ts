import { createClient } from '@/utils/supabase/client';
import type { CreatePlacePayload, Place } from '../types/place';

export const createPlace = async (
  userId: string,
  payload: CreatePlacePayload,
): Promise<Place> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('places')
    .insert({ ...payload, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data as Place;
};
