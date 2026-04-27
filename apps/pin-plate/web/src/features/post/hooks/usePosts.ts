import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { postKeys } from '../postKeys';
import { getPosts } from '../api/getPosts';
import { getCurrentUser } from '@/utils/supabase/getCurrentUser';
import { Post } from '../types/post';

export const usePosts = (): UseQueryResult<Post[], Error> => {
  const { data: user } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: getCurrentUser,
  });

  const userId = user?.id;

  return useQuery({
    queryKey: postKeys.lists(userId),
    queryFn: () => getPosts(userId!),
    enabled: !!userId,
  });
};
