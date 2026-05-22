import { createClient } from '@supabase/supabase-js';
import type { SharedMap } from '../types/sharedMap';

const createSharedMapPublicClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_API_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

export const getSharedMapBySlug = async (
  slug: string,
): Promise<SharedMap | null> => {
  const supabase = createSharedMapPublicClient();
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
