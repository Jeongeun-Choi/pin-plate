import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { postKeys } from '../postKeys';
import { getPostsByPlaceId, PAGE_SIZE } from '../api/getPostsByPlaceId';
import { getCurrentUser } from '@/utils/supabase/getCurrentUser';

export const usePostsByPlace = (placeId: string) => {
  const { data: user } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: getCurrentUser,
  });

  return useInfiniteQuery({
    queryKey: postKeys.byPlace(user?.id ?? '', placeId),
    queryFn: ({ pageParam }) =>
      getPostsByPlaceId(user!.id, placeId, pageParam as number),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length * PAGE_SIZE : undefined,
    initialPageParam: 0,
    enabled: !!user && !!placeId,
  });
};
