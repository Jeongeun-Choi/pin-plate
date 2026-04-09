import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui/vars';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px',
  width: '100%',
  padding: vars.spacing[10],
  textAlign: 'center',
  backgroundColor: vars.colors.secondary.surface,
  borderRadius: vars.borderRadius['2xl'],
});

export const title = style({
  fontSize: vars.fontSize.xl,
  fontWeight: vars.fontWeight.bold,
  color: vars.colors.text.primary,
  marginBottom: vars.spacing[3],
});

export const message = style({
  fontSize: vars.fontSize.base,
  color: vars.colors.text.sub,
  lineHeight: vars.lineHeight.body,
  marginBottom: vars.spacing[6],
});

export const retryButton = style({
  padding: `${vars.spacing[3]} ${vars.spacing[6]}`,
  borderRadius: vars.borderRadius.xl,
  backgroundColor: vars.colors.btn.solid.bg,
  color: vars.colors.btn.solid.text,
  fontSize: vars.fontSize.base,
  fontWeight: vars.fontWeight.bold,
  border: 'none',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease, transform 0.2s ease',
  ':hover': {
    backgroundColor: vars.colors.btn.solid.bgHover,
    transform: 'translateY(-2px)',
  },
  ':active': {
    transform: 'translateY(0)',
  },
});
