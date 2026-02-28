import {
  useSuspenseQuery,
  UseSuspenseQueryResult,
} from '@tanstack/react-query';
import { postKeys } from '../postKeys';
import { getPost } from '../api/getPost';
import { Post } from '../types/post';

export const usePost = (id: number): UseSuspenseQueryResult<Post, Error> => {
  return useSuspenseQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => getPost(id),
  });
};
