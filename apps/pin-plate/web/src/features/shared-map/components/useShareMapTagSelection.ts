import { useMemo } from 'react';
import type { PlaceWithStats } from '@/features/place/types/place';
import {
  getPreviewTagOptions,
  getSearchedTagOptions,
  getShareableTagOptions,
  normalizeTagSearchQuery,
  RECOMMENDED_TAG_LIMIT,
} from './shareMapTagLogic';

interface Props {
  criteriaValue: string;
  places: PlaceWithStats[];
  tagSearchQuery: string;
}

export const useShareMapTagSelection = ({
  criteriaValue,
  places,
  tagSearchQuery,
}: Props) => {
  const shareableTagOptions = useMemo(
    () => getShareableTagOptions(places),
    [places],
  );

  const previewTagOptions = useMemo(
    () => getPreviewTagOptions(shareableTagOptions, criteriaValue),
    [criteriaValue, shareableTagOptions],
  );

  const recommendedTagOptions = useMemo(
    () => shareableTagOptions.slice(0, RECOMMENDED_TAG_LIMIT),
    [shareableTagOptions],
  );

  const searchedTagOptions = useMemo(
    () => getSearchedTagOptions(shareableTagOptions, tagSearchQuery),
    [shareableTagOptions, tagSearchQuery],
  );

  return {
    hasHiddenTagOptions: shareableTagOptions.length > previewTagOptions.length,
    hasTagSearchQuery: normalizeTagSearchQuery(tagSearchQuery).length > 0,
    previewTagOptions,
    recommendedTagOptions,
    searchedTagOptions,
    shareableTagOptions,
  };
};
