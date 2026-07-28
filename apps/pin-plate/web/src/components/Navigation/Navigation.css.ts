import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';
import { mobileSafeAreaInsetBottom } from '../../utils/mobileSafeArea';

// Mobile Container
export const mobileContainer = style({
  position: 'fixed',
  bottom: `calc(${mobileSafeAreaInsetBottom} - ${vars.spacing[2]})`,
  left: vars.spacing[5],
  right: vars.spacing[5],
  height: 76,
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.96)',
  border: 'none',
  borderRadius: vars.borderRadius['3xl'],
  boxShadow: vars.boxShadow.float,
  padding: `${vars.spacing[2]} ${vars.spacing[4]}`,
  backdropFilter: 'blur(12px)',
  zIndex: 100,

  selectors: {
    '&::before': {
      content: '""',
      position: 'absolute',
      top: -18,
      left: '50%',
      width: 104,
      height: 50,
      backgroundColor: 'rgba(255, 255, 255, 0.96)',
      borderRadius: `${vars.borderRadius['3xl']} ${vars.borderRadius['3xl']} 0 0`,
      transform: 'translateX(-50%)',
      pointerEvents: 'none',
      zIndex: 0,
    },
  },

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
  color: vars.colors.text.sub,
  textDecoration: 'none',
  padding: 0,
  flex: 1,
  height: '100%',
  minWidth: 0,
  position: 'relative',
  zIndex: 1,

  ':hover': {
    color: vars.colors.primary.hover,
  },

  ':focus-visible': {
    outline: `2px solid ${vars.colors.primary.default}`,
    outlineOffset: 3,
    borderRadius: vars.borderRadius['2xl'],
  },
});

export const activeNavItem = style({
  color: vars.colors.primary.default,
});

export const navContent = style({
  minWidth: 68,
  minHeight: 58,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.spacing[1],
  borderRadius: vars.borderRadius['3xl'],
  transition:
    'background-color 0.2s ease, color 0.2s ease, transform 0.2s ease',

  selectors: {
    [`${activeNavItem} &`]: {
      backgroundColor: vars.colors.primary.light,
      transform: 'translateY(-1px)',
    },
  },
});

export const label = style({
  fontSize: vars.fontSize.xs,
  fontWeight: 500,
  marginTop: 0,
  lineHeight: 1.2,
});

export const icon = style({
  width: 24,
  height: 24,
  flexShrink: 0,
});

// Desktop Buttons
// Desktop styles removed

export const writeIconWrapper = style({
  width: 50,
  height: 50,
  borderRadius: '50%',
  backgroundColor: vars.colors.primary.default,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.colors.common.white,
  flexShrink: 0,
  boxShadow: `0 8px 18px ${vars.colors.shadow.primary}`,
  transition:
    'background-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',

  selectors: {
    [`${navItem}:hover &`]: {
      backgroundColor: vars.colors.primary.hover,
      transform: 'translateY(-1px)',
    },
  },
});

export const writeIcon = style({
  width: 26,
  height: 26,
});

export const writeNavItem = style({
  alignSelf: 'flex-start',
  height: 78,
  transform: 'translateY(-18px)',
  gap: vars.spacing[1],
  color: vars.colors.text.body,
});
