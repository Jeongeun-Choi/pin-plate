'use client';

import { Button, IcDismiss } from '@pin-plate/ui';
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
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.content}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-modal-title"
      >
        {/* 모달 헤더 (Layout 영역) */}
        <header className={styles.header}>
          <Button
            type="button"
            onClick={onClose}
            className={styles.headerCloseButton}
            aria-label="닫기"
          >
            <IcDismiss />
          </Button>
          <span id="post-modal-title" className={styles.headerTitle}>
            맛집 기록
          </span>
          <Button onClick={submit}>등록</Button>
        </header>

        {/* 폼 컨텐츠 영역 (Content 영역) */}
        <div className={styles.formContainer}>
          <PostForm formState={formState} handlers={handlers} />
        </div>
      </div>
    </div>
  );
};
