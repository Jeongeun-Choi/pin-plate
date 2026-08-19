import { globalStyle } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui/vars';
import { boundaryClassNames } from './boundaryClassNames';

globalStyle(`.${boundaryClassNames.container}`, {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  minHeight: '100dvh',
  padding: `0 ${vars.spacing[6]}`,
  textAlign: 'center',
  backgroundColor: vars.colors.background.bg,
});

globalStyle(`.${boundaryClassNames.card}`, {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: vars.spacing[6],
  width: '100%',
  maxWidth: '480px',
  padding: `${vars.spacing[12]} ${vars.spacing[8]}`,
  border: `1px solid ${vars.colors.background.border}`,
  borderRadius: vars.borderRadius['3xl'],
  backgroundColor: vars.colors.background.surface,
  boxShadow: vars.boxShadow.float,
});

globalStyle(`.${boundaryClassNames.iconContainer}`, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '120px',
  height: '120px',
  marginBottom: vars.spacing[2],
  borderRadius: vars.borderRadius.full,
  backgroundColor: vars.colors.primary.light,
  color: vars.colors.primary.text,
  fontSize: vars.fontSize['4xl'],
  fontWeight: vars.fontWeight.bold,
  overflow: 'hidden',
});

globalStyle(`.${boundaryClassNames.title}`, {
  margin: 0,
  color: vars.colors.text.primary,
  fontFamily: vars.fontFamily.body,
  fontSize: vars.fontSize['3xl'],
  fontWeight: vars.fontWeight.bold,
  lineHeight: vars.lineHeight.heading,
  letterSpacing: '0',
});

globalStyle(`.${boundaryClassNames.description}`, {
  margin: 0,
  color: vars.colors.text.sub,
  fontFamily: vars.fontFamily.body,
  fontSize: vars.fontSize.base,
  lineHeight: vars.lineHeight.body,
});

globalStyle(`.${boundaryClassNames.buttonGroup}`, {
  display: 'flex',
  gap: vars.spacing[3],
  width: '100%',
  marginTop: vars.spacing[2],
});

globalStyle(`.${boundaryClassNames.primaryButton}`, {
  flex: 1,
  minHeight: '44px',
  padding: `${vars.spacing[3]} ${vars.spacing[4]}`,
  border: 'none',
  borderRadius: vars.borderRadius.xl,
  backgroundColor: vars.colors.btn.solid.bg,
  color: vars.colors.btn.solid.text,
  cursor: 'pointer',
  fontFamily: vars.fontFamily.body,
  fontSize: vars.fontSize.base,
  fontWeight: vars.fontWeight.bold,
  transition: 'transform 0.2s ease, background-color 0.2s ease',
});

globalStyle(`.${boundaryClassNames.primaryButton}:hover`, {
  backgroundColor: vars.colors.btn.solid.bgHover,
  transform: 'translateY(-2px)',
});

globalStyle(`.${boundaryClassNames.primaryButton}:active`, {
  transform: 'translateY(0)',
});

globalStyle(`.${boundaryClassNames.primaryButton}:focus-visible`, {
  outline: `2px solid ${vars.colors.primary.hover}`,
  outlineOffset: vars.spacing[1],
});

globalStyle(`.${boundaryClassNames.secondaryButton}`, {
  flex: 1,
  minHeight: '44px',
  padding: `${vars.spacing[3]} ${vars.spacing[4]}`,
  border: `1px solid ${vars.colors.btn.secondary.border}`,
  borderRadius: vars.borderRadius.xl,
  backgroundColor: vars.colors.btn.secondary.bg,
  color: vars.colors.btn.secondary.text,
  cursor: 'pointer',
  fontFamily: vars.fontFamily.body,
  fontSize: vars.fontSize.base,
  fontWeight: vars.fontWeight.bold,
  transition: 'transform 0.2s ease, background-color 0.2s ease',
});

globalStyle(`.${boundaryClassNames.secondaryButton}:hover`, {
  backgroundColor: vars.colors.btn.secondary.bgHover,
  transform: 'translateY(-2px)',
});

globalStyle(`.${boundaryClassNames.secondaryButton}:active`, {
  transform: 'translateY(0)',
});

globalStyle(`.${boundaryClassNames.secondaryButton}:focus-visible`, {
  outline: `2px solid ${vars.colors.primary.hover}`,
  outlineOffset: vars.spacing[1],
});
