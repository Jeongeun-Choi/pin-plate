import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getPlaceByKakaoId } from '@/features/place/api/getPlaceByKakaoId';
import { createPlace } from '@/features/place/api/createPlace';
import { createPost } from '@/features/post/api/createPost';
import { postKeys } from '@/features/post/postKeys';
import { placeKeys } from '@/features/place/placeKeys';
import { localDbKeys } from '@/features/local-db/localDbKeys';
import { localPostRepository } from '@/features/local-db/repositories/localPostRepository';
import { localPlaceRepository } from '@/features/local-db/repositories/localPlaceRepository';
import { localImageRepository } from '@/features/local-db/repositories/localImageRepository';
import { uploadLocalImagesToS3 } from '@/features/local-db/utils/uploadLocalImagesToS3';

export interface SyncGuestPostsResult {
  successCount: number;
  failedCount: number;
}

export const useSyncGuestPosts = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: syncGuestPosts, isPending: isSyncing } = useMutation<
    SyncGuestPostsResult,
    Error,
    string
  >({
    mutationFn: async (userId: string) => {
      const localPosts = await localPostRepository.getAll();
      let successCount = 0;
      let failedCount = 0;

      for (const localPost of localPosts) {
        try {
          // 1. IndexedDB 이미지를 S3에 업로드
          const uploadedImages =
            localPost.image_ids.length > 0
              ? await uploadLocalImagesToS3(localPost.image_ids)
              : [];

          const imageUrls = [
            ...uploadedImages.map((i) => i.url),
            ...(localPost.legacy_image_urls ?? []),
          ];
          const imageKeys = [
            ...uploadedImages.map((i) => i.key),
            ...(localPost.legacy_image_keys ?? []),
          ];

          // 2. Supabase에 place/post 생성
          let place = await getPlaceByKakaoId(userId, localPost.kakao_place_id);
          if (!place) {
            const placeRecord = await localPlaceRepository.getByKakaoId(
              localPost.kakao_place_id,
            );
            place = await createPlace(userId, {
              kakao_place_id: localPost.kakao_place_id,
              place_name: localPost.place_name,
              address: localPost.address,
              lat: localPost.lat,
              lng: localPost.lng,
              status: placeRecord?.status ?? 'visited',
              tags: placeRecord?.tags ?? localPost.tags,
            });
          }

          if (localPost.content || localPost.rating > 0) {
            await createPost({
              content: localPost.content,
              rating: localPost.rating,
              image_urls: imageUrls,
              image_keys: imageKeys,
              tags: localPost.tags,
              place_name: localPost.place_name,
              address: localPost.address,
              lat: localPost.lat,
              lng: localPost.lng,
              kakao_place_id: localPost.kakao_place_id,
              user_id: userId,
              place_id: place.id,
            });
          }

          // 3. 로컬에서 삭제
          await localImageRepository.bulkDelete(localPost.image_ids);
          await localPostRepository.deletePost(localPost.id);

          successCount += 1;
        } catch (error) {
          failedCount += 1;
          console.error('Local post sync failed:', localPost.id, error);
        }
      }

      return { successCount, failedCount };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      queryClient.invalidateQueries({ queryKey: placeKeys.all });
      queryClient.invalidateQueries({ queryKey: localDbKeys.all });
    },
  });

  return { syncGuestPosts, isSyncing };
};
