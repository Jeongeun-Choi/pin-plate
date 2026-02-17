import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';

export const fabButton = style({
  position: 'absolute',
  bottom: '30px',
  right: '30px',
  zIndex: vars.zIndex.bottomSheet,
  backgroundColor: vars.colors.primary.default, // Using primary color
  color: vars.colors.common.white,
  width: '60px',
  height: '60px',
  borderRadius: vars.borderRadius.full,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '30px',
  border: 'none',
  boxShadow: vars.boxShadow.float,
  cursor: 'pointer',
  transition: 'transform 0.1s ease',
  ':hover': {
    backgroundColor: vars.colors.primary.hover,
  },
  ':active': {
    transform: 'scale(0.9)',
  },
});

export const myPageButton = style({
  position: 'absolute',
  bottom: '100px',
  right: '35px', // Slightly centered above the larger FAB
  zIndex: vars.zIndex.bottomSheet,
  backgroundColor: vars.colors.common.white,
  color: vars.colors.text.primary,
  width: '50px',
  height: '50px',
  borderRadius: vars.borderRadius.full,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
  fontWeight: vars.fontWeight.bold,
  border: `1px solid ${vars.colors.secondary.border}`,
  boxShadow: vars.boxShadow.base,
  cursor: 'pointer',
  transition: 'transform 0.1s ease',
  ':hover': {
    backgroundColor: vars.colors.secondary.bg,
  },
  ':active': {
    transform: 'scale(0.9)',
  },
});
