import { createClient } from '@/utils/supabase/client';
import type { Place, PlaceStatus } from '../types/place';

export const updatePlaceStatus = async (
  placeId: string,
  status: PlaceStatus,
): Promise<Place> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('places')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', placeId)
    .select()
    .single();

  if (error) throw error;
  return data as Place;
};
