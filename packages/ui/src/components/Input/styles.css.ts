import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css';

export const inputStyle = style({
  width: '100%',
  display: 'flex',
  color: vars.colors.text.primary,
  padding: `${vars.spacing[1]} ${vars.spacing[5]}`,
  borderRadius: vars.borderRadius.sm,
  border: `1px solid ${vars.colors.secondary.border}`,
  cursor: 'pointer',
  fontSize: vars.fontSize.tiny,
  fontWeight: vars.fontWeight.medium,

  ':focus-visible': {
    outline: `1px solid ${vars.colors.primary.default}`,
  },
});
