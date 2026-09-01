'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { IcFork } from '@pin-plate/ui';
import { getTrustedImageUrl } from '@/features/image/utils/imageReference';
import * as styles from './styles/PostDetailModal.styles.css';

interface Props {
  imageUrls: string[];
  placeName: string;
}

export const PostImageCarousel = ({ imageUrls, placeName }: Props) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    loop: false,
  });

  const trustedImageUrls = useMemo(
    () =>
      imageUrls
        .map((imageUrl) => getTrustedImageUrl(imageUrl) ?? imageUrl)
        .filter(Boolean),
    [imageUrls],
  );

  const updateCarouselState = useCallback(() => {
    if (!emblaApi) return;

    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const scrollToPrevious = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollToNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const scrollToImage = useCallback(
    (imageIndex: number) => {
      emblaApi?.scrollTo(imageIndex);
    },
    [emblaApi],
  );

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on('select', updateCarouselState);
    emblaApi.on('reInit', updateCarouselState);
    emblaApi.reInit();

    return () => {
      emblaApi.off('select', updateCarouselState);
      emblaApi.off('reInit', updateCarouselState);
    };
  }, [emblaApi, trustedImageUrls.length, updateCarouselState]);

  if (trustedImageUrls.length === 0) {
    return (
      <div className={styles.imageContainer}>
        <div className={styles.imagePlaceholder}>
          <span className={styles.imagePlaceholderIcon}>
            <IcFork size={72} color="currentColor" />
          </span>
        </div>
      </div>
    );
  }

  if (trustedImageUrls.length === 1) {
    return (
      <div className={styles.imageContainer}>
        <Image
          src={trustedImageUrls[0]}
          alt={`${placeName} 사진`}
          fill
          sizes="(min-width: 768px) 450px, 100vw"
          className={styles.postImage}
          priority
        />
      </div>
    );
  }

  return (
    <div
      className={styles.imageContainer}
      role="region"
      aria-label={`${placeName} 사진 슬라이더`}
    >
      <div className={styles.carouselViewport} ref={emblaRef}>
        <div className={styles.carouselContainer}>
          {trustedImageUrls.map((imageUrl, index) => (
            <div className={styles.carouselSlide} key={`${imageUrl}-${index}`}>
              <Image
                src={imageUrl}
                alt={`${placeName} 사진 ${index + 1}`}
                fill
                sizes="(min-width: 768px) 450px, 100vw"
                className={styles.postImage}
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        className={styles.carouselPrevButton}
        onClick={scrollToPrevious}
        disabled={selectedIndex === 0}
        aria-label="이전 사진 보기"
      >
        ‹
      </button>
      <button
        type="button"
        className={styles.carouselNextButton}
        onClick={scrollToNext}
        disabled={selectedIndex === trustedImageUrls.length - 1}
        aria-label="다음 사진 보기"
      >
        ›
      </button>

      <div className={styles.carouselStatus} aria-live="polite">
        {selectedIndex + 1} / {trustedImageUrls.length}
      </div>

      <div className={styles.carouselDots} aria-label="사진 선택">
        {trustedImageUrls.map((imageUrl, index) => (
          <button
            type="button"
            key={`${imageUrl}-${index}`}
            className={
              index === selectedIndex
                ? styles.carouselDotSelected
                : styles.carouselDot
            }
            onClick={() => scrollToImage(index)}
            aria-label={`${index + 1}번째 사진 보기`}
            aria-current={index === selectedIndex ? 'true' : undefined}
          />
        ))}
      </div>
    </div>
  );
};
