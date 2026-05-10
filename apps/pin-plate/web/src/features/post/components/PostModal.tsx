'use client';

import { memo, useEffect } from 'react';
import { Button, Modal } from '@pin-plate/ui';
import PostForm from './PostForm';
import { usePostForm } from '../hooks/usePostForm';
import { Place } from '../types/search';
import * as styles from './styles/PostModal.styles.css';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlace?: Place | null;
}

export const PostModal = memo(
  ({ isOpen, onClose, initialPlace }: PostModalProps) => {
    const { formState, handlers, submit } = usePostForm(onClose, initialPlace);

    useEffect(() => {
      if (!isOpen) {
        handlers.resetForm();
      }
    }, [isOpen, handlers]);
    const visitCount = formState.existingReviewsForPlace.length;

    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <Modal.FullScreenContainer>
          <Modal.Header>
            <Modal.Title>맛집 기록</Modal.Title>
            <Modal.Close />
          </Modal.Header>

          {visitCount > 0 && (
            <div className={styles.existingReviewBanner}>
              이미 {visitCount}회 방문한 곳이에요. 새 리뷰를 추가할 수 있어요.
            </div>
          )}

          <Modal.Body>
            <div className={styles.formContainer}>
              <PostForm formState={formState} handlers={handlers} />
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={submit} size="full">
              등록하기
            </Button>
          </Modal.Footer>
        </Modal.FullScreenContainer>
      </Modal>
    );
  },
);

PostModal.displayName = 'PostModal';
