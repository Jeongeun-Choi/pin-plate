'use client';

import {
  Suspense,
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import { useRouter } from 'next/navigation';
import { Button, Modal, Popover, Spinner } from '@pin-plate/ui';
import { usePost } from '../hooks/usePost';
import { useDeletePost } from '../hooks/useDeletePost';
import { usePosts } from '../hooks/usePosts';
import { usePostsByPlace } from '../hooks/usePostsByPlace';
import { Post } from '../types/post';
import EditPostContent from './EditPostContent';
import PostDetailContent from './PostDetailContent';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import * as styles from './styles/PostDetailModal.styles.css';

interface PostDetailModalProps {
  id: string;
  isIntercepted?: boolean;
}

interface ReviewCardProps {
  post: Post;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onEditSuccess: () => void;
  sectionRef: (node: HTMLElement | null) => void;
}

const ReviewCard = ({
  post,
  isEditing,
  onEdit,
  onDelete,
  onEditSuccess,
  sectionRef,
}: ReviewCardProps) => {
  const formattedDate = new Date(post.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  if (isEditing) {
    return (
      <section
        ref={sectionRef}
        data-post-id={post.id}
        className={styles.reviewPanel}
      >
        <div className={styles.reviewPanelInner}>
          <EditPostContent post={post} onSuccess={onEditSuccess} />
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      data-post-id={post.id}
      className={styles.reviewPanel}
    >
      <div className={styles.reviewPanelInner}>
        <PostDetailContent
          post={post}
          metaSlot={
            <>
              <span className={styles.reviewCardDate}>{formattedDate}</span>
              <div className={styles.reviewMetaActions}>
                <Popover>
                  <Popover.Trigger>⋮</Popover.Trigger>
                  <Popover.Menu>
                    <Popover.Item onClick={onEdit}>수정하기</Popover.Item>
                    <Popover.Item onClick={onDelete}>삭제하기</Popover.Item>
                  </Popover.Menu>
                </Popover>
              </div>
            </>
          }
        />
      </div>
    </section>
  );
};

ReviewCard.displayName = 'ReviewCard';

const PostDetailInner = ({ id }: { id: string }) => {
  const { data: initialPost } = usePost(Number(id));

  const [placeId] = useState(initialPost.kakao_place_id);
  const [placeName] = useState(initialPost.place_name);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const hasAlignedInitialPostRef = useRef(false);
  const sectionRefs = useRef<Record<number, HTMLElement | null>>({});

  const router = useRouter();
  const { data: allPosts } = usePosts();
  const {
    data: reviewPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePostsByPlace(placeId);
  const { mutate: deletePost } = useDeletePost();

  const visitCount = useMemo(
    () => allPosts?.filter((p) => p.kakao_place_id === placeId).length ?? 0,
    [allPosts, placeId],
  );

  const allReviews = useMemo(
    () => reviewPages?.pages.flatMap((p) => p) ?? [],
    [reviewPages],
  );

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (
        scrollHeight - scrollTop - clientHeight < 150 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  const handleDelete = useCallback(
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

  useEffect(() => {
    const containsInitialPost = allReviews.some(
      (review) => review.id === Number(id),
    );

    if (!containsInitialPost && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [allReviews, id, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const el = scrollRef.current;
    if (
      el &&
      el.scrollHeight <= el.clientHeight &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [allReviews, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (hasAlignedInitialPostRef.current) return;

    const initialSection = sectionRefs.current[Number(id)];
    if (!initialSection) return;

    initialSection.scrollIntoView({
      block: 'start',
      behavior: 'auto',
    });
    hasAlignedInitialPostRef.current = true;
  }, [allReviews, id]);

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
              isEditing={editingPostId === review.id}
              onEdit={() => setEditingPostId(review.id)}
              onDelete={() => handleDelete(review.id)}
              onEditSuccess={() => setEditingPostId(null)}
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

      {editingPostId !== null && (
        <Modal.Footer>
          <Button
            type="submit"
            form="edit-post-form"
            variant="solid"
            size="full"
          >
            완료
          </Button>
          <Button
            onClick={() => setEditingPostId(null)}
            variant="secondary"
            size="full"
          >
            취소
          </Button>
        </Modal.Footer>
      )}
    </>
  );
};

const PostDetailSkeleton = () => (
  <Modal.Body>
    <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
      <Spinner />
    </div>
  </Modal.Body>
);

const PostDetailError = () => (
  <Modal.Body>
    <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>
      Failed to load post.
    </div>
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
