import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css';

export const buttonStyle = style({
  backgroundColor: vars.colors.primary.default,
  color: vars.colors.primary.text,
  padding: `${vars.spacing[3]} ${vars.spacing[5]}`,
  borderRadius: vars.borderRadius.sm,
  border: 'none',
  cursor: 'pointer',
  fontSize: vars.fontSize.body,
  fontWeight: vars.fontWeight.medium,
  transition: 'background-color 0.2s',

  ':hover': {
    backgroundColor: vars.colors.primary.hover,
  },
});