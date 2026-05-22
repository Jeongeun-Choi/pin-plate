import { Button } from '@pin-plate/ui';
import type { ShareableRegionOption } from '../types/shareMapDialogTypes';
import * as s from './ShareMapDialog.css';

const getRegionOptionRowClassName = (isSelectedRegion: boolean) => {
  if (isSelectedRegion) {
    return `${s.tagOptionRow} ${s.selectedTagOptionRow}`;
  }

  return s.tagOptionRow;
};

interface RegionOptionRowProps {
  regionOption: ShareableRegionOption;
  selectedRegionValue: string;
  onRegionSelect: (regionValue: string) => void;
}

const ShareMapRegionOptionRow = ({
  regionOption,
  selectedRegionValue,
  onRegionSelect,
}: RegionOptionRowProps) => {
  const isSelectedRegion = selectedRegionValue === regionOption.value;

  return (
    <Button
      key={regionOption.value}
      type="button"
      variant="outline"
      size="md"
      className={getRegionOptionRowClassName(isSelectedRegion)}
      aria-label={`${regionOption.label} ${regionOption.count}개`}
      aria-pressed={isSelectedRegion}
      onClick={() => onRegionSelect(regionOption.value)}
    >
      <span className={s.tagOptionName}>{regionOption.label}</span>
      <span className={s.tagOptionMeta}>{regionOption.count}개</span>
      {isSelectedRegion && (
        <span className={s.tagOptionSelectedText}>선택됨</span>
      )}
    </Button>
  );
};

interface RegionOptionListProps {
  regionOptions: ShareableRegionOption[];
  selectedRegionValue: string;
  onRegionSelect: (regionValue: string) => void;
}

const ShareMapRegionOptionList = ({
  regionOptions,
  selectedRegionValue,
  onRegionSelect,
}: RegionOptionListProps) => (
  <div className={s.tagOptionList}>
    {regionOptions.map((regionOption) => (
      <ShareMapRegionOptionRow
        key={regionOption.value}
        regionOption={regionOption}
        selectedRegionValue={selectedRegionValue}
        onRegionSelect={onRegionSelect}
      />
    ))}
  </div>
);

interface RegionSearchResultsProps {
  searchedRegionOptions: ShareableRegionOption[];
  selectedRegionValue: string;
  onRegionSelect: (regionValue: string) => void;
}

const ShareMapRegionSearchResults = ({
  searchedRegionOptions,
  selectedRegionValue,
  onRegionSelect,
}: RegionSearchResultsProps) => {
  if (searchedRegionOptions.length === 0) {
    return (
      <section className={s.tagGroup}>
        <h3 className={s.tagGroupHeading}>검색 결과</h3>
        <p className={s.emptyTagText}>일치하는 지역이 없어요.</p>
      </section>
    );
  }

  return (
    <section className={s.tagGroup}>
      <h3 className={s.tagGroupHeading}>검색 결과</h3>
      <ShareMapRegionOptionList
        regionOptions={searchedRegionOptions}
        selectedRegionValue={selectedRegionValue}
        onRegionSelect={onRegionSelect}
      />
    </section>
  );
};

interface RegionRecommendedOptionsProps {
  recommendedRegionOptions: ShareableRegionOption[];
  shareableRegionOptions: ShareableRegionOption[];
  selectedRegionValue: string;
  onRegionSelect: (regionValue: string) => void;
}

const ShareMapRegionRecommendedOptions = ({
  recommendedRegionOptions,
  shareableRegionOptions,
  selectedRegionValue,
  onRegionSelect,
}: RegionRecommendedOptionsProps) => (
  <div className={s.tagGroupList}>
    {recommendedRegionOptions.length > 0 && (
      <section className={s.tagGroup}>
        <h3 className={s.tagGroupHeading}>추천</h3>
        <ShareMapRegionOptionList
          regionOptions={recommendedRegionOptions}
          selectedRegionValue={selectedRegionValue}
          onRegionSelect={onRegionSelect}
        />
      </section>
    )}

    <section className={s.tagGroup}>
      <h3 className={s.tagGroupHeading}>전체 지역</h3>
      <ShareMapRegionOptionList
        regionOptions={shareableRegionOptions}
        selectedRegionValue={selectedRegionValue}
        onRegionSelect={onRegionSelect}
      />
    </section>
  </div>
);

interface Props {
  hasRegionSearchQuery: boolean;
  recommendedRegionOptions: ShareableRegionOption[];
  searchedRegionOptions: ShareableRegionOption[];
  selectedRegionValue: string;
  shareableRegionOptions: ShareableRegionOption[];
  onRegionSelect: (regionValue: string) => void;
}

export const ShareMapRegionPickerContent = ({
  hasRegionSearchQuery,
  recommendedRegionOptions,
  searchedRegionOptions,
  selectedRegionValue,
  shareableRegionOptions,
  onRegionSelect,
}: Props) => {
  if (hasRegionSearchQuery) {
    return (
      <ShareMapRegionSearchResults
        searchedRegionOptions={searchedRegionOptions}
        selectedRegionValue={selectedRegionValue}
        onRegionSelect={onRegionSelect}
      />
    );
  }

  return (
    <ShareMapRegionRecommendedOptions
      recommendedRegionOptions={recommendedRegionOptions}
      shareableRegionOptions={shareableRegionOptions}
      selectedRegionValue={selectedRegionValue}
      onRegionSelect={onRegionSelect}
    />
  );
};
