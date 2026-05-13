import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';

export const banner = style({
  position: 'sticky',
  top: 0,
  zIndex: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 16px',
  backgroundColor: '#FF9E7D',
  color: vars.colors.common.white,
  fontSize: '14px',
  fontWeight: 600,
  gap: '8px',
  boxShadow: '0 8px 18px rgba(0, 0, 0, 0.08)',
  '@media': {
    '(max-width: 767px)': {
      position: 'fixed',
      top: 'auto',
      left: 12,
      right: 12,
      bottom: 'calc(68px + env(safe-area-inset-bottom))',
      zIndex: 35,
      alignItems: 'flex-start',
      borderRadius: 14,
      padding: '12px',
      flexDirection: 'column',
      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.18)',
    },
  },
});

export const message = style({
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  lineHeight: '20px',
  '@media': {
    '(max-width: 767px)': {
      width: '100%',
      whiteSpace: 'normal',
    },
  },
});

export const actions = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexShrink: 0,
  '@media': {
    '(max-width: 767px)': {
      width: '100%',
    },
  },
});

export const syncButton = style({
  padding: '6px 12px',
  borderRadius: '9999px',
  backgroundColor: vars.colors.common.white,
  color: '#FF9E7D',
  fontSize: '13px',
  fontWeight: 700,
  cursor: 'pointer',
  border: 'none',
  whiteSpace: 'nowrap',
  selectors: {
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
  '@media': {
    '(max-width: 767px)': {
      flex: 1,
      minHeight: 36,
    },
  },
});

export const dismissButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'none',
  border: `1px solid ${vars.colors.common.white}`,
  borderRadius: '9999px',
  cursor: 'pointer',
  color: vars.colors.common.white,
  opacity: 0.9,
  padding: '6px 12px',
  fontSize: '13px',
  fontWeight: 700,
  whiteSpace: 'nowrap',
  selectors: {
    '&:hover': {
      opacity: 1,
    },
  },
  '@media': {
    '(max-width: 767px)': {
      flex: 1,
      minHeight: 36,
    },
  },
});
