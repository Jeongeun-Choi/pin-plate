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

export const checkboxControl = style({
  position: 'relative',
  width: 18,
  height: 18,
  marginTop: 1,
  flexShrink: 0,
});

export const checkboxInput = style({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  margin: 0,
  opacity: 0,
  cursor: 'pointer',
});

export const checkboxIndicator = style({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `2px solid ${vars.colors.background.border}`,
  borderRadius: vars.spacing[1],
  backgroundColor: vars.colors.common.white,
  color: 'transparent',
  cursor: 'pointer',
  transition:
    'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease',
  pointerEvents: 'none',
  selectors: {
    [`${checkboxInput}:checked + &`]: {
      borderColor: vars.colors.primary.default,
      backgroundColor: vars.colors.primary.default,
      color: vars.colors.common.white,
    },
    [`${checkboxInput}:focus-visible + &`]: {
      outline: `2px solid ${vars.colors.primary.default}`,
      outlineOffset: 2,
    },
    [`${checkboxInput}:disabled + &`]: {
      cursor: 'not-allowed',
    },
  },
});

export const labelText = style({
  minWidth: 0,
});
