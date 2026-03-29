import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { postKeys } from '../postKeys';
import { getPosts } from '../api/getPosts';
import { createClient } from '@/utils/supabase/client';

import { Post } from '../types/post';

export const usePosts = (): UseQueryResult<Post[], Error> => {
  const supabase = createClient();

  // 현재 로그인한 사용자 정보를 가져옴
  const { data: user } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
  });

  const userId = user?.id;

  return useQuery({
    queryKey: postKeys.lists(userId),
    queryFn: () => getPosts(userId!), // userId가 존재할 때만 enabled가 true이므로 ! 연산자 사용 가능
    enabled: !!userId,
  });
};
