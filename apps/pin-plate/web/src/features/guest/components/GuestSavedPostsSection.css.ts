import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';

export const container = style({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
  padding: 20,
  backgroundColor: vars.colors.common.white,
  borderRadius: 16,
  border: `4px solid ${vars.colors.secondary.border}`,
  boxShadow:
    '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)',
  '@media': {
    '(max-width: 767px)': {
      padding: 16,
      borderRadius: 14,
    },
  },
});

export const header = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 12,
});

export const title = style({
  fontSize: 18,
  lineHeight: '26px',
  fontWeight: vars.fontWeight.bold,
  color: vars.colors.text.primary,
});

export const description = style({
  marginTop: 2,
  fontSize: 14,
  lineHeight: '22px',
  fontWeight: vars.fontWeight.medium,
  color: vars.colors.text.body,
});

export const countBadge = style({
  flexShrink: 0,
  padding: '4px 10px',
  borderRadius: vars.borderRadius.full,
  backgroundColor: vars.colors.primary.light,
  color: vars.colors.primary.default,
  fontSize: 13,
  fontWeight: vars.fontWeight.bold,
});

export const previewList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

export const previewItem = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  minHeight: 42,
  padding: '10px 12px',
  borderRadius: 10,
  backgroundColor: vars.colors.secondary.bg,
});

export const placeName = style({
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: 14,
  fontWeight: vars.fontWeight.bold,
  color: vars.colors.text.primary,
});

export const rating = style({
  flexShrink: 0,
  fontSize: 13,
  fontWeight: vars.fontWeight.bold,
  color: vars.colors.primary.default,
});

export const resultText = style({
  fontSize: 13,
  lineHeight: '20px',
  fontWeight: vars.fontWeight.medium,
  color: vars.colors.text.body,
});

export const actions = style({
  display: 'flex',
  gap: 8,
  '@media': {
    '(max-width: 767px)': {
      flexDirection: 'column',
    },
  },
});

export const syncButton = style({
  flex: 1,
  minHeight: 42,
  border: 'none',
  borderRadius: vars.borderRadius.xl,
  backgroundColor: vars.colors.primary.default,
  color: vars.colors.common.white,
  fontSize: 15,
  fontWeight: vars.fontWeight.bold,
  cursor: 'pointer',
  selectors: {
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
});

export const deleteButton = style({
  minHeight: 42,
  padding: '0 18px',
  borderRadius: vars.borderRadius.xl,
  border: `1px solid ${vars.colors.secondary.border}`,
  backgroundColor: vars.colors.common.white,
  color: vars.colors.text.body,
  fontSize: 15,
  fontWeight: vars.fontWeight.bold,
  cursor: 'pointer',
  selectors: {
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
});
