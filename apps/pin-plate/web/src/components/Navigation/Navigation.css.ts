import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';
import { mobileSafeAreaInsetBottom } from '../../utils/mobileSafeArea';

// Mobile Container
export const mobileContainer = style({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  height: `calc(72px + ${mobileSafeAreaInsetBottom})`,
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'flex-start',
  backgroundColor: 'rgba(255, 255, 255, 0.96)',
  borderTop: `1px solid ${vars.colors.background.border}`,
  boxShadow: '0 -8px 24px rgba(139, 69, 19, 0.06)',
  padding: `${vars.spacing[2]} ${vars.spacing[6]} calc(${vars.spacing[2]} + ${mobileSafeAreaInsetBottom})`,
  backdropFilter: 'blur(12px)',
  zIndex: 100,

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
  height: 56,
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
  minWidth: 72,
  minHeight: 56,
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
  width: 26,
  height: 26,
  flexShrink: 0,
});

// Desktop Buttons
// Desktop styles removed

export const writeIconWrapper = style({
  width: 56,
  height: 56,
  borderRadius: vars.borderRadius['2xl'],
  backgroundColor: vars.colors.primary.default,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.colors.common.white,
  flexShrink: 0,
  boxShadow: `4px 4px 0 rgba(241, 214, 200, 0.95), 0 8px 14px rgba(255, 160, 122, 0.28)`,
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
  width: 30,
  height: 30,
});

export const writeNavItem = style({
  alignSelf: 'flex-start',
  height: 56,
  color: vars.colors.text.body,
});
