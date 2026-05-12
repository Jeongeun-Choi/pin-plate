import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';

export const header = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[1],
});

export const subtitle = style({
  fontSize: vars.fontSize.sm,
  color: vars.colors.text.sub,
});

export const body = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[5],
  padding: vars.spacing[5],
});

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[3],
});

export const sectionHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const sectionLabel = style({
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.bold,
  color: vars.colors.text.body,
});

export const radiusValue = style({
  fontSize: vars.fontSize.base,
  fontWeight: vars.fontWeight.bold,
  color: vars.colors.primary.default,
});

export const slider = style({
  width: '100%',
  accentColor: vars.colors.primary.default,
  cursor: 'pointer',
});

export const chipRow = style({
  display: 'flex',
  gap: vars.spacing[2],
  flexWrap: 'wrap',
});

export const chip = style({
  height: 34,
  padding: '0 14px',
  borderRadius: vars.borderRadius.full,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.medium,
  cursor: 'pointer',
  border: `1.5px solid ${vars.colors.secondary.border}`,
  backgroundColor: vars.colors.secondary.surface,
  color: vars.colors.text.body,
  transition: 'all 0.15s ease',
  selectors: {
    '&:hover': {
      borderColor: vars.colors.primary.default,
      color: vars.colors.primary.default,
    },
  },
});

export const chipSelected = style({
  backgroundColor: vars.colors.primary.default,
  borderColor: vars.colors.primary.default,
  color: vars.colors.common.white,
  selectors: {
    '&:hover': {
      backgroundColor: vars.colors.primary.hover,
      borderColor: vars.colors.primary.hover,
      color: vars.colors.common.white,
    },
  },
});

export const emptyMessage = style({
  fontSize: vars.fontSize.sm,
  color: vars.colors.text.sub,
  textAlign: 'center',
  padding: `${vars.spacing[2]} 0`,
});

export const errorMessage = style({
  fontSize: vars.fontSize.sm,
  color: vars.colors.status.error,
  textAlign: 'center',
  padding: `${vars.spacing[2]} 0`,
});
