import { Button, Input } from '@pin-plate/ui';
import { IcDismiss } from '@pin-plate/ui/icons';
import type { ShareableRegionOption } from './shareMapDialogTypes';
import { ShareMapRegionPickerContent } from './ShareMapRegionPickerContent';
import * as s from './ShareMapDialog.css';

interface Props {
  regionSearchQuery: string;
  selectedRegionValue: string;
  recommendedRegionOptions: ShareableRegionOption[];
  searchedRegionOptions: ShareableRegionOption[];
  shareableRegionOptions: ShareableRegionOption[];
  hasRegionSearchQuery: boolean;
  onClose: () => void;
  onRegionSearchQueryChange: (nextSearchQuery: string) => void;
  onRegionSelect: (regionValue: string) => void;
}

export const ShareMapRegionPicker = ({
  regionSearchQuery,
  selectedRegionValue,
  recommendedRegionOptions,
  searchedRegionOptions,
  shareableRegionOptions,
  hasRegionSearchQuery,
  onClose,
  onRegionSearchQueryChange,
  onRegionSelect,
}: Props) => (
  <>
    <header className={s.header}>
      <div>
        <h2 id="share-map-region-picker-title" className={s.heading}>
          공유할 지역 선택
        </h2>
        <p className={s.subheading}>
          저장한 장소가 있는 지역만 골라 공유할 수 있어요.
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={s.closeButton}
        onClick={onClose}
        aria-label="지역 선택 닫기"
      >
        <IcDismiss width={18} height={18} />
      </Button>
    </header>

    <div className={s.body}>
      <div className={s.tagPickerSearch}>
        <label className={s.label} htmlFor="share-map-region-search">
          지역 검색
        </label>
        <Input
          id="share-map-region-search"
          type="search"
          value={regionSearchQuery}
          onChange={(event) => onRegionSearchQueryChange(event.target.value)}
          placeholder="예: 성수동, 성동구, 마포"
        />
      </div>

      <ShareMapRegionPickerContent
        hasRegionSearchQuery={hasRegionSearchQuery}
        recommendedRegionOptions={recommendedRegionOptions}
        searchedRegionOptions={searchedRegionOptions}
        selectedRegionValue={selectedRegionValue}
        shareableRegionOptions={shareableRegionOptions}
        onRegionSelect={onRegionSelect}
      />
    </div>

    <footer className={s.footer}>
      <Button type="button" variant="outline" size="md" onClick={onClose}>
        닫기
      </Button>
      <Button type="button" variant="solid" size="md" onClick={onClose}>
        선택 완료
      </Button>
    </footer>
  </>
);
