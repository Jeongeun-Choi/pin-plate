import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeletePost } from './useDeletePost';
import { usePost } from './usePost';
import { usePosts } from './usePosts';
import { usePostsByPlace } from './usePostsByPlace';
import { usePostDetailScroll } from './usePostDetailScroll';

export const usePostDetailModal = (id: string) => {
  const router = useRouter();
  const { data: initialPost } = usePost(Number(id));
  const { data: allPosts } = usePosts();
  const { mutate: deletePost } = useDeletePost();

  const placeId = initialPost.kakao_place_id;
  const placeName = initialPost.place_name;
  const [editingPostId, setEditingPostId] = useState<number | null>(null);

  const {
    data: reviewPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePostsByPlace(placeId);

  const visitCount = useMemo(
    () => allPosts?.filter((p) => p.kakao_place_id === placeId).length ?? 0,
    [allPosts, placeId],
  );

  const allReviews = useMemo(
    () => reviewPages?.pages.flatMap((p) => p) ?? [],
    [reviewPages],
  );

  const editingPost = useMemo(
    () => allReviews.find((review) => review.id === editingPostId) ?? null,
    [allReviews, editingPostId],
  );

  const { scrollRef, sectionRefs, handleScroll } = usePostDetailScroll({
    id,
    allReviews,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  const startEdit = useCallback((postId: number) => {
    setEditingPostId(postId);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingPostId(null);
  }, []);

  const deleteReview = useCallback(
    (postId: number) => {
      if (!confirm('정말로 삭제하시겠습니까?')) return;

      const isAnchor = postId === Number(id);
      const isLast = allReviews.length === 1;

      deletePost(postId, {
        onSuccess: () => {
          if (isAnchor || isLast) router.back();
        },
      });
    },
    [id, allReviews.length, deletePost, router],
  );

  return {
    placeName,
    visitCount,
    allReviews,
    editingPost,
    isEditing: editingPost !== null,
    startEdit,
    cancelEdit,
    deleteReview,
    scrollRef,
    sectionRefs,
    handleScroll,
    hasNextPage,
    isFetchingNextPage,
  };
};
