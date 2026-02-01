import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { postKeys } from '../postKeys';
import { getPosts } from '../api/getPosts';

import { Post } from '../types/post';

export const usePosts = (): UseQueryResult<Post[], Error> => {
  return useQuery({
    queryKey: postKeys.lists(),
    queryFn: getPosts,
  });
};
