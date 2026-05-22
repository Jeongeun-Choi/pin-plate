import { createClient } from '@supabase/supabase-js';
import type { SharedMap, SharedMapPlace } from '../types/sharedMap';

interface SupabaseError {
  code?: string;
  message?: string;
}

interface PublicSharedMapRow extends Omit<SharedMap, 'shared_map_places'> {
  shared_map_places: SharedMapPlace[] | null;
}

interface SharedMapPublicRpcClient {
  rpc: (
    functionName: 'get_shared_map_by_slug_public',
    params: { p_slug: string },
  ) => {
    maybeSingle: () => Promise<{
      data: PublicSharedMapRow | null;
      error: SupabaseError | null;
    }>;
  };
}

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
  const supabase =
    createSharedMapPublicClient() as unknown as SharedMapPublicRpcClient;
  const { data: sharedMapRow, error } = await supabase
    .rpc('get_shared_map_by_slug_public', { p_slug: slug })
    .maybeSingle();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  if (!sharedMapRow) return null;

  const sharedMap = sharedMapRow as SharedMap;

  return {
    ...sharedMap,
    shared_map_places: [...(sharedMap.shared_map_places ?? [])].sort(
      (firstPlace, secondPlace) =>
        firstPlace.sort_order - secondPlace.sort_order,
    ),
  };
};
