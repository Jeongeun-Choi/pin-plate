import { Button, Radio } from '@pin-plate/ui';
import type { SharedMapCriteriaType } from '../types/sharedMap';
import type {
  ShareableRegionOption,
  ShareableStatusOption,
  ShareableTagOption,
} from '../types/shareMapDialogTypes';
import { CRITERIA_OPTIONS } from '../utils/shareMapDialogLogic';
import { ShareMapTagChips } from './ShareMapTagChips';
import { ShareMapRegionChips } from './ShareMapRegionChips';
import { ShareMapStatusChips } from './ShareMapStatusChips';
import * as s from './ShareMapDialog.css';

interface Props {
  criteriaType: SharedMapCriteriaType;
  criteriaValue: string;
  hasHiddenTagOptions: boolean;
  hasHiddenRegionOptions: boolean;
  hasNoCandidatePlaces: boolean;
  placePickerButtonLabel: string;
  previewRegionOptions: ShareableRegionOption[];
  previewTagOptions: ShareableTagOption[];
  selectionSummaryDescription: string;
  selectionSummaryTitle: string;
  shareableStatusOptions: ShareableStatusOption[];
  onCriteriaTypeChange: (nextCriteriaType: SharedMapCriteriaType) => void;
  onCriteriaValueChange: (nextCriteriaValue: string) => void;
  onPlacePickerOpen: () => void;
  onRegionPickerOpen: () => void;
  onTagPickerOpen: () => void;
}

export const ShareMapCriteriaControls = ({
  criteriaType,
  criteriaValue,
  hasHiddenRegionOptions,
  hasHiddenTagOptions,
  hasNoCandidatePlaces,
  placePickerButtonLabel,
  previewRegionOptions,
  previewTagOptions,
  selectionSummaryDescription,
  selectionSummaryTitle,
  shareableStatusOptions,
  onCriteriaTypeChange,
  onCriteriaValueChange,
  onPlacePickerOpen,
  onRegionPickerOpen,
  onTagPickerOpen,
}: Props) => (
  <>
    <fieldset className={s.criteriaFieldset}>
      <legend className={s.criteriaLegend}>공유 기준</legend>
      <div className={s.radioGrid}>
        {CRITERIA_OPTIONS.map((criteriaOption) => (
          <Radio
            key={criteriaOption.value}
            className={s.radioLabel}
            name="share-map-criteria"
            checked={criteriaType === criteriaOption.value}
            onChange={() => onCriteriaTypeChange(criteriaOption.value)}
            label={criteriaOption.label}
          />
        ))}
      </div>
    </fieldset>

    <div className={s.criteriaControls}>
      {criteriaType === 'status' && (
        <ShareMapStatusChips
          selectedStatusValue={criteriaValue}
          shareableStatusOptions={shareableStatusOptions}
          onStatusSelect={onCriteriaValueChange}
        />
      )}

      {criteriaType === 'tag' && (
        <ShareMapTagChips
          selectedTagValue={criteriaValue}
          previewTagOptions={previewTagOptions}
          hasHiddenTagOptions={hasHiddenTagOptions}
          onTagSelect={onCriteriaValueChange}
          onTagPickerOpen={onTagPickerOpen}
        />
      )}

      {criteriaType === 'region' && (
        <ShareMapRegionChips
          selectedRegionValue={criteriaValue}
          previewRegionOptions={previewRegionOptions}
          hasHiddenRegionOptions={hasHiddenRegionOptions}
          onRegionSelect={onCriteriaValueChange}
          onRegionPickerOpen={onRegionPickerOpen}
        />
      )}

      <div className={s.selectionSummary}>
        <div className={s.selectionSummaryText}>
          <span className={s.selectionSummaryTitle}>
            {selectionSummaryTitle}
          </span>
          <span className={s.selectionSummaryDescription}>
            {selectionSummaryDescription}
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onPlacePickerOpen}
          disabled={hasNoCandidatePlaces}
        >
          {placePickerButtonLabel}
        </Button>
      </div>
    </div>
  </>
);
