import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css';

export const checkboxLabel = style({
  display: 'flex',
  alignItems: 'flex-start',
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

export const checkboxInput = style({
  width: 18,
  height: 18,
  margin: 0,
  marginTop: 1,
  flexShrink: 0,
  appearance: 'none',
  border: `2px solid ${vars.colors.secondary.border}`,
  borderRadius: vars.spacing[1],
  backgroundColor: vars.colors.common.white,
  cursor: 'pointer',
  transition:
    'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
  selectors: {
    '&:checked': {
      borderColor: vars.colors.primary.default,
      backgroundColor: vars.colors.primary.default,
      backgroundImage: `linear-gradient(45deg, transparent 52%, ${vars.colors.common.white} 52%, ${vars.colors.common.white} 64%, transparent 64%), linear-gradient(-45deg, transparent 46%, ${vars.colors.common.white} 46%, ${vars.colors.common.white} 58%, transparent 58%)`,
      backgroundPosition: '3px 8px, 7px 8px',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '6px 3px, 9px 3px',
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
