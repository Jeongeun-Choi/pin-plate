'use client';

import { useRef } from 'react';
import { Button } from '@pin-plate/ui';
import PostForm, { PostFormHandle } from './PostForm';
import * as styles from './styles/PostModal.styles.css';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PostModal = ({ isOpen, onClose }: PostModalProps) => {
  const formRef = useRef<PostFormHandle>(null);

  const handleRegister = () => {
    // 자식 컴포넌트(PostForm)의 submit 함수 호출
    formRef.current?.submit();
  };

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
          <button
            type="button"
            onClick={onClose}
            className={styles.headerCloseButton}
            aria-label="닫기"
          >
            {' '}
            ✕
          </button>
          <span id="post-modal-title" className={styles.headerTitle}>
            맛집 기록
          </span>
          <Button onClick={handleRegister}>등록</Button>
        </header>

        {/* 폼 컨텐츠 영역 (Content 영역) */}
        <div className={styles.formContainer}>
          <PostForm ref={formRef} />
        </div>
      </div>
    </div>
  );
};
