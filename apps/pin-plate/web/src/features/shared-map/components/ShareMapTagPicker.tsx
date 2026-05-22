import { Button, Input } from '@pin-plate/ui';
import { IcDismiss } from '@pin-plate/ui/icons';
import type { ShareableTagOption } from '../types/shareMapDialogTypes';
import { ShareMapTagPickerContent } from './ShareMapTagPickerContent';
import * as s from './ShareMapDialog.css';

interface Props {
  tagSearchQuery: string;
  selectedTagValue: string;
  shareableTagOptions: ShareableTagOption[];
  recommendedTagOptions: ShareableTagOption[];
  searchedTagOptions: ShareableTagOption[];
  hasTagSearchQuery: boolean;
  onClose: () => void;
  onTagSearchQueryChange: (nextSearchQuery: string) => void;
  onTagSelect: (tagValue: string) => void;
}

export const ShareMapTagPicker = ({
  tagSearchQuery,
  selectedTagValue,
  shareableTagOptions,
  recommendedTagOptions,
  searchedTagOptions,
  hasTagSearchQuery,
  onClose,
  onTagSearchQueryChange,
  onTagSelect,
}: Props) => (
  <>
    <header className={s.header}>
      <div>
        <h2 id="share-map-tag-picker-title" className={s.heading}>
          공유할 태그 선택
        </h2>
        <p className={s.subheading}>
          검색하거나 많이 쓰인 태그부터 고를 수 있어요.
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={s.closeButton}
        onClick={onClose}
        aria-label="태그 선택 닫기"
      >
        <IcDismiss width={18} height={18} />
      </Button>
    </header>

    <div className={s.body}>
      <div className={s.tagPickerSearch}>
        <label className={s.label} htmlFor="share-map-tag-search">
          태그 검색
        </label>
        <Input
          id="share-map-tag-search"
          className={s.input}
          type="search"
          value={tagSearchQuery}
          onChange={(event) => onTagSearchQueryChange(event.target.value)}
          placeholder="예: 혼밥, 뷰좋은, 카페"
        />
      </div>

      <ShareMapTagPickerContent
        hasTagSearchQuery={hasTagSearchQuery}
        searchedTagOptions={searchedTagOptions}
        shareableTagOptions={shareableTagOptions}
        recommendedTagOptions={recommendedTagOptions}
        selectedTagValue={selectedTagValue}
        onTagSelect={onTagSelect}
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
