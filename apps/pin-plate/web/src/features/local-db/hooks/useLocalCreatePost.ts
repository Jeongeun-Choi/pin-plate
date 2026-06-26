import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { PlaceStatus } from '@/features/place/types/place';
import { localPlaceRepository } from '../repositories/localPlaceRepository';
import { localPostRepository } from '../repositories/localPostRepository';
import { localDbKeys } from '../localDbKeys';

interface LocalCreatePostInput {
  place: {
    kakao_place_id: string;
    place_name: string;
    address: string;
    lat: number;
    lng: number;
  };
  post: {
    content: string;
    rating: number;
    tags: string[];
    status?: PlaceStatus;
  };
  imageIds: string[];
}

export const useLocalCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ place, post, imageIds }: LocalCreatePostInput) => {
      const now = new Date().toISOString();

      let existingPlace = await localPlaceRepository.getByKakaoId(
        place.kakao_place_id,
      );

      if (!existingPlace) {
        const placeId = await localPlaceRepository.addPlace({
          kakao_place_id: place.kakao_place_id,
          place_name: place.place_name,
          address: place.address,
          lat: place.lat,
          lng: place.lng,
          status: post.status ?? 'visited',
          tags: post.tags,
          created_at: now,
          updated_at: now,
        });
        existingPlace = (await localPlaceRepository.getById(placeId)) ?? {
          id: placeId,
          kakao_place_id: place.kakao_place_id,
          place_name: place.place_name,
          address: place.address,
          lat: place.lat,
          lng: place.lng,
          status: post.status ?? 'visited',
          tags: post.tags,
          created_at: now,
          updated_at: now,
        };
      }

      const postId = await localPostRepository.addPost({
        place_id: existingPlace.id,
        kakao_place_id: place.kakao_place_id,
        place_name: place.place_name,
        address: place.address,
        lat: place.lat,
        lng: place.lng,
        content: post.content,
        rating: post.rating,
        image_ids: imageIds,
        tags: post.tags,
        created_at: now,
      });

      return postId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: localDbKeys.all });
    },
  });
};
