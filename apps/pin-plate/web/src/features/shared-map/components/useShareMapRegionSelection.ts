import { useMemo } from 'react';
import type { PlaceWithStats } from '@/features/place/types/place';
import {
  getPreviewRegionOptions,
  getSearchedRegionOptions,
  getShareableRegionOptions,
  hasRegionSearchQuery,
  RECOMMENDED_REGION_LIMIT,
} from './shareMapRegionLogic';

interface Props {
  criteriaValue: string;
  places: PlaceWithStats[];
  regionSearchQuery: string;
}

export const useShareMapRegionSelection = ({
  criteriaValue,
  places,
  regionSearchQuery,
}: Props) => {
  const shareableRegionOptions = useMemo(
    () => getShareableRegionOptions(places),
    [places],
  );

  const previewRegionOptions = useMemo(
    () => getPreviewRegionOptions(shareableRegionOptions, criteriaValue),
    [criteriaValue, shareableRegionOptions],
  );

  const recommendedRegionOptions = useMemo(
    () => shareableRegionOptions.slice(0, RECOMMENDED_REGION_LIMIT),
    [shareableRegionOptions],
  );

  const searchedRegionOptions = useMemo(
    () => getSearchedRegionOptions(shareableRegionOptions, regionSearchQuery),
    [regionSearchQuery, shareableRegionOptions],
  );

  return {
    hasHiddenRegionOptions:
      shareableRegionOptions.length > previewRegionOptions.length,
    hasRegionSearchQuery: hasRegionSearchQuery(regionSearchQuery),
    previewRegionOptions,
    recommendedRegionOptions,
    searchedRegionOptions,
    shareableRegionOptions,
  };
};
