import { Button, TagChip } from '@pin-plate/ui';
import type { ShareableRegionOption } from './shareMapDialogTypes';
import * as s from './ShareMapDialog.css';

interface Props {
  selectedRegionValue: string;
  previewRegionOptions: ShareableRegionOption[];
  hasHiddenRegionOptions: boolean;
  onRegionSelect: (regionValue: string) => void;
  onRegionPickerOpen: () => void;
}

export const ShareMapRegionChips = ({
  selectedRegionValue,
  previewRegionOptions,
  hasHiddenRegionOptions,
  onRegionSelect,
  onRegionPickerOpen,
}: Props) => {
  if (previewRegionOptions.length === 0) {
    return (
      <fieldset className={s.tagFieldset}>
        <legend className={s.tagLegend}>공유할 지역</legend>
        <p className={s.emptyTagText}>지역을 찾을 수 있는 장소가 없어요.</p>
      </fieldset>
    );
  }

  return (
    <fieldset className={s.tagFieldset}>
      <legend className={s.tagLegend}>공유할 지역</legend>
      <div className={s.tagChipGrid}>
        {previewRegionOptions.map((regionOption) => (
          <TagChip
            key={regionOption.value}
            label={`${regionOption.label} ${regionOption.count}개`}
            selected={selectedRegionValue === regionOption.value}
            onClick={() => onRegionSelect(regionOption.value)}
          />
        ))}
        {hasHiddenRegionOptions && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRegionPickerOpen}
          >
            지역 더 보기
          </Button>
        )}
      </div>
    </fieldset>
  );
};
