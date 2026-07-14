import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';

export const page = style({
  minHeight: '100dvh',
  padding: `${vars.spacing[10]} ${vars.spacing[5]} ${vars.spacing[20]}`,
  backgroundColor: vars.colors.background.bg,
  color: vars.colors.text.primary,
  fontFamily: vars.fontFamily.body,
});

export const headerSection = style({
  display: 'flex',
  width: 'min(100%, 960px)',
  margin: `0 auto ${vars.spacing[8]}`,
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.spacing[4],
  '@media': {
    'screen and (max-width: 640px)': {
      alignItems: 'flex-start',
      flexDirection: 'column',
    },
  },
});

export const eyebrow = style({
  margin: `0 0 ${vars.spacing[2]}`,
  color: vars.colors.text.caption,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.bold,
  letterSpacing: 0,
  lineHeight: vars.lineHeight.heading,
});

export const heading = style({
  margin: 0,
  color: vars.colors.text.primary,
  fontSize: vars.fontSize['3xl'],
  fontWeight: vars.fontWeight.bold,
  letterSpacing: 0,
  lineHeight: vars.lineHeight.heading,
});

export const controlSection = style({
  width: 'min(100%, 960px)',
  margin: `0 auto ${vars.spacing[6]}`,
});

export const previewSection = style({
  width: 'min(100%, 960px)',
  margin: '0 auto',
});

export const sectionHeading = style({
  margin: `0 0 ${vars.spacing[3]}`,
  color: vars.colors.text.body,
  fontSize: vars.fontSize.base,
  fontWeight: vars.fontWeight.bold,
  letterSpacing: 0,
  lineHeight: vars.lineHeight.heading,
});

export const segmentedControl = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.spacing[2],
});

export const segmentButton = style({
  minHeight: '44px',
  padding: `${vars.spacing[2]} ${vars.spacing[4]}`,
  border: `1px solid ${vars.colors.background.border}`,
  borderRadius: vars.borderRadius.full,
  backgroundColor: vars.colors.background.surface,
  color: vars.colors.text.body,
  cursor: 'pointer',
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.bold,
  letterSpacing: 0,
  lineHeight: vars.lineHeight.heading,
  transition:
    'background-color 140ms ease-out, border-color 140ms ease-out, color 140ms ease-out',
  selectors: {
    '&:hover': {
      backgroundColor: vars.colors.primary.light,
      borderColor: vars.colors.primary.default,
      color: vars.colors.text.primary,
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.colors.primary.hover}`,
      outlineOffset: vars.spacing[1],
    },
  },
});

export const segmentButtonSelected = style({
  borderColor: vars.colors.primary.default,
  backgroundColor: vars.colors.primary.default,
  color: vars.colors.common.white,
});

export const triggerGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: vars.spacing[3],
});

export const toastGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: vars.spacing[4],
  '@media': {
    'screen and (max-width: 420px)': {
      gridTemplateColumns: 'minmax(0, 1fr)',
    },
  },
});

export const primaryButton = style({
  minHeight: '48px',
  padding: `${vars.spacing[3]} ${vars.spacing[4]}`,
  border: 0,
  borderRadius: vars.borderRadius.full,
  backgroundColor: vars.colors.primary.default,
  color: vars.colors.common.white,
  cursor: 'pointer',
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.bold,
  letterSpacing: 0,
  lineHeight: vars.lineHeight.heading,
  transition: 'background-color 140ms ease-out',
  selectors: {
    '&:hover': {
      backgroundColor: vars.colors.primary.hover,
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.colors.primary.hover}`,
      outlineOffset: vars.spacing[1],
    },
  },
});

export const secondaryButton = style({
  minHeight: '44px',
  padding: `${vars.spacing[2]} ${vars.spacing[4]}`,
  border: `1px solid ${vars.colors.background.border}`,
  borderRadius: vars.borderRadius.full,
  backgroundColor: vars.colors.background.surface,
  color: vars.colors.text.primary,
  cursor: 'pointer',
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.bold,
  letterSpacing: 0,
  lineHeight: vars.lineHeight.heading,
  transition: 'background-color 140ms ease-out, border-color 140ms ease-out',
  selectors: {
    '&:hover': {
      backgroundColor: vars.colors.primary.light,
      borderColor: vars.colors.primary.default,
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.colors.primary.hover}`,
      outlineOffset: vars.spacing[1],
    },
  },
});
