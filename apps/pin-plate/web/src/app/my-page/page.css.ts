import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';

export const mainContent = style({
  width: '100%',
  maxWidth: 600, // Reasonable max width for mobile view on desktop
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[4],
});

export const loadingState = style({
  width: '100%',
  minHeight: vars.spacing[20],
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.colors.text.body,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.medium,
});

export const footerMessage = style({
  marginTop: vars.spacing[6],
  padding: vars.spacing[6],
  backgroundColor: vars.colors.secondary.bg,
  borderRadius: vars.borderRadius['2xl'],
  border: `4px solid ${vars.colors.secondary.border}`,
  width: '100%',
});

export const footerText = style({
  fontSize: vars.fontSize.base,
  lineHeight: vars.lineHeight.body,
  color: vars.colors.text.primary,
  fontWeight: vars.fontWeight.bold,
  whiteSpace: 'pre-wrap',
  letterSpacing: 0,
});

export const footerTextLight = style({
  fontWeight: vars.fontWeight.medium,
});
