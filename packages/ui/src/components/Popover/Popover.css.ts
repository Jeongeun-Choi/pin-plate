import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css';

export const container = style({
  position: 'relative',
  display: 'inline-block',
});

// Mobile Backdrop
export const backdrop = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 1000,
  display: 'block',
  '@media': {
    'screen and (min-width: 768px)': {
      display: 'none',
    },
  },
});

export const trigger = style({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '8px',
  borderRadius: '50%',
  color: vars.colors.text.sub,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
  lineHeight: 1,
  ':hover': {
    backgroundColor: vars.colors.secondary.bg,
    color: vars.colors.text.primary,
  },
});

export const menu = style({
  backgroundColor: '#fff',
  zIndex: 1001,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',

  // Mobile: Bottom Sheet Styles
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  width: '100%',
  borderRadius: '20px 20px 0 0',
  paddingBottom: 'env(safe-area-inset-bottom)',
  paddingTop: '8px', // A little spacing
  boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.1)',
  marginTop: 0,

  '@media': {
    'screen and (min-width: 768px)': {
      // Desktop: Popover Styles
      position: 'absolute',
      top: '100%',
      right: 0,
      left: 'auto',
      bottom: 'auto',
      width: 'auto',
      minWidth: '120px',
      marginTop: '4px',
      paddingTop: 0,
      paddingBottom: 0,
      borderRadius: vars.borderRadius.md,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${vars.colors.secondary.border}`,
    },
  },
});

export const item = style({
  padding: '16px 20px', // Larger touch target for mobile
  cursor: 'pointer',
  fontSize: vars.fontSize.body,
  color: vars.colors.text.primary,
  border: 'none',
  background: 'none',
  textAlign: 'left',
  width: '100%',
  ':hover': {
    backgroundColor: vars.colors.secondary.bg,
  },
  '@media': {
    'screen and (min-width: 768px)': {
      padding: '12px 16px', // Compact for desktop
    },
  },
});
