'use client';

import { useState } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { Modal, Button, Spinner } from '@pin-plate/ui';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import {
  currentLocationAtom,
  nearbySearchCuisineAtom,
  nearbySearchRadiusKmAtom,
} from '@/features/map/atoms';
import { DISTANCE_OPTIONS } from '../constants/distanceOptions';
import { CUISINE_OPTIONS } from '../constants/cuisineOptions';
import type { CuisineId } from '../constants/cuisineTypes';
import { useNearbySearch } from '../hooks/useNearbySearch';
import * as s from './NearbySearchSheet.css';

interface Props {
  onClose: () => void;
}

export const NearbySearchSheet = ({ onClose }: Props) => {
  const [radiusKm, setRadiusKm] = useAtom(nearbySearchRadiusKmAtom);
  const [cuisine, setCuisine] = useAtom(nearbySearchCuisineAtom);
  const setCurrentLocation = useSetAtom(currentLocationAtom);

  const [isEmpty, setIsEmpty] = useState(false);
  const [isError, setIsError] = useState(false);

  const { fetchLocation } = useCurrentLocation();
  const { mutateAsync, isPending } = useNearbySearch();

  const radiusLabel = radiusKm < 1 ? `${radiusKm * 1000}m` : `${radiusKm}km`;

  const sliderValue = DISTANCE_OPTIONS.findIndex((o) => o.valueKm === radiusKm);
  const sliderMax = DISTANCE_OPTIONS.length - 1;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = parseInt(e.target.value, 10);
    setRadiusKm(DISTANCE_OPTIONS[idx].valueKm);
  };

  const handleSearch = async () => {
    setIsEmpty(false);
    setIsError(false);

    try {
      const location = await fetchLocation();
      setCurrentLocation(location);
    } catch {
      // 위치 권한 거부여도 currentLocationAtom이 null이면 mutation에서 처리
    }

    try {
      const places = await mutateAsync();
      if (places.length === 0) {
        setIsEmpty(true);
      } else {
        onClose();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message === 'location_required') {
        setIsError(true);
      } else {
        setIsError(true);
      }
    }
  };

  return (
    <Modal isOpen onClose={onClose}>
      <Modal.Container>
        <Modal.Header>
          <div className={s.header}>
            <Modal.Title>검색 반경 설정</Modal.Title>
            <span className={s.subtitle}>
              현재 위치를 기준으로 맛집을 찾습니다.
            </span>
          </div>
          <Modal.Close />
        </Modal.Header>
        <Modal.Body>
          <div className={s.body}>
            <div className={s.section}>
              <div className={s.sectionHeader}>
                <span className={s.sectionLabel}>거리 반경</span>
                <span className={s.radiusValue}>{radiusLabel}</span>
              </div>
              <input
                type="range"
                min={0}
                max={sliderMax}
                value={sliderValue === -1 ? 1 : sliderValue}
                onChange={handleSliderChange}
                className={s.slider}
                aria-label={`거리 반경 선택, 현재 ${radiusLabel}`}
              />
              <div
                className={s.chipRow}
                role="group"
                aria-label="거리 빠른 선택"
              >
                {DISTANCE_OPTIONS.map((option) => (
                  <button
                    key={option.valueKm}
                    type="button"
                    className={`${s.chip} ${radiusKm === option.valueKm ? s.chipSelected : ''}`}
                    onClick={() => setRadiusKm(option.valueKm)}
                    aria-pressed={radiusKm === option.valueKm}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={s.section}>
              <span className={s.sectionLabel}>음식 종류</span>
              <div
                className={s.chipRow}
                role="radiogroup"
                aria-label="음식 종류 선택"
              >
                {CUISINE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={cuisine === option.id}
                    className={`${s.chip} ${cuisine === option.id ? s.chipSelected : ''}`}
                    onClick={() => setCuisine(option.id as CuisineId)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {isEmpty && (
              <p className={s.emptyMessage} role="status">
                주변에 결과가 없습니다. 반경을 늘려보세요.
              </p>
            )}
            {isError && (
              <p className={s.errorMessage} role="alert">
                위치 정보가 필요하거나 검색에 실패했습니다. 다시 시도해주세요.
              </p>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="solid"
            size="lg"
            style={{ width: '100%' }}
            onClick={handleSearch}
            disabled={isPending}
          >
            {isPending ? <Spinner size={18} /> : '결과 보기'}
          </Button>
        </Modal.Footer>
      </Modal.Container>
    </Modal>
  );
};
