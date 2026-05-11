import { style } from '@vanilla-extract/css';

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
