import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui/vars';

export const body = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[3],
  padding: vars.spacing[5],
});

export const description = style({
  fontSize: vars.fontSize.base,
  color: vars.colors.text.sub,
  lineHeight: '1.6',
  margin: 0,
});

export const errorMessage = style({
  fontSize: vars.fontSize.sm,
  color: vars.colors.btn.danger.bg,
  margin: 0,
});

export const footer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[2],
  padding: vars.spacing[5],
  paddingBottom: `calc(${vars.spacing[5]} + env(safe-area-inset-bottom))`,
  borderTop: `1px solid ${vars.colors.secondary.border}`,
});
