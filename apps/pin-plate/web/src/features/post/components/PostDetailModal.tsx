'use client';

import { Suspense, useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Modal, Spinner } from '@pin-plate/ui';
import { usePostDetailModal } from '../hooks/usePostDetailModal';
import type { Post } from '../types/post';
import type { CreatePostPayload } from '../types/post';
import { useGuestPosts } from '@/features/guest/hooks/useGuestPosts';
import { loadGuestPosts } from '@/features/guest/storage/guestPostStorage';
import type { GuestPost } from '@/features/guest/types/guestPost';
import EditPostContent from './EditPostContent';
import { ReviewCard } from './ReviewCard';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import * as styles from './styles/PostDetailModal.styles.css';

interface PostDetailModalProps {
  id: string;
  isIntercepted?: boolean;
}

const toGuestDetailPost = (guestPost: GuestPost): Post => ({
  id: 0,
  place_id: undefined,
  content: guestPost.content,
  rating: guestPost.rating,
  image_urls: guestPost.image_urls,
  place_name: guestPost.place_name,
  address: guestPost.address,
  lat: guestPost.lat,
  lng: guestPost.lng,
  kakao_place_id: guestPost.kakao_place_id,
  user_id: 'guest',
  tags: guestPost.tags,
  created_at: guestPost.created_at,
});

const SavedPostDetailInner = ({ id }: { id: string }) => {
  const {
    placeName,
    visitCount,
    allReviews,
    editingPost,
    isEditing,
    startEdit,
    cancelEdit,
    deleteReview,
    scrollRef,
    sectionRefs,
    handleScroll,
    hasNextPage,
    isFetchingNextPage,
  } = usePostDetailModal(id);

  if (isEditing && editingPost) {
    return (
      <PostDetailEditView
        post={editingPost}
        onCancel={cancelEdit}
        onSuccess={cancelEdit}
      />
    );
  }

  return (
    <>
      <Modal.Header>
        <Modal.Title>{placeName}</Modal.Title>
        <Modal.Close />
      </Modal.Header>

      {visitCount > 0 && (
        <div className={styles.visitBanner}>{visitCount}회 방문했습니다!</div>
      )}

      <Modal.Body>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className={styles.scrollContainer}
        >
          {allReviews.map((review) => (
            <ReviewCard
              key={review.id}
              post={review}
              onEdit={() => startEdit(review.id)}
              onDelete={() => deleteReview(review.id)}
              sectionRef={(node) => {
                sectionRefs.current[review.id] = node;
              }}
            />
          ))}

          {isFetchingNextPage && (
            <div className={styles.loadingRow}>
              <Spinner />
            </div>
          )}

          {!hasNextPage && allReviews.length > 0 && (
            <div className={styles.reviewCardEmpty}>모든 기록을 불러왔어요</div>
          )}
        </div>
      </Modal.Body>
    </>
  );
};

const GuestPostDetailInner = ({ guestPost }: { guestPost: GuestPost }) => {
  const [editingGuestPost, setEditingGuestPost] = useState<GuestPost | null>(
    null,
  );

  const router = useRouter();
  const { removeGuestPost, updateGuestPost } = useGuestPosts();

  const post = toGuestDetailPost(guestPost);

  const handleDeleteGuestPost = useCallback(() => {
    if (!confirm('정말로 삭제하시겠습니까?')) return;

    removeGuestPost(guestPost.id);
    router.back();
  }, [guestPost.id, removeGuestPost, router]);

  const handleEditGuestPost = useCallback(() => {
    setEditingGuestPost(guestPost);
  }, [guestPost]);

  const handleCancelGuestPostEdit = useCallback(() => {
    setEditingGuestPost(null);
  }, []);

  const handleSaveGuestPost = useCallback(
    (currentGuestPost: GuestPost, payload: CreatePostPayload) => {
      updateGuestPost({
        ...currentGuestPost,
        content: payload.content,
        rating: payload.rating,
        image_urls: payload.image_urls,
        place_name: payload.place_name,
        address: payload.address,
        lat: payload.lat,
        lng: payload.lng,
        kakao_place_id: payload.kakao_place_id,
        tags: payload.tags,
      });
      setEditingGuestPost(null);
    },
    [updateGuestPost],
  );

  if (editingGuestPost) {
    return (
      <GuestPostDetailEditView
        guestPost={editingGuestPost}
        onCancel={handleCancelGuestPostEdit}
        onSuccess={handleCancelGuestPostEdit}
        onSubmitOverride={(payload) =>
          handleSaveGuestPost(editingGuestPost, payload)
        }
      />
    );
  }

  return (
    <>
      <Modal.Header>
        <Modal.Title>{post.place_name}</Modal.Title>
        <Modal.Close />
      </Modal.Header>

      <Modal.Body>
        <div className={styles.scrollContainer}>
          <ReviewCard
            post={post}
            onEdit={handleEditGuestPost}
            onDelete={handleDeleteGuestPost}
            sectionRef={() => {}}
          />
        </div>
      </Modal.Body>
    </>
  );
};

const GuestPostDetailEditView = ({
  guestPost,
  onCancel,
  onSuccess,
  onSubmitOverride,
}: {
  guestPost: GuestPost;
  onCancel: () => void;
  onSuccess: () => void;
  onSubmitOverride: (payload: CreatePostPayload) => Promise<void> | void;
}) => (
  <PostDetailEditView
    post={toGuestDetailPost(guestPost)}
    onCancel={onCancel}
    onSuccess={onSuccess}
    onSubmitOverride={onSubmitOverride}
  />
);

const PostDetailInner = ({ id }: { id: string }) => {
  const { guestPosts } = useGuestPosts();
  const guestPost = useMemo(
    () =>
      guestPosts.find((post) => post.id === id) ??
      loadGuestPosts().find((post) => post.id === id),
    [guestPosts, id],
  );

  if (guestPost) {
    return <GuestPostDetailInner guestPost={guestPost} />;
  }

  return <SavedPostDetailInner id={id} />;
};

const PostDetailEditView = ({
  post,
  onCancel,
  onSuccess,
  onSubmitOverride,
}: {
  post: Post;
  onCancel: () => void;
  onSuccess: () => void;
  onSubmitOverride?: (payload: CreatePostPayload) => Promise<void> | void;
}) => (
  <>
    <Modal.Header>
      <Modal.Title>리뷰 수정</Modal.Title>
      <Modal.Close />
    </Modal.Header>
    <Modal.Body>
      <div className={styles.editScreenBody}>
        <EditPostContent
          post={post}
          onSuccess={onSuccess}
          onSubmitOverride={onSubmitOverride}
        />
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button type="submit" form="edit-post-form" variant="solid" size="full">
        완료
      </Button>
      <Button onClick={onCancel} variant="secondary" size="full">
        취소
      </Button>
    </Modal.Footer>
  </>
);

const PostDetailSkeleton = () => (
  <Modal.Body>
    <div className={styles.loadingRow}>
      <Spinner />
    </div>
  </Modal.Body>
);

const PostDetailError = () => (
  <Modal.Body>
    <div className={styles.errorMessage}>Failed to load post.</div>
  </Modal.Body>
);

export const PostDetailModal = ({
  id,
  isIntercepted = false,
}: PostDetailModalProps) => {
  const router = useRouter();

  const handleClose = () => {
    if (isIntercepted) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <Modal isOpen={true} onClose={handleClose}>
      <Modal.FullScreenContainer>
        <ErrorBoundary fallback={<PostDetailError />}>
          <Suspense fallback={<PostDetailSkeleton />}>
            <PostDetailInner id={id} />
          </Suspense>
        </ErrorBoundary>
      </Modal.FullScreenContainer>
    </Modal>
  );
};
