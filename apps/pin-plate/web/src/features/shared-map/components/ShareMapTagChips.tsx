import { Button, TagChip } from '@pin-plate/ui';
import type { ShareableTagOption } from '../types/shareMapDialogTypes';
import * as s from './ShareMapDialog.css';

interface Props {
  selectedTagValue: string;
  previewTagOptions: ShareableTagOption[];
  hasHiddenTagOptions: boolean;
  onTagSelect: (tagValue: string) => void;
  onTagPickerOpen: () => void;
}

export const ShareMapTagChips = ({
  selectedTagValue,
  previewTagOptions,
  hasHiddenTagOptions,
  onTagSelect,
  onTagPickerOpen,
}: Props) => {
  if (previewTagOptions.length === 0) {
    return (
      <fieldset className={s.tagFieldset}>
        <legend className={s.tagLegend}>공유할 태그</legend>
        <p className={s.emptyTagText}>태그가 있는 장소가 없어요.</p>
      </fieldset>
    );
  }

  return (
    <fieldset className={s.tagFieldset}>
      <legend className={s.tagLegend}>공유할 태그</legend>
      <div className={s.tagChipGrid}>
        {previewTagOptions.map((tagOption) => {
          const isSelectedTag = selectedTagValue === tagOption.value;

          return (
            <TagChip
              key={tagOption.value}
              label={`${tagOption.label} ${tagOption.count}개`}
              selected={isSelectedTag}
              onClick={() => onTagSelect(tagOption.value)}
            />
          );
        })}
        {hasHiddenTagOptions && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onTagPickerOpen}
          >
            태그 더 보기
          </Button>
        )}
      </div>
    </fieldset>
  );
};
