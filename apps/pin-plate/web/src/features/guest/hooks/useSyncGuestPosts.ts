import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getPlaceByKakaoId } from '@/features/place/api/getPlaceByKakaoId';
import { createPlace } from '@/features/place/api/createPlace';
import { createPost } from '@/features/post/api/createPost';
import { postKeys } from '@/features/post/postKeys';
import { placeKeys } from '@/features/place/placeKeys';
import { useGuestPosts } from './useGuestPosts';

export interface SyncGuestPostsResult {
  successCount: number;
  failedCount: number;
}

export const useSyncGuestPosts = () => {
  const queryClient = useQueryClient();
  const { guestPosts, removeGuestPost } = useGuestPosts();

  const { mutateAsync: syncGuestPosts, isPending: isSyncing } = useMutation<
    SyncGuestPostsResult,
    Error,
    string
  >({
    mutationFn: async (userId: string) => {
      const snapshot = [...guestPosts];
      let successCount = 0;
      let failedCount = 0;

      for (const guestPost of snapshot) {
        try {
          let place = await getPlaceByKakaoId(userId, guestPost.kakao_place_id);
          if (!place) {
            place = await createPlace(userId, {
              kakao_place_id: guestPost.kakao_place_id,
              place_name: guestPost.place_name,
              address: guestPost.address,
              lat: guestPost.lat,
              lng: guestPost.lng,
              status: 'visited',
              tags: guestPost.tags,
            });
          }

          await createPost({
            content: guestPost.content,
            rating: guestPost.rating,
            image_urls: guestPost.image_urls,
            tags: guestPost.tags,
            place_name: guestPost.place_name,
            address: guestPost.address,
            lat: guestPost.lat,
            lng: guestPost.lng,
            kakao_place_id: guestPost.kakao_place_id,
            user_id: userId,
            place_id: place.id,
          });

          successCount += 1;
          removeGuestPost(guestPost.id);
        } catch (error) {
          failedCount += 1;
          console.error('Guest post sync failed:', error);
        }
      }

      return { successCount, failedCount };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      queryClient.invalidateQueries({ queryKey: placeKeys.all });
    },
  });

  return { syncGuestPosts, isSyncing };
};
