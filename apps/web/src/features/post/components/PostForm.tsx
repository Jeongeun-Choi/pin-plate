'use client';

import React, {
  useState,
  useRef,
  ChangeEvent,
  MouseEvent,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Input, Textarea } from '@pin-plate/ui';
import {
  content,
  photoSection,
  photoAddButton,
  photoItem,
  sectionTitle,
  starRating,
  starWrapper,
  starBase,
  starOverlay,
  hiddenInput,
  previewImage,
  clickableInput,
  textarea,
} from './styles/PostForm.styles.css';
import LocationSearchModal from './LocationSearchModal';
import { KakaoPlace } from '../types/search';

export interface PostFormHandle {
  submit: () => void;
}

const PostForm = forwardRef<PostFormHandle>((_, ref) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [rating, setRating] = useState(0);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  }>();
  const [selectedPlace, setSelectedPlace] = useState<KakaoPlace | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 부모 컴포넌트에서 호출할 수 있도록 submit 함수 노출
  useImperativeHandle(ref, () => ({
    submit: () => {
      alert(
        `등록 시도!\n별점: ${rating}\n사진: ${photos.length}장\n장소: ${selectedPlace?.place_name || '미선택'}`,
      );
      // 실제 API 호출 로직이 여기 들어갑니다.
    },
  }));

  const handleLocationSearchOpen = () => {
    setIsLocationModalOpen(true);
    // 모달 열 때 현재 위치 확보 시도
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('위치 정보를 가져올 수 없습니다.', error);
        },
      );
    }
  };

  const handlePlaceSelect = (place: KakaoPlace) => {
    setSelectedPlace(place);
    setIsLocationModalOpen(false);
  };

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
    const isHalf = offsetX < offsetWidth / 2;
    setRating(index + (isHalf ? 0.5 : 1));
  };

  return (
    <div className={content}>
      {/* 사진 업로드 */}
      <section>
        <div className={photoSection}>
          <input
            type="file"
            accept="image/*"
            multiple
            className={hiddenInput}
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <button
            type="button"
            className={photoAddButton}
            onClick={handlePhotoAddClick}
            aria-label="사진 추가하기"
          >
            <span aria-hidden="true">📷</span>
            <span>{photos.length}/5</span>
          </button>
          {photos.map((photo, index) => (
            <div key={index} className={photoItem}>
              <img src={photo} alt="preview" className={previewImage} />
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
          value={selectedPlace?.place_name || ''}
          onClick={handleLocationSearchOpen}
          className={clickableInput}
          title="장소 검색 팝업 열기"
          aria-haspopup="dialog"
          role="button"
        />
      </section>

      {/* 별점 */}
      <section>
        <h3 className={sectionTitle}>평점 ({rating}점)</h3>
        <div className={starRating}>
          {[0, 1, 2, 3, 4].map((index) => {
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
          className={textarea}
        />
      </section>

      <LocationSearchModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={currentLocation}
        onSelectPlace={handlePlaceSelect}
      />
    </div>
  );
});

PostForm.displayName = 'PostForm';

export default PostForm;
