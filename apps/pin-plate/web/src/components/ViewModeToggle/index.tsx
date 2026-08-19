'use client';

import { useAtom } from 'jotai';
import { IcList, IcMap } from '@pin-plate/ui/icons';
import { viewModeAtom } from '@/app/atoms';
import {
  container,
  headerContainer,
  surfaceContainer,
  compactContainer,
  button,
  compactButton,
  compactIconOnlyButton,
  iconOnlyButton,
  buttonTone,
  activeButtonTone,
} from './ViewModeToggle.css'; // TODO: 추후에 ~Style로 네이밍 변경하기

interface Props {
  className?: string;
  showLabels?: boolean;
  size?: 'normal' | 'compact';
  tone?: 'header' | 'surface';
}

export const ViewModeToggle = ({
  className,
  showLabels = true,
  size = 'normal',
  tone = 'surface',
}: Props) => {
  const [viewMode, setViewMode] = useAtom(viewModeAtom);
  const containerClassName = [
    container,
    tone === 'header' ? headerContainer : surfaceContainer,
    size === 'compact' ? compactContainer : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const getButtonClassName = (mode: typeof viewMode) =>
    [
      button,
      size === 'compact' ? compactButton : '',
      showLabels
        ? ''
        : size === 'compact'
          ? compactIconOnlyButton
          : iconOnlyButton,
      buttonTone[tone],
      viewMode === mode ? activeButtonTone[tone] : '',
    ]
      .filter(Boolean)
      .join(' ');

  return (
    <div className={containerClassName} role="group" aria-label="보기 방식">
      <button
        type="button"
        className={getButtonClassName('map')}
        onClick={() => setViewMode('map')}
        aria-pressed={viewMode === 'map'}
        aria-label={showLabels ? undefined : '지도 보기'}
      >
        <IcMap width={14} height={14} color="currentColor" />
        {showLabels && <span>지도</span>}
      </button>
      <button
        type="button"
        className={getButtonClassName('list')}
        onClick={() => setViewMode('list')}
        aria-pressed={viewMode === 'list'}
        aria-label={showLabels ? undefined : '목록 보기'}
      >
        <IcList width={14} height={14} color="currentColor" />
        {showLabels && <span>목록</span>}
      </button>
    </div>
  );
};
