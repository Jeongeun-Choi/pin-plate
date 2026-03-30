'use client';

import { useEffect } from 'react';
import { Button, Modal } from '@pin-plate/ui';
import PostForm from './PostForm';
import { usePostForm } from '../hooks/usePostForm';
import { KakaoPlace } from '../types/search';
import * as styles from './styles/PostModal.styles.css';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlace?: KakaoPlace | null;
}

export const PostModal = ({
  isOpen,
  onClose,
  initialPlace,
}: PostModalProps) => {
  const { formState, handlers, submit } = usePostForm(onClose, initialPlace);

  useEffect(() => {
    if (!isOpen) {
      handlers.resetForm();
    }
  }, [isOpen, handlers]);
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.FullScreenContainer>
        <Modal.Header>
          <Modal.Title>맛집 기록</Modal.Title>
          <Modal.Close />
        </Modal.Header>

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
};
