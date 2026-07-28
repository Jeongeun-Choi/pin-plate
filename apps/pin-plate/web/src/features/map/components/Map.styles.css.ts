import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';

export const mapWrapper = style({
  flex: 1,
  position: 'relative',
  minHeight: 0,
  overflow: 'hidden',
});

export const mapContainer = style({
  width: '100%',
  height: '100%',
});

export const viewModeOverlay = style({
  position: 'absolute',
  top: vars.spacing[3],
  left: 0,
  right: 0,
  zIndex: 10,
  display: 'flex',
  justifyContent: 'center',
  pointerEvents: 'none',
  '@media': {
    '(min-width: 768px)': {
      display: 'none',
    },
  },
});

export const viewModeToggle = style({
  pointerEvents: 'auto',
});

globalStyle(`${mapWrapper} .gmnoprint.gm-bundled-control`, {
  '@media': {
    '(max-width: 767px)': {
      transform: 'translateY(-120px)',
    },
  },
});

globalStyle(`${mapWrapper} .gm-style-cc`, {
  '@media': {
    '(max-width: 767px)': {
      transform: 'translateY(-88px)',
    },
  },
});

export const filterOverlay = style({
  position: 'absolute',
  top: 12,
  left: 0,
  right: 0,
  zIndex: 10,
  display: 'flex',
  gap: 8,
  padding: '0 16px',
  overflowX: 'auto',
  scrollbarWidth: 'none',
  '::-webkit-scrollbar': { display: 'none' },
});
