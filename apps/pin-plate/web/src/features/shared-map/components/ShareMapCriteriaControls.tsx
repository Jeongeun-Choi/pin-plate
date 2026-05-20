import { Button, Dropdown, Input, Radio } from '@pin-plate/ui';
import type { SharedMapCriteriaType } from '../types/sharedMap';
import type { ShareableTagOption } from './shareMapDialogTypes';
import {
  CRITERIA_OPTIONS,
  SHAREABLE_STATUS_OPTIONS,
} from './shareMapDialogLogic';
import { ShareMapTagChips } from './ShareMapTagChips';
import * as s from './ShareMapDialog.css';

interface Props {
  criteriaType: SharedMapCriteriaType;
  criteriaValue: string;
  hasHiddenTagOptions: boolean;
  hasNoCandidatePlaces: boolean;
  placePickerButtonLabel: string;
  previewTagOptions: ShareableTagOption[];
  selectionSummaryDescription: string;
  selectionSummaryTitle: string;
  onCriteriaTypeChange: (nextCriteriaType: SharedMapCriteriaType) => void;
  onCriteriaValueChange: (nextCriteriaValue: string) => void;
  onPlacePickerOpen: () => void;
  onTagPickerOpen: () => void;
}

export const ShareMapCriteriaControls = ({
  criteriaType,
  criteriaValue,
  hasHiddenTagOptions,
  hasNoCandidatePlaces,
  placePickerButtonLabel,
  previewTagOptions,
  selectionSummaryDescription,
  selectionSummaryTitle,
  onCriteriaTypeChange,
  onCriteriaValueChange,
  onPlacePickerOpen,
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
        <div className={s.fieldGroup}>
          <label className={s.label} htmlFor="share-map-status">
            공유할 상태
          </label>
          <Dropdown
            id="share-map-status"
            value={criteriaValue}
            options={SHAREABLE_STATUS_OPTIONS}
            onChange={onCriteriaValueChange}
          />
        </div>
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
        <div className={s.fieldGroup}>
          <label className={s.label} htmlFor="share-map-region">
            공유할 지역
          </label>
          <Input
            id="share-map-region"
            value={criteriaValue}
            maxLength={80}
            onChange={(event) => onCriteriaValueChange(event.target.value)}
            placeholder="예: 성수동, 마포구"
          />
        </div>
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
