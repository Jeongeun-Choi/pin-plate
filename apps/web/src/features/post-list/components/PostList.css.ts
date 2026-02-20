import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';

export const container = style({
  width: '100%',
  minHeight: '100dvh',
  backgroundColor: '#fff8ed',
  display: 'flex',
  flexDirection: 'column',
});

// --- Filter Bar ---
export const filterBar = style({
  backgroundColor: vars.colors.common.white,
  borderBottom: '4px solid #ffe4d6',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  '@media': {
    '(min-width: 768px)': {
      padding: '16px 24px',
    },
  },
});

export const filterHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

export const sortIconWrapper = style({
  width: '32px',
  height: '32px',
  backgroundColor: '#fff4e6',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#FF9E7D',
});

export const filterTitle = style({
  fontSize: '16px',
  fontWeight: 900,
  color: '#1a1a1a',
  letterSpacing: '-0.31px',
});

export const filterButtonGroup = style({
  display: 'flex',
  gap: '8px',
  overflowX: 'auto',
  scrollbarWidth: 'none',
  '::-webkit-scrollbar': {
    display: 'none',
  },
});

export const filterButton = style({
  height: '32px',
  padding: '0 24px',
  borderRadius: '9999px',
  fontSize: '14px',
  fontWeight: 500,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  border: '2px solid #ffe4d6',
  backgroundColor: '#fff4e6',
  color: '#1a1a1a',
});

export const activeFilterButton = style({
  backgroundColor: '#ffa07a',
  borderColor: '#ffa07a',
  color: vars.colors.common.white,
  boxShadow: '0 4px 6px 0 rgba(0,0,0,0.1), 0 2px 4px 0 rgba(0,0,0,0.1)',
});

export const reviewCount = style({
  fontSize: '12px',
  fontWeight: 700,
  color: '#4a4a4a',
});

// --- Main Content / Grid ---
export const contentWrapper = style({
  flex: 1,
  padding: '16px',
  display: 'flex',
  justifyContent: 'center',
  '@media': {
    '(min-width: 768px)': {
      padding: '24px',
    },
  },
});

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: '24px',
  width: '100%',
  maxWidth: '1200px',
  alignContent: 'start',
});

// --- Card ---
// Card styles have been moved to @pin-plate/ui
