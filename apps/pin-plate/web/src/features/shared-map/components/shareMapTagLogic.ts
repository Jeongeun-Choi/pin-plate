import { ALL_TAGS } from '@/features/post/constants/tags';
import type { PlaceWithStats } from '@/features/place/types/place';
import type {
  ShareableTagOption,
  ShareableTagOptionWithOrder,
} from './shareMapDialogTypes';

export const TAG_CHIP_PREVIEW_LIMIT = 8;
export const RECOMMENDED_TAG_LIMIT = 5;

export const getShareableTagOptions = (
  places: PlaceWithStats[],
): ShareableTagOption[] => {
  const tagCounts = new Map<string, number>();

  places.forEach((place) => {
    new Set(place.tags).forEach((tagId) => {
      tagCounts.set(tagId, (tagCounts.get(tagId) ?? 0) + 1);
    });
  });

  return ALL_TAGS.map<ShareableTagOptionWithOrder>((tag, order) => ({
    value: tag.id,
    label: tag.label,
    group: tag.group,
    count: tagCounts.get(tag.id) ?? 0,
    order,
  }))
    .filter((tagOption) => tagOption.count > 0)
    .sort(
      (firstTagOption, secondTagOption) =>
        secondTagOption.count - firstTagOption.count ||
        firstTagOption.order - secondTagOption.order,
    )
    .map((tagOption) => ({
      value: tagOption.value,
      label: tagOption.label,
      group: tagOption.group,
      count: tagOption.count,
    }));
};

export const getPreviewTagOptions = (
  shareableTagOptions: ShareableTagOption[],
  selectedTagValue: string,
) => {
  const previewTagOptions = shareableTagOptions.slice(
    0,
    TAG_CHIP_PREVIEW_LIMIT,
  );
  const hasSelectedTagPreview = previewTagOptions.some(
    (tagOption) => tagOption.value === selectedTagValue,
  );

  if (hasSelectedTagPreview || !selectedTagValue) {
    return previewTagOptions;
  }

  const selectedTagOption = shareableTagOptions.find(
    (tagOption) => tagOption.value === selectedTagValue,
  );

  if (!selectedTagOption) {
    return previewTagOptions;
  }

  return [
    ...previewTagOptions.slice(0, TAG_CHIP_PREVIEW_LIMIT - 1),
    selectedTagOption,
  ];
};

export const normalizeTagSearchQuery = (tagSearchQuery: string) =>
  tagSearchQuery.trim().toLowerCase();

const getTagSearchRank = (
  tagOption: ShareableTagOption,
  normalizedTagSearchQuery: string,
) => {
  const normalizedLabel = tagOption.label.toLowerCase();
  const normalizedValue = tagOption.value.toLowerCase();

  if (
    normalizedLabel === normalizedTagSearchQuery ||
    normalizedValue === normalizedTagSearchQuery
  ) {
    return 0;
  }
  if (
    normalizedLabel.startsWith(normalizedTagSearchQuery) ||
    normalizedValue.startsWith(normalizedTagSearchQuery)
  ) {
    return 1;
  }
  if (
    normalizedLabel.includes(normalizedTagSearchQuery) ||
    normalizedValue.includes(normalizedTagSearchQuery)
  ) {
    return 2;
  }
  return null;
};

export const getSearchedTagOptions = (
  shareableTagOptions: ShareableTagOption[],
  tagSearchQuery: string,
) => {
  const normalizedTagSearchQuery = normalizeTagSearchQuery(tagSearchQuery);

  if (!normalizedTagSearchQuery) {
    return [];
  }

  return shareableTagOptions
    .map((tagOption, order) => ({
      tagOption,
      order,
      searchRank: getTagSearchRank(tagOption, normalizedTagSearchQuery),
    }))
    .filter((tagSearchResult) => tagSearchResult.searchRank !== null)
    .sort((firstResult, secondResult) => {
      if (firstResult.searchRank !== secondResult.searchRank) {
        return Number(firstResult.searchRank) - Number(secondResult.searchRank);
      }
      return (
        secondResult.tagOption.count - firstResult.tagOption.count ||
        firstResult.order - secondResult.order
      );
    })
    .map((tagSearchResult) => tagSearchResult.tagOption);
};
