import { useQuery } from '@tanstack/react-query';
import type { Post } from '@/features/post/types/post';
import { localPostRepository } from '../repositories/localPostRepository';
import { localDbKeys } from '../localDbKeys';
import type { LocalPost } from '../types';

const localPostToPost = (p: LocalPost): Post => ({
  id: 0,
  user_id: 'local',
  created_at: p.created_at,
  content: p.content,
  rating: p.rating,
  image_urls: p.legacy_image_urls ?? [],
  image_keys: p.legacy_image_keys ?? [],
  place_name: p.place_name,
  address: p.address,
  lat: p.lat,
  lng: p.lng,
  kakao_place_id: p.kakao_place_id,
  tags: p.tags,
});

export const useLocalPosts = () =>
  useQuery({
    queryKey: localDbKeys.posts(),
    queryFn: async () => {
      const posts = await localPostRepository.getAll();
      return posts.map(localPostToPost);
    },
    staleTime: Infinity,
  });

export const useRawLocalPosts = () =>
  useQuery({
    queryKey: [...localDbKeys.posts(), 'raw'],
    queryFn: () => localPostRepository.getAll(),
    staleTime: Infinity,
  });
