'use client';

import { Suspense, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Modal, Spinner } from '@pin-plate/ui';
import { usePostDetailModal } from '../hooks/usePostDetailModal';
import type { Post } from '../types/post';
import type { CreatePostPayload } from '../types/post';
import { useLocalPost } from '@/features/local-db/hooks/useLocalPost';
import { useLocalDeletePost } from '@/features/local-db/hooks/useLocalDeletePost';
import { useLocalUpdatePost } from '@/features/local-db/hooks/useLocalUpdatePost';
import type { LocalPostWithUrls } from '@/features/local-db/types';
import EditPostContent from './EditPostContent';
import { ReviewCard } from './ReviewCard';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import * as styles from './styles/PostDetailModal.styles.css';

interface PostDetailModalProps {
  id: string;
  isIntercepted?: boolean;
}

const toLocalDetailPost = (localPost: LocalPostWithUrls): Post => ({
  id: 0,
  place_id: localPost.place_id,
  content: localPost.content,
  rating: localPost.rating,
  image_urls: localPost.image_urls,
  image_keys: localPost.legacy_image_keys,
  place_name: localPost.place_name,
  address: localPost.address,
  lat: localPost.lat,
  lng: localPost.lng,
  kakao_place_id: localPost.kakao_place_id,
  user_id: 'local',
  tags: localPost.tags,
  created_at: localPost.created_at,
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

const LocalPostDetailInner = ({
  localPost,
}: {
  localPost: LocalPostWithUrls;
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const router = useRouter();
  const { mutateAsync: deleteLocalPost } = useLocalDeletePost();
  const { mutateAsync: updateLocalPost } = useLocalUpdatePost();

  const post = toLocalDetailPost(localPost);

  const handleDeleteLocalPost = useCallback(() => {
    if (!confirm('정말로 삭제하시겠습니까?')) return;

    deleteLocalPost(localPost.id)
      .then(() => router.back())
      .catch(() => alert('삭제에 실패했습니다.'));
  }, [localPost.id, deleteLocalPost, router]);

  const handleEditLocalPost = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleSaveLocalPost = useCallback(
    async (payload: CreatePostPayload) => {
      await updateLocalPost({
        id: localPost.id,
        updates: {
          content: payload.content,
          rating: payload.rating,
          place_name: payload.place_name,
          address: payload.address,
          lat: payload.lat,
          lng: payload.lng,
          kakao_place_id: payload.kakao_place_id,
          tags: payload.tags,
        },
      });
      setIsEditing(false);
    },
    [localPost.id, updateLocalPost],
  );

  if (isEditing) {
    return (
      <PostDetailEditView
        post={post}
        onCancel={handleCancelEdit}
        onSuccess={handleCancelEdit}
        onSubmitOverride={handleSaveLocalPost}
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
            onEdit={handleEditLocalPost}
            onDelete={handleDeleteLocalPost}
            sectionRef={() => {}}
          />
        </div>
      </Modal.Body>
    </>
  );
};

const PostDetailInner = ({ id }: { id: string }) => {
  // UUID면 로컬, 숫자면 Supabase
  const isLocalPost = isNaN(Number(id));
  const { data: localPost } = useLocalPost(id, isLocalPost);

  if (isLocalPost) {
    if (!localPost) {
      return (
        <Modal.Body>
          <div className={styles.errorMessage}>기록을 찾을 수 없습니다.</div>
        </Modal.Body>
      );
    }
    return <LocalPostDetailInner localPost={localPost} />;
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
