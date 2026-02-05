'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Modal } from '@pin-plate/ui';
import { usePost } from '../hooks/usePost';
import { EditPostContainer } from './EditPostContainer';
import * as styles from './styles/PostDetailModal.styles.css';
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

  const handleEdit = () => setIsEditing(true);
  const handleEditCancel = () => setIsEditing(false);
  const handleEditSuccess = () => setIsEditing(false);

  const handleDelete = () => {
    if (confirm('정말로 삭제하시겠습니까?')) {
      // call delete mutation
    }
  };

  if (isEditing) {
    return (
      <EditPostContainer
        id={id}
        onCancel={handleEditCancel}
        onSuccess={handleEditSuccess}
      />
    );
  }
  return (
    <>
      <Modal.Header>
        <Modal.Title>리뷰 상세</Modal.Title>
        <Modal.Close />
      </Modal.Header>

      {/* Content */}
      <Modal.Body>
        <PostDetailContent post={post} />
      </Modal.Body>

      {/* Footer Actions */}
      <Modal.Footer>
        <Button className={styles.editButton} onClick={handleEdit}>
          수정
        </Button>
        <Button className={styles.deleteButton} onClick={handleDelete}>
          삭제
        </Button>
      </Modal.Footer>
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
