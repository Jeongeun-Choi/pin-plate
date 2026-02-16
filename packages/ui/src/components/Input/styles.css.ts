import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css';

export const inputRecipe = style({
  width: '100%',
  color: vars.colors.text.primary,
  backgroundColor: vars.colors.secondary.surface,
  padding: `${vars.spacing[1]} ${vars.spacing[5]}`,
  borderRadius: vars.borderRadius.xl,
  border: `1px solid ${vars.colors.secondary.border}`,
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.medium,
  transition: 'all 0.2s ease',

  '::placeholder': {
    color: vars.colors.text.sub,
    fontSize: vars.fontSize.sm,
  },

  ':focus-visible': {
    outline: `1px solid ${vars.colors.primary.default}`,
  },
});
