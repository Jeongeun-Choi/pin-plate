import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui/styles/vars.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  width: '100%',
  padding: `0 ${vars.spacing[6]}`,
  textAlign: 'center',
  backgroundColor: vars.colors.secondary.bg,
});

export const card = style({
  maxWidth: '480px',
  width: '100%',
  padding: `${vars.spacing[12]} ${vars.spacing[8]}`,
  borderRadius: vars.borderRadius['3xl'],
  backgroundColor: vars.colors.secondary.surface,
  boxShadow: vars.boxShadow.float,
  border: `1px solid ${vars.colors.secondary.border}`,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: vars.spacing[6],
});

export const iconContainer = style({
  width: '100px',
  height: '100px',
  borderRadius: '50%',
  backgroundColor: vars.colors.primary.light,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '50px',
  marginBottom: vars.spacing[2],
});

export const title = style({
  fontSize: vars.fontSize['3xl'],
  fontWeight: vars.fontWeight.bold,
  color: vars.colors.text.primary,
  letterSpacing: '-0.5px',
  margin: 0,
});

export const description = style({
  fontSize: vars.fontSize.base,
  lineHeight: vars.lineHeight.body,
  color: vars.colors.text.sub,
  margin: 0,
});

export const buttonGroup = style({
  display: 'flex',
  gap: vars.spacing[3],
  marginTop: vars.spacing[2],
  width: '100%',
});

export const primaryButton = style({
  flex: 1,
  padding: vars.spacing[4],
  borderRadius: vars.borderRadius.xl,
  backgroundColor: vars.colors.btn.solid.bg,
  color: vars.colors.btn.solid.text,
  fontSize: vars.fontSize.base,
  fontWeight: vars.fontWeight.bold,
  border: 'none',
  cursor: 'pointer',
  transition: 'transform 0.2s ease, background-color 0.2s ease',
  boxShadow: vars.boxShadow.md,
  ':hover': {
    backgroundColor: vars.colors.btn.solid.bgHover,
    transform: 'translateY(-2px)',
  },
  ':active': {
    transform: 'translateY(0)',
  },
});

export const secondaryButton = style({
  flex: 1,
  padding: vars.spacing[4],
  borderRadius: vars.borderRadius.xl,
  backgroundColor: vars.colors.btn.secondary.bg,
  color: vars.colors.btn.secondary.text,
  fontSize: vars.fontSize.base,
  fontWeight: vars.fontWeight.bold,
  border: `1px solid ${vars.colors.btn.secondary.border}`,
  cursor: 'pointer',
  transition: 'transform 0.2s ease, background-color 0.2s ease',
  ':hover': {
    backgroundColor: vars.colors.btn.secondary.bgHover,
    transform: 'translateY(-2px)',
  },
  ':active': {
    transform: 'translateY(0)',
  },
});
