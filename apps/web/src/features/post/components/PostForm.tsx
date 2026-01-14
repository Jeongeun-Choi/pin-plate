'use client';

import React, { useState, useRef, ChangeEvent, MouseEvent } from 'react';
import { Button, Input, Textarea } from '@pin-plate/ui';
import {
  container,
  header,
  content,
  photoSection,
  photoAddButton,
  photoItem,
  sectionTitle,
  starRating,
  starWrapper,
  starBase,
  starOverlay,
} from './PostForm.styles.css';
import LocationSearchModal from './LocationSearchModal';

const PostForm = () => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [rating, setRating] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoAddClick = () => {
    if (photos.length >= 5) {
      alert('사진은 최대 5개까지 등록 가능합니다.');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // 남은 슬롯 개수 체크
    const remainingSlots = 5 - photos.length;
    if (files.length > remainingSlots) {
      alert(`최대 ${remainingSlots}장까지만 더 추가할 수 있습니다.`);
      return;
    }

    const fileList = Array.from(files);

    try {
      const tempUrls = fileList.map((file) => URL.createObjectURL(file));
      setPhotos((prev) => [...prev, ...tempUrls]);

      // 1. Presigned URL 요청
      const presignedRes = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: fileList.map((f) => ({ filename: f.name, type: f.type })),
        }),
      });

      if (!presignedRes.ok) throw new Error('Failed to get presigned URLs');

      const { urls } = await presignedRes.json();

      // 2. S3로 실제 파일 업로드 (병렬 처리)
      const uploadPromises = urls.map(async (item: any, index: number) => {
        const file = fileList[index];
        await fetch(item.url, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });
        // S3 업로드 완료 후 접근 가능한 퍼블릭 URL 반환 (물음표 앞부분만)
        return item.url.split('?')[0];
      });

      await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      // input 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleStarClick = (e: MouseEvent<HTMLSpanElement>, index: number) => {
    const { offsetX } = e.nativeEvent;
    const { offsetWidth } = e.currentTarget;

    // 별의 왼쪽 절반을 클릭했는지 확인
    const isHalf = offsetX < offsetWidth / 2;
    setRating(index + (isHalf ? 0.5 : 1));
  };

  return (
    <div className={container}>
      {/* 헤더 */}
      <header className={header}>
        <button
          onClick={() => window.history.back()}
          style={{ fontSize: '18px' }}
        >
          ✕
        </button>
        <span style={{ fontWeight: 'bold' }}>맛집 기록</span>
        <Button onClick={() => alert('등록!')}>등록</Button>
      </header>

      {/* 컨텐츠 영역 */}
      <div className={content}>
        {/* 사진 업로드 */}
        <section>
          <div className={photoSection}>
            <input
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <button className={photoAddButton} onClick={handlePhotoAddClick}>
              <span>📷</span>
              <span>{photos.length}/5</span>
            </button>
            {photos.map((photo, index) => (
              <div key={index} className={photoItem}>
                <img
                  src={photo}
                  alt="preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 'inherit',
                    objectFit: 'cover',
                  }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* 장소 정보 */}
        <section>
          <h3 className={sectionTitle}>방문한 장소</h3>
          <Input
            placeholder="어디를 방문하셨나요?"
            readOnly
            value="성수동 맛집 (지도에서 선택)"
            onClick={() => setIsModalOpen(true)}
            style={{ cursor: 'pointer' }}
          />
        </section>

        {/* 별점 */}
        <section>
          <h3 className={sectionTitle}>평점 ({rating}점)</h3>
          <div className={starRating}>
            {[0, 1, 2, 3, 4].map((index) => {
              // 현재 별이 얼마나 채워져야 하는지 계산
              let fillWidth = '0%';
              if (rating >= index + 1) {
                fillWidth = '100%';
              } else if (rating === index + 0.5) {
                fillWidth = '50%';
              }

              return (
                <span
                  key={index}
                  className={starWrapper}
                  onClick={(e) => handleStarClick(e, index)}
                >
                  <span className={starBase}>★</span>
                  <span className={starOverlay} style={{ width: fillWidth }}>
                    ★
                  </span>
                </span>
              );
            })}
          </div>
        </section>

        {/* 후기 작성 */}
        <section>
          <h3 className={sectionTitle}>후기</h3>
          <Textarea
            placeholder="맛, 서비스, 분위기는 어땠나요?"
            style={{ minHeight: '150px' }}
          />
        </section>
      </div>

      <LocationSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default PostForm;
