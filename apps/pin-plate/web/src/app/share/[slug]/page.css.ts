import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';

export const page = style({
  minHeight: '100dvh',
  backgroundColor: vars.colors.background.bg,
});

export const missingState = style({
  minHeight: '100dvh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: vars.spacing[6],
  boxSizing: 'border-box',
});

export const missingContent = style({
  width: '100%',
  maxWidth: 420,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: vars.spacing[4],
  padding: `${vars.spacing[10]} ${vars.spacing[6]}`,
  border: `1px solid ${vars.colors.background.border}`,
  borderRadius: vars.borderRadius.xl,
  backgroundColor: vars.colors.background.surface,
  boxShadow: vars.boxShadow.card,
  textAlign: 'center',
});

export const missingEyebrow = style({
  margin: 0,
  color: vars.colors.text.caption,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.bold,
});

export const missingTitle = style({
  margin: 0,
  color: vars.colors.text.primary,
  fontSize: vars.fontSize['2xl'],
  fontWeight: vars.fontWeight.bold,
  lineHeight: vars.lineHeight.heading,
});

export const missingDescription = style({
  margin: 0,
  color: vars.colors.text.body,
  fontSize: vars.fontSize.base,
  lineHeight: vars.lineHeight.body,
});

export const homeLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 44,
  padding: `0 ${vars.spacing[5]}`,
  borderRadius: vars.borderRadius.xl,
  backgroundColor: vars.colors.btn.solid.bg,
  color: vars.colors.btn.solid.text,
  fontSize: vars.fontSize.base,
  fontWeight: vars.fontWeight.bold,
  textDecoration: 'none',
  ':hover': {
    backgroundColor: vars.colors.btn.solid.bgHover,
  },
});
