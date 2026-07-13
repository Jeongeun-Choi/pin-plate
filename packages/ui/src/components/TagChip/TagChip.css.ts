import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css';

const base = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing[1],
  padding: `6px 14px`,
  borderRadius: vars.borderRadius.full,
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.medium,
  cursor: 'pointer',
  userSelect: 'none',
  transition: 'all 0.15s ease',
  border: `1.5px solid ${vars.colors.background.border}`,
  backgroundColor: vars.colors.common.white,
  color: vars.colors.text.sub,
  selectors: {
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.45,
    },
  },
});

export const chip = base;

export const chipSelected = style([
  base,
  {
    backgroundColor: vars.colors.primary.light,
    borderColor: vars.colors.primary.default,
    // borderColor: '#FDE4D8'
    color: vars.colors.primary.default,
  },
]);

export const removeBtn = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '16px',
  height: '16px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'inherit',
  fontSize: vars.fontSize.xs,
  padding: 0,
  lineHeight: 1,
});
