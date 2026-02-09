import { ChangeEvent, useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { Rate, Textarea, IcSearch } from '@pin-plate/ui';
import RatingBadge from '@/components/common/RatingBadge';
import AddPhotoButton from '@/components/common/AddPhotoButton';
import * as styles from './styles/PostForm.styles.css';
import LocationSearch from './LocationSearch';
import MobileLocationSearch from './MobileLocationSearch';
import { KakaoPlace } from '../types/search';
import SelectedPlace from './SelectedPlace';

interface PostFormProps {
  formState: {
    content: string;
    rating: number;
    photos: string[];
    selectedPlace: KakaoPlace | null;
    currentLocation?: { lat: number; lng: number };
  };
  handlers: {
    setContent: (content: string) => void;
    setRating: (rating: number) => void;
    handleUploadAndSetImages: (files: File[]) => void;
    handleRemovePhoto: (index: number) => void;
    fetchCurrentLocation: () => void;
    handlePlaceSelect: (place: KakaoPlace | null) => void;
  };
}

const PostForm = ({ formState, handlers }: PostFormProps) => {
  const { content, rating, photos, selectedPlace, currentLocation } = formState;

  const {
    setContent,
    setRating,
    handleUploadAndSetImages,
    handleRemovePhoto,
    handlePlaceSelect,
    fetchCurrentLocation,
  } = handlers;

  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  useEffect(() => {
    fetchCurrentLocation();
  }, [fetchCurrentLocation]);

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

  return (
    <>
      <MobileLocationSearch
        isOpen={isMobileSearchOpen}
        onClose={() => setIsMobileSearchOpen(false)}
        onSelectPlace={handlePlaceSelect}
        currentLocation={currentLocation}
      />

      <div className={styles.form}>
        <div className={styles.fieldWrapper}>
          {selectedPlace ? (
            <SelectedPlace
              place={selectedPlace}
              onReset={() => handlePlaceSelect(null)}
            />
          ) : (
            <>
              <label htmlFor="location" className={styles.label}>
                장소 검색
              </label>

              {/* Mobile Trigger Button */}
              <button
                type="button"
                className={styles.mobileSearchTrigger}
                onClick={() => setIsMobileSearchOpen(true)}
              >
                <div className={styles.mobileSearchPlaceholder}>
                  장소를 입력하세요
                </div>
                <div className={styles.mobileSearchIcon}>
                  <IcSearch width={20} height={20} />
                  <span>검색</span>
                </div>
              </button>

              {/* Desktop Search Component */}
              <div className={styles.desktopSearchContainer}>
                <LocationSearch
                  currentLocation={currentLocation}
                  onSelectPlace={handlePlaceSelect}
                />
              </div>
            </>
          )}
        </div>

        <div className={styles.fieldWrapper}>
          <label className={styles.label}>평점</label>
          <div className={styles.ratingContainer}>
            <Rate value={rating} onChange={setRating} />
            <RatingBadge score={rating} />
          </div>
        </div>

        <div className={styles.fieldWrapper}>
          <label className={styles.label}>상세 설명</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="맛, 서비스, 분위기는 어땠나요?"
          />
        </div>

        <div className={styles.fieldWrapper}>
          <label className={styles.label}>사진</label>
          <div className={styles.imageList}>
            <input
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <AddPhotoButton onClick={handlePhotoAddClick} />
            {photos.map((image, index) => (
              <div key={index} style={{ position: 'relative' }}>
                <Image
                  src={image}
                  width={110}
                  height={110}
                  alt={`uploaded-${index}`}
                  className={styles.imageItem}
                />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  style={{
                    position: 'absolute',
                    top: -5,
                    right: -5,
                    background: 'black',
                    color: 'white',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

PostForm.displayName = 'PostForm';

export default PostForm;
