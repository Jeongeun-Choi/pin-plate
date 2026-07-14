const PLACE_SHEET_WIDTH = 320;
const PLACE_SHEET_MARGIN = 16;
const PLACE_VERTICAL_GAP = 16;
const SHEET_BOUNDARY_SELECTOR = '[data-place-detail-sheet-boundary]';

type SheetPlacement = 'above' | 'below';

interface DesktopSheetPositionStyle {
  '--sheet-left': string;
  '--sheet-bottom': string;
  '--sheet-top': string;
  '--sheet-max-height': string;
}

export interface DesktopSheetPosition {
  placement: SheetPlacement;
  style: DesktopSheetPositionStyle;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const getDesktopSheetPosition = (
  clientX: number,
  clientY: number,
): DesktopSheetPosition => {
  if (typeof window === 'undefined') {
    return {
      placement: 'above',
      style: {
        '--sheet-left': `${clientX}px`,
        '--sheet-bottom': `calc(100dvh - ${clientY}px + ${PLACE_VERTICAL_GAP}px)`,
        '--sheet-top': 'auto',
        '--sheet-max-height': '360px',
      },
    };
  }

  const horizontalInset = PLACE_SHEET_WIDTH / 2 + PLACE_SHEET_MARGIN;
  const sheetLeft = clamp(
    clientX,
    horizontalInset,
    window.innerWidth - horizontalInset,
  );
  const boundaryBottom =
    document.querySelector(SHEET_BOUNDARY_SELECTOR)?.getBoundingClientRect()
      .bottom ?? PLACE_SHEET_MARGIN;
  const sheetTopBoundary = boundaryBottom + PLACE_VERTICAL_GAP;
  const sheetBottomBoundary = window.innerHeight - PLACE_SHEET_MARGIN;
  const aboveBottom = clientY - PLACE_VERTICAL_GAP;
  const belowTop = Math.max(clientY + PLACE_VERTICAL_GAP, sheetTopBoundary);
  const availableHeightAbove = aboveBottom - sheetTopBoundary;
  const availableHeightBelow = sheetBottomBoundary - belowTop;
  const shouldPlaceAbove =
    availableHeightAbove > 0 && availableHeightAbove >= availableHeightBelow;
  const availableHeight = Math.max(
    0,
    shouldPlaceAbove ? availableHeightAbove : availableHeightBelow,
  );

  return {
    placement: shouldPlaceAbove ? 'above' : 'below',
    style: {
      '--sheet-left': `${sheetLeft}px`,
      '--sheet-bottom': `${window.innerHeight - aboveBottom}px`,
      '--sheet-top': `${belowTop}px`,
      '--sheet-max-height': `${availableHeight}px`,
    },
  };
};
