'use client';

import { useRef, ChangeEvent, MouseEvent } from 'react';
import { Input, Textarea } from '@pin-plate/ui';
import {
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

interface PostFormProps {
  formState: {
    content: string;
    rating: number;
    photos: string[];
    selectedPlace: KakaoPlace | null;
    isLocationModalOpen: boolean;
    currentLocation?: { lat: number; lng: number };
  };
  handlers: {
    setContent: (content: string) => void;
    setRating: (rating: number) => void;
    handleUploadAndSetImages: (files: File[]) => void;
    handleLocationSearchOpen: () => void;
    handlePlaceSelect: (place: KakaoPlace) => void;
    handleLocationModalClose: () => void;
  };
}

const PostForm = ({ formState, handlers }: PostFormProps) => {
  const {
    content,
    rating,
    photos,
    selectedPlace,
    isLocationModalOpen,
    currentLocation,
  } = formState;

  const {
    setContent,
    setRating,
    handleUploadAndSetImages,
    handleLocationSearchOpen,
    handlePlaceSelect,
    handleLocationModalClose,
  } = handlers;

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

    handleUploadAndSetImages(Array.from(files));

    // input 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </section>

      <LocationSearchModal
        isOpen={isLocationModalOpen}
        onClose={handleLocationModalClose}
        currentLocation={currentLocation}
        onSelectPlace={handlePlaceSelect}
      />
    </div>
  );
};

PostForm.displayName = 'PostForm';

export default PostForm;
