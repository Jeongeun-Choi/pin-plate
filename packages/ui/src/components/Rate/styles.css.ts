import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css';

import { recipe } from '@vanilla-extract/recipes';

export const starWrapper = recipe({
  base: {
    position: 'relative',
    display: 'inline-block',
    cursor: 'pointer',
    lineHeight: 1,
  },
  variants: {
    size: {
      sm: { fontSize: '24px' },
      md: { fontSize: '32px' },
      lg: { fontSize: '40px' },
    },
    readonly: {
      true: { cursor: 'default' },
      false: {},
    },
  },
  defaultVariants: {
    size: 'md',
    readonly: false,
  },
});

export const starBase = style({
  color: vars.colors.secondary.border,
});

export const starOverlay = style({
  position: 'absolute',
  top: 0,
  left: 0,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  color: vars.colors.primary.default,
  pointerEvents: 'none',
});
