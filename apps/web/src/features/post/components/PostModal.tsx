'use client';

import { Button, Modal } from '@pin-plate/ui';
import PostForm from './PostForm';
import { usePostForm } from '../hooks/usePostForm';
import * as styles from './styles/PostModal.styles.css';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PostModal = ({ isOpen, onClose }: PostModalProps) => {
  const { formState, handlers, submit } = usePostForm(onClose);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Container>
        <Modal.Header>
          <Modal.Title>맛집 기록</Modal.Title>
          <Modal.Close onClick={onClose} />
        </Modal.Header>

        <Modal.Body>
          <div className={styles.formContainer}>
            <PostForm formState={formState} handlers={handlers} />
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={submit} className={styles.submitButton}>
            등록하기
          </Button>
        </Modal.Footer>
      </Modal.Container>
    </Modal>
  );
};
