import { Button } from '@pin-plate/ui';
import { TAG_GROUPS } from '@/features/post/constants/tags';
import type { TagGroup } from '@/features/post/constants/tags';
import type { ShareableTagOption } from './shareMapDialogTypes';
import * as s from './ShareMapDialog.css';

const getTagOptionRowClassName = (isSelectedTag: boolean) => {
  if (isSelectedTag) {
    return `${s.tagOptionRow} ${s.selectedTagOptionRow}`;
  }

  return s.tagOptionRow;
};

interface TagOptionRowProps {
  tagOption: ShareableTagOption;
  selectedTagValue: string;
  onTagSelect: (tagValue: string) => void;
}

const ShareMapTagOptionRow = ({
  tagOption,
  selectedTagValue,
  onTagSelect,
}: TagOptionRowProps) => {
  const isSelectedTag = selectedTagValue === tagOption.value;

  return (
    <Button
      key={tagOption.value}
      type="button"
      variant="outline"
      size="md"
      className={getTagOptionRowClassName(isSelectedTag)}
      aria-label={`${tagOption.label} ${tagOption.count}개`}
      aria-pressed={isSelectedTag}
      onClick={() => onTagSelect(tagOption.value)}
    >
      <span className={s.tagOptionName}>{tagOption.label}</span>
      <span className={s.tagOptionMeta}>{tagOption.count}개</span>
      {isSelectedTag && <span className={s.tagOptionSelectedText}>선택됨</span>}
    </Button>
  );
};

interface TagOptionListProps {
  tagOptions: ShareableTagOption[];
  selectedTagValue: string;
  onTagSelect: (tagValue: string) => void;
}

const ShareMapTagOptionList = ({
  tagOptions,
  selectedTagValue,
  onTagSelect,
}: TagOptionListProps) => (
  <div className={s.tagOptionList}>
    {tagOptions.map((tagOption) => (
      <ShareMapTagOptionRow
        key={tagOption.value}
        tagOption={tagOption}
        selectedTagValue={selectedTagValue}
        onTagSelect={onTagSelect}
      />
    ))}
  </div>
);

interface TagSearchResultsProps {
  searchedTagOptions: ShareableTagOption[];
  selectedTagValue: string;
  onTagSelect: (tagValue: string) => void;
}

const ShareMapTagSearchResults = ({
  searchedTagOptions,
  selectedTagValue,
  onTagSelect,
}: TagSearchResultsProps) => {
  if (searchedTagOptions.length === 0) {
    return (
      <section className={s.tagGroup}>
        <h3 className={s.tagGroupHeading}>검색 결과</h3>
        <p className={s.emptyTagText}>일치하는 태그가 없어요.</p>
      </section>
    );
  }

  return (
    <section className={s.tagGroup}>
      <h3 className={s.tagGroupHeading}>검색 결과</h3>
      <ShareMapTagOptionList
        tagOptions={searchedTagOptions}
        selectedTagValue={selectedTagValue}
        onTagSelect={onTagSelect}
      />
    </section>
  );
};

interface GroupedTagOptionsProps {
  shareableTagOptions: ShareableTagOption[];
  recommendedTagOptions: ShareableTagOption[];
  selectedTagValue: string;
  onTagSelect: (tagValue: string) => void;
}

const ShareMapGroupedTagOptions = ({
  shareableTagOptions,
  recommendedTagOptions,
  selectedTagValue,
  onTagSelect,
}: GroupedTagOptionsProps) => (
  <div className={s.tagGroupList}>
    {recommendedTagOptions.length > 0 && (
      <section className={s.tagGroup}>
        <h3 className={s.tagGroupHeading}>추천</h3>
        <ShareMapTagOptionList
          tagOptions={recommendedTagOptions}
          selectedTagValue={selectedTagValue}
          onTagSelect={onTagSelect}
        />
      </section>
    )}

    {(Object.keys(TAG_GROUPS) as TagGroup[]).map((tagGroup) => {
      const tagOptionsInGroup = shareableTagOptions.filter(
        (tagOption) => tagOption.group === tagGroup,
      );

      if (tagOptionsInGroup.length === 0) {
        return null;
      }

      return (
        <section key={tagGroup} className={s.tagGroup}>
          <h3 className={s.tagGroupHeading}>{TAG_GROUPS[tagGroup].label}</h3>
          <ShareMapTagOptionList
            tagOptions={tagOptionsInGroup}
            selectedTagValue={selectedTagValue}
            onTagSelect={onTagSelect}
          />
        </section>
      );
    })}
  </div>
);

interface Props {
  hasTagSearchQuery: boolean;
  searchedTagOptions: ShareableTagOption[];
  shareableTagOptions: ShareableTagOption[];
  recommendedTagOptions: ShareableTagOption[];
  selectedTagValue: string;
  onTagSelect: (tagValue: string) => void;
}

export const ShareMapTagPickerContent = ({
  hasTagSearchQuery,
  searchedTagOptions,
  shareableTagOptions,
  recommendedTagOptions,
  selectedTagValue,
  onTagSelect,
}: Props) => {
  if (hasTagSearchQuery) {
    return (
      <ShareMapTagSearchResults
        searchedTagOptions={searchedTagOptions}
        selectedTagValue={selectedTagValue}
        onTagSelect={onTagSelect}
      />
    );
  }

  return (
    <ShareMapGroupedTagOptions
      shareableTagOptions={shareableTagOptions}
      recommendedTagOptions={recommendedTagOptions}
      selectedTagValue={selectedTagValue}
      onTagSelect={onTagSelect}
    />
  );
};
