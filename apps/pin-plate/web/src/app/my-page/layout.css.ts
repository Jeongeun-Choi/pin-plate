import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';
import { mobileNavigationHeight } from '@/utils/mobileSafeArea';

export const container = style({
  minHeight: '100vh',
  backgroundColor: vars.colors.background.bg,
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

export const contentWrapper = style({
  maxWidth: 600,
  width: '100%',
  margin: '0 auto',
  padding: `0 ${vars.spacing[5]} calc(${vars.spacing[4]} + ${mobileNavigationHeight})`,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',

  '@media': {
    '(min-width: 768px)': {
      paddingBottom: vars.spacing[8],
    },
  },
});
