import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getCurrentUser } from '@/utils/supabase/getCurrentUser';
import { getPlaces } from '../api/getPlaces';
import { placeKeys } from '../placeKeys';
import type { PlaceWithStats } from '../types/place';

export const usePlaces = (): UseQueryResult<PlaceWithStats[], Error> => {
  const { data: user } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: getCurrentUser,
  });
  const userId = user?.id;

  return useQuery({
    queryKey: placeKeys.lists(userId),
    queryFn: () => getPlaces(userId!),
    enabled: !!userId,
  });
};
