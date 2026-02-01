import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { postKeys } from '../postKeys';
import { getPost } from '../api/getPost';
import { Post } from '../types/post';

export const usePost = (id: number): UseQueryResult<Post, Error> => {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => getPost(id),
    enabled: !!id,
  });
};
