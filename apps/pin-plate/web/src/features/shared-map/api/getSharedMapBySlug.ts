import { createAdminClient } from '@/utils/supabase/admin';
import type { SharedMap } from '../types/sharedMap';

export const getSharedMapBySlug = async (
  slug: string,
): Promise<SharedMap | null> => {
  const supabase = createAdminClient();
  const { data: sharedMapRow, error } = await supabase
    .from('shared_maps')
    .select('*, shared_map_places(*)')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  const sharedMap = sharedMapRow as SharedMap;

  return {
    ...sharedMap,
    shared_map_places: [...sharedMap.shared_map_places].sort(
      (firstPlace, secondPlace) =>
        firstPlace.sort_order - secondPlace.sort_order,
    ),
  };
};
