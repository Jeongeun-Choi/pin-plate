import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';

export const body = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[5],
  padding: vars.spacing[5],
});

export const group = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[2],
});

export const groupLabel = style({
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.bold,
  color: vars.colors.text.sub,
  letterSpacing: '0.02em',
});

export const chipList = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.spacing[2],
});

export const footer = style({
  padding: vars.spacing[5],
  paddingBottom: `calc(${vars.spacing[5]} + env(safe-area-inset-bottom))`,
});
