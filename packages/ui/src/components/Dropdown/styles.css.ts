import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css';

export const container = style({
  position: 'relative',
  width: '100%',
});

export const trigger = style({
  width: '100%',
  minHeight: 44,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.spacing[3],
  padding: `${vars.spacing[3]} ${vars.spacing[4]}`,
  border: `1px solid ${vars.colors.secondary.border}`,
  borderRadius: vars.borderRadius.xl,
  backgroundColor: vars.colors.common.white,
  color: vars.colors.text.primary,
  cursor: 'pointer',
  fontFamily: vars.fontFamily.body,
  fontSize: vars.fontSize.sm,
  lineHeight: vars.lineHeight.body,
  textAlign: 'left',
  outline: 'none',
  ':focus-visible': {
    borderColor: vars.colors.primary.default,
    boxShadow: `0 0 0 3px ${vars.colors.primary.light}`,
  },
  ':disabled': {
    backgroundColor: vars.colors.secondary.bg,
    color: vars.colors.text.sub,
    cursor: 'not-allowed',
  },
});

export const triggerLabel = style({
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const placeholder = style({
  color: vars.colors.text.sub,
});

export const chevron = style({
  flexShrink: 0,
  color: vars.colors.text.sub,
  fontSize: vars.fontSize.xs,
  lineHeight: 1,
  transition: 'transform 0.18s ease',
});

export const chevronOpen = style({
  transform: 'rotate(180deg)',
});

export const menu = style({
  position: 'absolute',
  top: 'calc(100% + 4px)',
  left: 0,
  right: 0,
  zIndex: 10,
  maxHeight: 240,
  overflowY: 'auto',
  padding: vars.spacing[2],
  border: `1px solid ${vars.colors.secondary.border}`,
  borderRadius: vars.borderRadius.xl,
  backgroundColor: vars.colors.common.white,
  boxShadow: vars.boxShadow.float,
});

export const option = style({
  width: '100%',
  minHeight: 44,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.spacing[3],
  padding: `${vars.spacing[3]} ${vars.spacing[4]}`,
  border: 'none',
  borderRadius: vars.borderRadius.xl,
  backgroundColor: 'transparent',
  color: vars.colors.text.body,
  cursor: 'pointer',
  fontFamily: vars.fontFamily.body,
  fontSize: vars.fontSize.sm,
  lineHeight: vars.lineHeight.body,
  textAlign: 'left',
  ':hover': {
    backgroundColor: vars.colors.secondary.bg,
    color: vars.colors.text.primary,
  },
  ':focus-visible': {
    outline: `2px solid ${vars.colors.primary.default}`,
    outlineOffset: 2,
  },
});

export const activeOption = style({
  backgroundColor: vars.colors.secondary.bg,
  color: vars.colors.text.primary,
});

export const selectedOption = style({
  backgroundColor: vars.colors.primary.light,
  color: vars.colors.text.primary,
  fontWeight: vars.fontWeight.bold,
});

export const checkMark = style({
  flexShrink: 0,
  color: vars.colors.primary.default,
  fontWeight: vars.fontWeight.bold,
});
