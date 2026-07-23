import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';
import { mobileNavigationHeight } from '@/utils/mobileSafeArea';

export const container = style({
  width: '100%',
  flex: 1,
  minHeight: 0,
  overflow: 'hidden',
  backgroundColor: '#fff8ed',
  display: 'flex',
  flexDirection: 'column',
});

// --- Filter Bar ---
export const filterBar = style({
  flexShrink: 0,
  backgroundColor: vars.colors.common.white,
  borderBottom: '4px solid #ffe4d6',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  '@media': {
    '(min-width: 768px)': {
      padding: '20px 24px',
    },
  },
});

export const filterTopRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
});

export const filterControlRow = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '12px',
  '@media': {
    '(min-width: 768px)': {
      flexDirection: 'row',
      justifyContent: 'space-between',
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

export const sortButtonGroup = style({
  display: 'flex',
  gap: '8px',
  overflowX: 'auto',
  scrollbarWidth: 'none',
  '::-webkit-scrollbar': {
    display: 'none',
  },
  '@media': {
    '(min-width: 768px)': {
      justifyContent: 'flex-end',
    },
  },
});

export const filterButton = style({
  height: '32px',
  padding: '0 20px',
  borderRadius: '9999px',
  fontSize: '14px',
  fontWeight: vars.fontWeight.medium,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  whiteSpace: 'nowrap',
  flexShrink: 0,
  cursor: 'pointer',
  transition:
    'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
  border: '2px solid #ffe4d6',
  backgroundColor: '#fff4e6',
  color: '#1a1a1a',
});

export const activeFilterButton = style({
  backgroundColor: '#ffa07a',
  borderColor: '#ffa07a',
  color: vars.colors.common.white,
});

export const reviewCount = style({
  fontSize: '14px',
  fontWeight: 800,
  color: '#4a4a4a',
});

// --- Main Content / Grid ---
export const contentWrapper = style({
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  padding: `16px 16px calc(16px + ${mobileNavigationHeight})`,
  display: 'flex',
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
  alignContent: 'start',
});

// --- Card ---
// Card styles have been moved to @pin-plate/ui

export const emptyMessage = style({
  padding: '40px 16px',
  textAlign: 'center',
  fontSize: 14,
  color: '#888888',
  lineHeight: 1.6,
});
