import {
  useQuery,
  useSuspenseQuery,
  UseQueryResult,
} from '@tanstack/react-query';
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
    queryFn: getPlaces,
    enabled: !!userId,
  });
};

export const useSuspensePlaces = () => {
  const { data: user } = useSuspenseQuery({
    queryKey: ['auth', 'user'],
    queryFn: getCurrentUser,
  });

  return useSuspenseQuery<PlaceWithStats[]>({
    queryKey: placeKeys.lists(user?.id ?? 'guest'),
    queryFn: getPlaces,
  });
};
