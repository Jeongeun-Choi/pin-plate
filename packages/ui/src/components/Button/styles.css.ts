import { recipe } from '@vanilla-extract/recipes';
import { vars } from '../../styles/vars.css';

export const buttonRecipe = recipe({
  base: {
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: vars.spacing[2],
    borderRadius: vars.borderRadius.xl,
    fontWeight: vars.fontWeight.medium,
    transition: 'all 0.2s ease',
    width: 'fit-content',
    ':disabled': {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
  },

  variants: {
    variant: {
      solid: {
        backgroundColor: vars.colors.btn.solid.bg,
        boxShadow: vars.boxShadow.lg,
        border: `3px solid ${vars.colors.btn.solid.border}`,
        color: vars.colors.btn.solid.text,
        ':hover': {
          backgroundColor: vars.colors.btn.solid.bgHover,
        },
      },
      outline: {
        backgroundColor: 'transparent',
        border: `1px solid ${vars.colors.btn.outline.border}`,
        color: vars.colors.btn.outline.text,
        ':hover': {
          backgroundColor: vars.colors.btn.outline.bgHover,
        },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: vars.colors.btn.ghost.text,
        ':hover': {
          backgroundColor: vars.colors.btn.ghost.bgHover,
        },
      },
      danger: {
        backgroundColor: vars.colors.btn.danger.bg,
        color: vars.colors.btn.danger.text,
        ':hover': {
          backgroundColor: vars.colors.btn.danger.hover,
        },
      },
    },

    size: {
      sm: {
        padding: `${vars.spacing[1]} ${vars.spacing[3]}`,
        fontSize: vars.fontSize.sm,
      },
      md: {
        padding: `${vars.spacing[2]} ${vars.spacing[4]}`,
        fontSize: vars.fontSize.base,
      },
      lg: {
        padding: `${vars.spacing[3]} ${vars.spacing[6]}`,
        fontSize: vars.fontSize.xl,
      },
      full: {
        width: '100%',
        padding: vars.spacing[3],
        fontSize: vars.fontSize.base,
      },
    },
  },

  defaultVariants: {
    variant: 'solid',
    size: 'md',
  },
});
