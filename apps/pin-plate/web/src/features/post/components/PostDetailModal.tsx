'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Modal, Spinner } from '@pin-plate/ui';
import { usePostDetailModal } from '../hooks/usePostDetailModal';
import type { Post } from '../types/post';
import type { CreatePostPayload } from '../types/post';
import EditPostContent from './EditPostContent';
import { ReviewCard } from './ReviewCard';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import * as styles from './styles/PostDetailModal.styles.css';

interface PostDetailModalProps {
  id: string;
  isIntercepted?: boolean;
}

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
            <SavedPostDetailInner id={id} />
          </Suspense>
        </ErrorBoundary>
      </Modal.FullScreenContainer>
    </Modal>
  );
};
