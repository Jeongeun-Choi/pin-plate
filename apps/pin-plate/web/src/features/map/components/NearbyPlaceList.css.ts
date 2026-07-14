import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';

export const resultSummary = style({
  marginBottom: vars.spacing[3],
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.bold,
  color: vars.colors.text.primary,
});

export const list = style({
  display: 'flex',
  maxHeight: 'min(52dvh, 420px)',
  flexDirection: 'column',
  gap: vars.spacing[3],
  margin: 0,
  padding: 0,
  overflowY: 'auto',
  listStyle: 'none',
});

export const item = style({
  padding: vars.spacing[3],
  border: `1px solid ${vars.colors.background.border}`,
  borderRadius: vars.spacing[2],
  backgroundColor: vars.colors.background.surface,
});

export const detailSection = style({
  marginBottom: vars.spacing[3],
});

export const headerRow = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: vars.spacing[3],
  marginBottom: vars.spacing[3],
});

export const placeTextGroup = style({
  flex: 1,
  minWidth: 0,
});

export const placeName = style({
  marginBottom: vars.spacing[1],
  color: vars.colors.text.primary,
  fontSize: vars.fontSize.base,
  fontWeight: vars.fontWeight.bold,
  lineHeight: vars.lineHeight.heading,
});

export const category = style({
  marginBottom: vars.spacing[3],
  color: vars.colors.text.caption,
  fontSize: vars.fontSize.xs,
});

export const infoRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing[2],
  marginBottom: vars.spacing[1],
  color: vars.colors.text.body,
  fontSize: vars.fontSize.sm,
  lineHeight: vars.lineHeight.body,
});

export const phoneLabel = style({
  flexShrink: 0,
  color: vars.colors.text.sub,
});

export const distanceText = style({
  marginTop: vars.spacing[2],
  color: vars.colors.text.caption,
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.medium,
});

export const buttonGroup = style({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  gap: vars.spacing[2],
});

export const wishButton = style({
  width: 54,
});
