import { TagChip } from '@pin-plate/ui';
import type { ShareableStatusOption } from './shareMapDialogTypes';
import * as s from './ShareMapDialog.css';

interface Props {
  selectedStatusValue: string;
  shareableStatusOptions: ShareableStatusOption[];
  onStatusSelect: (statusValue: string) => void;
}

export const ShareMapStatusChips = ({
  selectedStatusValue,
  shareableStatusOptions,
  onStatusSelect,
}: Props) => (
  <fieldset className={s.tagFieldset}>
    <legend className={s.tagLegend}>공유할 상태</legend>
    <div className={s.tagChipGrid}>
      {shareableStatusOptions.map((statusOption) => (
        <TagChip
          key={statusOption.value}
          label={`${statusOption.label} ${statusOption.count}개`}
          selected={selectedStatusValue === statusOption.value}
          disabled={statusOption.count === 0}
          onClick={() => onStatusSelect(statusOption.value)}
        />
      ))}
    </div>
  </fieldset>
);
