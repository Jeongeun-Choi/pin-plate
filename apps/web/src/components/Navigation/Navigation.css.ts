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
// Desktop Container removed - integrated into Header

export const logo = style({
  width: 40,
  height: 40,
  borderRadius: '50%',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.colors.common.white,
  fontSize: 12,
  fontWeight: 700,
  marginBottom: 24,
  cursor: 'pointer',
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

export const label = style({
  fontSize: 11,
  fontWeight: 500,
  marginTop: 0,
});

export const icon = style({
  width: 24,
  height: 24,
});

// Desktop Buttons
// Desktop styles removed

// Legacy support if needed, or remove if unused
export const writeIcon = style({
  width: 24,
  height: 24,
});
