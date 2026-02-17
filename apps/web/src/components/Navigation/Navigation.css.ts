import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';

// Mobile Container
export const mobileContainer = style({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  height: 60,
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  backgroundColor: vars.colors.common.white,
  borderTop: `1px solid #e5e5e5`,
  paddingBottom: 'env(safe-area-inset-bottom)',

  '@media': {
    '(min-width: 768px)': {
      display: 'none',
    },
  },
});

// Desktop Container
export const desktopContainer = style({
  display: 'none',
  position: 'fixed', // Fixed ensures it stays relative to viewport

  '@media': {
    '(min-width: 768px)': {
      display: 'flex',
      position: 'fixed',
      bottom: 40,
      right: 40,
      flexDirection: 'column',
      gap: 16,
      alignItems: 'flex-end',
    },
  },
});

// Mobile Nav Item
export const navItem = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  outline: 'none',
  color: vars.colors.text.sub,
  textDecoration: 'none',
  padding: 8,
  flex: 1,
});

export const activeNavItem = style({
  color: vars.colors.text.primary,
});

// Desktop Buttons
export const desktopButton = style({
  width: 56,
  height: 56,
  borderRadius: '50%',
  padding: 0,
  backgroundColor: vars.colors.common.white,
  color: vars.colors.text.primary,
  boxShadow: vars.boxShadow.float,
  ':hover': {
    transform: 'scale(1.05)',
  },
});

export const activeDesktopButton = style({
  backgroundColor: vars.colors.primary.light,
  color: vars.colors.primary.default,
  border: `2px solid ${vars.colors.primary.default}`,
});

export const desktopWriteButton = style({
  // pointerEvents removed
  width: 64,
  height: 64,
  borderRadius: '50%',
  padding: 0,
  boxShadow: vars.boxShadow.float,
  ':hover': {
    transform: 'scale(1.05)',
  },
});

export const label = style({
  fontSize: 10,
  fontWeight: 500,
  marginTop: 2,
});

export const icon = style({
  width: 24,
  height: 24,
});

// Legacy support if needed, or remove if unused
export const writeIcon = style({
  width: 24,
  height: 24,
});
