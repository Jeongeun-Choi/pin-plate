'use client';

import { useRef } from 'react';
import { Button } from '@pin-plate/ui';
import PostForm, { PostFormHandle } from './PostForm';
import * as styles from './PostModal.styles.css';

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
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        {/* 모달 헤더 (Layout 영역) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            borderBottom: '1px solid #eee',
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
          <span style={{ fontWeight: 'bold', fontSize: '18px' }}>
            맛집 기록
          </span>
          <Button onClick={handleRegister}>등록</Button>
        </div>

        {/* 폼 컨텐츠 영역 (Content 영역) */}
        <div style={{ padding: '20px', overflowY: 'auto', height: '100%' }}>
          <PostForm ref={formRef} />
        </div>
      </div>
    </div>
  );
};
