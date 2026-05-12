import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';

export const filterRow = style({
  display: 'flex',
  alignItems: 'center',
  height: 48,
  padding: `0 ${vars.spacing[4]}`,
  backgroundColor: vars.colors.secondary.surface,
  borderBottom: `1px solid ${vars.colors.secondary.border}`,
  flexShrink: 0,
});

export const divider = style({
  width: 1,
  height: 20,
  backgroundColor: vars.colors.secondary.border,
  flexShrink: 0,
  margin: `0 ${vars.spacing[2]}`,
});

export const chipsWrapper = style({
  display: 'flex',
  gap: vars.spacing[2],
  overflowX: 'auto',
  scrollbarWidth: 'none',
  flex: 1,
  selectors: {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
});
