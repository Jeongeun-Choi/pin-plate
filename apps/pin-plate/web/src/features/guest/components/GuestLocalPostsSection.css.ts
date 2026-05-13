import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';

export const container = style({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[3],
  padding: vars.spacing[5],
  backgroundColor: vars.colors.common.white,
  borderRadius: vars.borderRadius['2xl'],
  border: `4px solid ${vars.colors.secondary.border}`,
  boxShadow: vars.boxShadow.lg,
  '@media': {
    '(max-width: 767px)': {
      padding: vars.spacing[4],
      borderRadius: vars.borderRadius.xl,
    },
  },
});

export const header = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: vars.spacing[3],
});

export const title = style({
  fontSize: vars.fontSize.base,
  lineHeight: vars.lineHeight.heading,
  fontWeight: vars.fontWeight.bold,
  color: vars.colors.text.primary,
});

export const description = style({
  marginTop: vars.spacing[1],
  fontSize: vars.fontSize.sm,
  lineHeight: vars.lineHeight.body,
  fontWeight: vars.fontWeight.medium,
  color: vars.colors.text.body,
});

export const countBadge = style({
  flexShrink: 0,
  padding: `${vars.spacing[1]} ${vars.spacing[2]}`,
  borderRadius: vars.borderRadius.full,
  backgroundColor: vars.colors.primary.light,
  color: vars.colors.primary.default,
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.bold,
});

export const emptyState = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: vars.spacing[3],
  padding: vars.spacing[4],
  borderRadius: vars.borderRadius.xl,
  backgroundColor: vars.colors.secondary.bg,
});

export const emptyText = style({
  fontSize: vars.fontSize.sm,
  lineHeight: vars.lineHeight.body,
  fontWeight: vars.fontWeight.medium,
  color: vars.colors.text.body,
});

export const writeButton = style({
  minHeight: 44,
  padding: `0 ${vars.spacing[5]}`,
  border: 'none',
  borderRadius: vars.borderRadius.xl,
  backgroundColor: vars.colors.primary.default,
  color: vars.colors.common.white,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.bold,
  cursor: 'pointer',
});

export const previewList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[2],
});

export const previewItem = style({
  width: '100%',
  minHeight: 44,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.spacing[3],
  padding: `${vars.spacing[2]} ${vars.spacing[3]}`,
  border: 'none',
  borderRadius: vars.borderRadius.xl,
  backgroundColor: vars.colors.secondary.bg,
  cursor: 'pointer',
  textAlign: 'left',
});

export const placeName = style({
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.bold,
  color: vars.colors.text.primary,
});

export const rating = style({
  flexShrink: 0,
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.bold,
  color: vars.colors.primary.default,
});
