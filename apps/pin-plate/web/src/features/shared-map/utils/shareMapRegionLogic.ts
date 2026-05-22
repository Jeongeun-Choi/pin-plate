import type { PlaceWithStats } from '@/features/place/types/place';
import type { ShareableRegionOption } from '../types/shareMapDialogTypes';

export const REGION_CHIP_PREVIEW_LIMIT = 8;
export const RECOMMENDED_REGION_LIMIT = 5;

const broadAreaNames = new Set([
  '서울',
  '서울시',
  '서울특별시',
  '경기',
  '경기도',
  '부산',
  '부산시',
  '부산광역시',
  '대구',
  '대구시',
  '대구광역시',
  '인천',
  '인천시',
  '인천광역시',
  '광주',
  '광주시',
  '광주광역시',
  '대전',
  '대전시',
  '대전광역시',
  '울산',
  '울산시',
  '울산광역시',
]);

const cityNameAliases = new Map([
  ['서울', '서울시'],
  ['서울특별시', '서울시'],
  ['부산', '부산시'],
  ['부산광역시', '부산시'],
  ['대구', '대구시'],
  ['대구광역시', '대구시'],
  ['인천', '인천시'],
  ['인천광역시', '인천시'],
  ['광주', '광주시'],
  ['광주광역시', '광주시'],
  ['대전', '대전시'],
  ['대전광역시', '대전시'],
  ['울산', '울산시'],
  ['울산광역시', '울산시'],
]);

const findAreaToken = (tokens: string[], suffixes: string[]) =>
  tokens.find(
    (token) =>
      !broadAreaNames.has(token) &&
      suffixes.some((suffix) => token.endsWith(suffix)),
  );

const normalizeRegionSearchQuery = (searchQuery: string) =>
  searchQuery.trim().toLowerCase();

export const getRegionNameFromAddress = (address: string) => {
  const tokens = address.trim().split(/\s+/).filter(Boolean);
  const districtName = findAreaToken(tokens, ['구', '군']);
  const broadCityName = tokens.find((token) => cityNameAliases.has(token));
  const cityName = broadCityName ?? findAreaToken(tokens, ['시']);

  if (cityName && districtName) {
    return `${cityNameAliases.get(cityName) ?? cityName} ${districtName}`;
  }

  const areaName =
    districtName ??
    (broadCityName ? undefined : cityName) ??
    findAreaToken(tokens, ['동', '읍', '면']);

  return areaName;
};

const getRegionSearchText = (place: PlaceWithStats, regionName: string) =>
  `${regionName} ${place.address}`.toLowerCase();

export const getShareableRegionOptions = (
  places: PlaceWithStats[],
): ShareableRegionOption[] => {
  const regionOptionsByValue = new Map<string, ShareableRegionOption>();

  places.forEach((place) => {
    const regionName = getRegionNameFromAddress(place.address);
    if (!regionName) {
      return;
    }

    const existingOption = regionOptionsByValue.get(regionName);
    if (existingOption) {
      regionOptionsByValue.set(regionName, {
        ...existingOption,
        count: existingOption.count + 1,
        searchText: `${existingOption.searchText} ${getRegionSearchText(
          place,
          regionName,
        )}`,
      });
      return;
    }

    regionOptionsByValue.set(regionName, {
      value: regionName,
      label: regionName,
      count: 1,
      searchText: getRegionSearchText(place, regionName),
    });
  });

  return Array.from(regionOptionsByValue.values()).sort(
    (firstRegionOption, secondRegionOption) =>
      secondRegionOption.count - firstRegionOption.count ||
      firstRegionOption.label.localeCompare(secondRegionOption.label, 'ko'),
  );
};

export const getPreviewRegionOptions = (
  shareableRegionOptions: ShareableRegionOption[],
  selectedRegionValue: string,
) => {
  const previewRegionOptions = shareableRegionOptions.slice(
    0,
    REGION_CHIP_PREVIEW_LIMIT,
  );
  const hasSelectedRegionPreview = previewRegionOptions.some(
    (regionOption) => regionOption.value === selectedRegionValue,
  );

  if (hasSelectedRegionPreview || !selectedRegionValue) {
    return previewRegionOptions;
  }

  const selectedRegionOption = shareableRegionOptions.find(
    (regionOption) => regionOption.value === selectedRegionValue,
  );

  if (!selectedRegionOption) {
    return previewRegionOptions;
  }

  return [
    ...previewRegionOptions.slice(0, REGION_CHIP_PREVIEW_LIMIT - 1),
    selectedRegionOption,
  ];
};

export const getSearchedRegionOptions = (
  shareableRegionOptions: ShareableRegionOption[],
  regionSearchQuery: string,
) => {
  const normalizedSearchQuery = normalizeRegionSearchQuery(regionSearchQuery);

  if (!normalizedSearchQuery) {
    return [];
  }

  return shareableRegionOptions.filter((regionOption) =>
    regionOption.searchText.includes(normalizedSearchQuery),
  );
};

export const hasRegionSearchQuery = (regionSearchQuery: string) =>
  normalizeRegionSearchQuery(regionSearchQuery).length > 0;

export const doesPlaceMatchRegion = (
  place: PlaceWithStats,
  regionValue: string,
) => getRegionNameFromAddress(place.address) === regionValue;
