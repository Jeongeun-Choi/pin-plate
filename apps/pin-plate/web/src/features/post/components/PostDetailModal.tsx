'use client';

import { Suspense, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Modal, Spinner } from '@pin-plate/ui';
import { usePostDetailModal } from '../hooks/usePostDetailModal';
import type { Post } from '../types/post';
import { useGuestPosts } from '@/features/guest/hooks/useGuestPosts';
import { loadGuestPosts } from '@/features/guest/storage/guestPostStorage';
import type { GuestPost } from '@/features/guest/types/guestPost';
import EditPostContent from './EditPostContent';
import PostDetailContent from './PostDetailContent';
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
  const post = toGuestDetailPost(guestPost);

  return (
    <>
      <Modal.Header>
        <Modal.Title>{post.place_name}</Modal.Title>
        <Modal.Close />
      </Modal.Header>

      <Modal.Body>
        <div className={styles.scrollContainer}>
          <section data-post-id={guestPost.id} className={styles.reviewPanel}>
            <div className={styles.reviewPanelInner}>
              <PostDetailContent post={post} />
            </div>
          </section>
        </div>
      </Modal.Body>
    </>
  );
};

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
}: {
  post: Post;
  onCancel: () => void;
  onSuccess: () => void;
}) => (
  <>
    <Modal.Header>
      <Modal.Title>리뷰 수정</Modal.Title>
      <Modal.Close />
    </Modal.Header>
    <Modal.Body>
      <div className={styles.editScreenBody}>
        <EditPostContent post={post} onSuccess={onSuccess} />
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
