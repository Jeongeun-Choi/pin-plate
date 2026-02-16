'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Modal, Popover } from '@pin-plate/ui';
import { usePost } from '../hooks/usePost';
import { useDeletePost } from '../hooks/useDeletePost';

import PostDetailContent from './PostDetailContent';
import EditPostContent from './EditPostContent';
import ErrorBoundary from '@/components/common/ErrorBoundary';

interface PostDetailModalProps {
  id: string;
  isIntercepted?: boolean;
}

// Inner component that suspends
const PostDetailInner = ({ id }: { id: string }) => {
  const { data: post } = usePost(Number(id));
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const { mutate: deletePost } = useDeletePost(() => {
    alert('게시글이 삭제되었습니다.');
    router.back();
  });

  const handleOpenEditing = () => setIsEditing(true);

  const handleCancelEditing = () => setIsEditing(false);

  const handleDelete = () => {
    if (confirm('정말로 삭제하시겠습니까?')) {
      deletePost(Number(id));
    }
  };

  return (
    <>
      <Modal.Header>
        <Modal.Title>{isEditing ? '리뷰 수정' : '리뷰 상세'} </Modal.Title>
        {isEditing ? (
          <Modal.Close />
        ) : (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Popover>
              <Popover.Trigger>⋮</Popover.Trigger>
              <Popover.Menu>
                <Popover.Item onClick={handleOpenEditing}>
                  수정하기
                </Popover.Item>
                <Popover.Item onClick={handleDelete}>삭제하기</Popover.Item>
              </Popover.Menu>
            </Popover>
            <Modal.Close />
          </div>
        )}
      </Modal.Header>

      {/* Content */}
      <Modal.Body>
        {isEditing ? (
          <EditPostContent post={post} onSuccess={() => setIsEditing(false)} />
        ) : (
          <PostDetailContent post={post} />
        )}
      </Modal.Body>

      {/* Footer Actions - Only visible in Edit Mode */}
      {isEditing && (
        <Modal.Footer>
          <Button
            onClick={undefined}
            type="submit"
            form="edit-post-form"
            variant="solid"
            size="full"
          >
            완료
          </Button>
          <Button onClick={handleCancelEditing} variant="danger" size="full">
            취소
          </Button>
        </Modal.Footer>
      )}
    </>
  );
};

// Fallback Loading Component
const PostDetailSkeleton = () => (
  <Modal.Body>
    <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
      Loading...
    </div>
  </Modal.Body>
);

// Fallback Error Component
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
      router.replace('/home');
    }
  };

  return (
    <Modal isOpen={true} onClose={handleClose}>
      <Modal.Container>
        <ErrorBoundary fallback={<PostDetailError />}>
          <Suspense fallback={<PostDetailSkeleton />}>
            <PostDetailInner id={id} />
          </Suspense>
        </ErrorBoundary>
      </Modal.Container>
    </Modal>
  );
};
