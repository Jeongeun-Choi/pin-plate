'use client';

import { useAtom } from 'jotai';
import { IcList, IcMap } from '@pin-plate/ui/icons';
import { viewModeAtom } from '@/app/atoms';
import * as s from './ViewModeToggle.css';

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
    s.container,
    tone === 'header' ? s.headerContainer : s.surfaceContainer,
    size === 'compact' ? s.compactContainer : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const getButtonClassName = (mode: typeof viewMode) =>
    [
      s.button,
      size === 'compact' ? s.compactButton : '',
      showLabels
        ? ''
        : size === 'compact'
          ? s.compactIconOnlyButton
          : s.iconOnlyButton,
      s.buttonTone[tone],
      viewMode === mode ? s.activeButtonTone[tone] : '',
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
