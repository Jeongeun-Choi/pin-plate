'use client';

import { Toast, ToastPosition, ToastViewport } from '@pin-plate/ui';
import { useState } from 'react';
import { useToast } from '@/providers/ToastProvider';
import * as s from './page.css';

const positionOptions = [
  { label: 'Responsive', value: 'responsive' },
  { label: 'Top Right', value: 'top-right' },
  { label: 'Top Center', value: 'top-center' },
  { label: 'Bottom Center', value: 'bottom-center' },
] satisfies { label: string; value: ToastPosition }[];

const staticToastSamples = [
  {
    title: '내 지도에 저장했어요',
    description: '저장한 장소에서 다시 확인할 수 있어요.',
    variant: 'default',
  },
  {
    title: '게시글이 저장됐어요',
    description: '내 컬렉션에 새로운 맛집이 추가됐어요.',
    variant: 'success',
  },
  {
    title: '업로드에 실패했어요',
    description: '파일 크기를 확인하고 다시 시도해 주세요.',
    variant: 'error',
  },
  {
    title: '이미 저장된 장소예요',
    description: '기존 장소 정보를 불러왔어요.',
    variant: 'info',
  },
] satisfies {
  title: string;
  description: string;
  variant: 'default' | 'success' | 'error' | 'info';
}[];

export const ToastPreviewClient = () => {
  const [previewPosition, setPreviewPosition] =
    useState<ToastPosition>('responsive');
  const [isPositionPreviewVisible, setIsPositionPreviewVisible] =
    useState(true);

  const { showErrorToast, showSuccessToast, showToast } = useToast();

  const showDefaultToast = () => {
    showToast({
      title: '장바구니에 담았어요',
      description: '저장한 메뉴를 주문 전 다시 확인할 수 있어요.',
      actionLabel: '보기',
      onAction: () => undefined,
    });
  };

  const showSuccessSampleToast = () => {
    showSuccessToast({
      title: '레시피가 저장됐어요',
      description: '내 컬렉션에서 확인할 수 있어요.',
    });
  };

  const showErrorSampleToast = () => {
    showErrorToast({
      title: '업로드에 실패했어요',
      description: '파일 크기를 확인하고 다시 시도해 주세요.',
      isDismissible: true,
    });
  };

  const showInfoToast = () => {
    showToast({
      title: '새로운 레시피가 추가됐어요',
      description: '오늘의 추천 요리를 확인해 보세요.',
      variant: 'info',
    });
  };

  const togglePositionPreview = () => {
    setIsPositionPreviewVisible(
      (currentIsPositionPreviewVisible) => !currentIsPositionPreviewVisible,
    );
  };

  return (
    <main className={s.page}>
      <section className={s.headerSection}>
        <div>
          <p className={s.eyebrow}>Pin Plate UI</p>
          <h1 className={s.heading}>Toast Preview</h1>
        </div>
        <button
          className={s.secondaryButton}
          type="button"
          onClick={togglePositionPreview}
        >
          {isPositionPreviewVisible
            ? '위치 미리보기 끄기'
            : '위치 미리보기 켜기'}
        </button>
      </section>

      <section className={s.controlSection} aria-labelledby="position-heading">
        <h2 className={s.sectionHeading} id="position-heading">
          Position
        </h2>
        <div className={s.segmentedControl} role="group">
          {positionOptions.map((positionOption) => (
            <button
              key={positionOption.value}
              className={
                previewPosition === positionOption.value
                  ? `${s.segmentButton} ${s.segmentButtonSelected}`
                  : s.segmentButton
              }
              type="button"
              aria-pressed={previewPosition === positionOption.value}
              onClick={() => setPreviewPosition(positionOption.value)}
            >
              {positionOption.label}
            </button>
          ))}
        </div>
      </section>

      <section className={s.controlSection} aria-labelledby="trigger-heading">
        <h2 className={s.sectionHeading} id="trigger-heading">
          Trigger
        </h2>
        <div className={s.triggerGrid}>
          <button
            className={s.primaryButton}
            type="button"
            onClick={showDefaultToast}
          >
            Default + Action
          </button>
          <button
            className={s.primaryButton}
            type="button"
            onClick={showSuccessSampleToast}
          >
            Success
          </button>
          <button
            className={s.primaryButton}
            type="button"
            onClick={showErrorSampleToast}
          >
            Error + Dismiss
          </button>
          <button
            className={s.primaryButton}
            type="button"
            onClick={showInfoToast}
          >
            Info
          </button>
        </div>
      </section>

      <section className={s.previewSection} aria-labelledby="variants-heading">
        <h2 className={s.sectionHeading} id="variants-heading">
          Variants
        </h2>
        <div className={s.toastGrid}>
          {staticToastSamples.map((toastSample) => (
            <Toast
              key={toastSample.variant}
              title={toastSample.title}
              description={toastSample.description}
              variant={toastSample.variant}
            />
          ))}
          <Toast
            title="장바구니에 담았어요"
            description="저장한 메뉴를 주문 전 다시 확인할 수 있어요."
            actionLabel="보기"
            onAction={() => undefined}
          />
          <Toast
            title="직접 닫을 수 있는 알림"
            description="dismiss 버튼이 필요한 케이스만 켜서 사용해요."
            isDismissible
            onDismiss={() => undefined}
          />
        </div>
      </section>

      {isPositionPreviewVisible ? (
        <ToastViewport position={previewPosition}>
          <Toast
            title="위치 미리보기"
            description="선택한 position prop으로 렌더링 중이에요."
            variant="success"
          />
        </ToastViewport>
      ) : null}
    </main>
  );
};
