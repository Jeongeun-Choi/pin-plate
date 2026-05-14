import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css';

export const radioLabel = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing[2],
  minHeight: 40,
  color: vars.colors.text.body,
  fontSize: vars.fontSize.sm,
  lineHeight: vars.lineHeight.body,
  cursor: 'pointer',
  selectors: {
    '&:has(input:disabled)': {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
  },
});

export const radioInput = style({
  width: 18,
  height: 18,
  margin: 0,
  flexShrink: 0,
  appearance: 'none',
  border: `2px solid ${vars.colors.common.white}`,
  borderRadius: vars.borderRadius.full,
  backgroundColor: vars.colors.common.white,
  boxShadow: `0 0 0 1px ${vars.colors.secondary.border}`,
  cursor: 'pointer',
  transition:
    'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
  selectors: {
    '&:checked': {
      borderColor: vars.colors.common.white,
      backgroundColor: vars.colors.primary.default,
      boxShadow: `inset 0 0 0 4px ${vars.colors.common.white}, 0 0 0 1px ${vars.colors.primary.default}`,
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.colors.primary.default}`,
      outlineOffset: 2,
    },
    '&:disabled': {
      cursor: 'not-allowed',
    },
  },
});

export const labelText = style({
  minWidth: 0,
});
