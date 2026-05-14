import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';

export const shell = style({
  width: '100%',
  height: '100dvh',
  margin: '0 auto',
  padding: `${vars.spacing[6]} ${vars.spacing[4]}`,
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[4],
  overflow: 'hidden',
  '@media': {
    '(min-width: 768px)': {
      padding: `${vars.spacing[8]} ${vars.spacing[6]}`,
    },
  },
});

export const header = style({
  width: '100%',
  maxWidth: 1180,
  margin: '0 auto',
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[2],
});

export const title = style({
  margin: 0,
  color: vars.colors.text.primary,
  fontSize: vars.fontSize['3xl'],
  fontWeight: vars.fontWeight.bold,
  lineHeight: vars.lineHeight.heading,
  '@media': {
    '(max-width: 520px)': {
      fontSize: vars.fontSize['2xl'],
    },
  },
});

export const description = style({
  maxWidth: 680,
  margin: 0,
  color: vars.colors.text.body,
  fontSize: vars.fontSize.base,
  lineHeight: vars.lineHeight.body,
});

export const count = style({
  margin: 0,
  color: vars.colors.text.caption,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.bold,
});

export const content = style({
  width: '100%',
  maxWidth: 1180,
  margin: '0 auto',
  flex: '1 1 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[4],
  minHeight: 0,
  '@media': {
    '(min-width: 900px)': {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1.7fr) minmax(300px, 0.55fr)',
      alignItems: 'stretch',
    },
  },
});

export const mapPanel = style({
  flex: '1 1 auto',
  minHeight: 0,
  height: 'auto',
  overflow: 'hidden',
  border: `1px solid ${vars.colors.secondary.border}`,
  borderRadius: vars.borderRadius.xl,
  backgroundColor: vars.colors.secondary.surface,
  boxShadow: vars.boxShadow.card,
  '@media': {
    '(min-width: 900px)': {
      height: 'calc(100dvh - 180px)',
      minHeight: 600,
    },
  },
});

export const map = style({
  width: '100%',
  height: '100%',
});

export const list = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[3],
  margin: 0,
  padding: 0,
  listStyle: 'none',
});

export const listPanel = style({
  flexShrink: 0,
  maxHeight: '40dvh',
  minHeight: 0,
  overflowY: 'auto',
  overscrollBehavior: 'contain',
  '@media': {
    '(min-width: 900px)': {
      maxHeight: 'calc(100dvh - 180px)',
      paddingRight: vars.spacing[1],
    },
  },
});

export const placeCard = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[3],
  padding: vars.spacing[4],
  border: `1px solid ${vars.colors.secondary.border}`,
  borderRadius: vars.borderRadius.xl,
  backgroundColor: vars.colors.secondary.surface,
  boxShadow: vars.boxShadow.card,
});

export const placeHeader = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: vars.spacing[3],
});

export const placeName = style({
  margin: 0,
  color: vars.colors.text.primary,
  fontSize: vars.fontSize.base,
  fontWeight: vars.fontWeight.bold,
  lineHeight: vars.lineHeight.heading,
});

export const address = style({
  margin: `${vars.spacing[1]} 0 0`,
  color: vars.colors.text.sub,
  fontSize: vars.fontSize.sm,
  lineHeight: vars.lineHeight.body,
});

export const stats = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.spacing[2],
  color: vars.colors.text.body,
  fontSize: vars.fontSize.sm,
});

export const stat = style({
  padding: `${vars.spacing[1]} ${vars.spacing[2]}`,
  borderRadius: vars.borderRadius.full,
  backgroundColor: vars.colors.primary.light,
});

export const tagList = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.spacing[2],
  margin: 0,
  padding: 0,
  listStyle: 'none',
});

export const tag = style({
  padding: `${vars.spacing[1]} ${vars.spacing[2]}`,
  border: `1px solid ${vars.colors.secondary.border}`,
  borderRadius: vars.borderRadius.full,
  color: vars.colors.text.body,
  fontSize: vars.fontSize.xs,
  backgroundColor: vars.colors.common.white,
});

export const saveButton = style({
  minWidth: 108,
  minHeight: 36,
  flexShrink: 0,
  padding: `${vars.spacing[2]} ${vars.spacing[3]}`,
  border: `1px solid ${vars.colors.secondary.border}`,
  borderRadius: vars.borderRadius.full,
  backgroundColor: vars.colors.secondary.bg,
  color: vars.colors.text.sub,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.bold,
  cursor: 'pointer',
  selectors: {
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.72,
    },
  },
});

export const empty = style({
  display: 'flex',
  minHeight: 160,
  alignItems: 'center',
  justifyContent: 'center',
  margin: 0,
  border: `1px solid ${vars.colors.secondary.border}`,
  borderRadius: vars.borderRadius.xl,
  color: vars.colors.text.sub,
  backgroundColor: vars.colors.secondary.surface,
});
