import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';

export const container = style({
  display: 'flex',
  padding: vars.spacing[1],
  borderRadius: vars.borderRadius.full,
  backdropFilter: 'blur(8px)',
});

export const compactContainer = style({
  padding: 3,
});

export const headerContainer = style({
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
});

export const surfaceContainer = style({
  backgroundColor: 'rgba(255, 255, 255, 0.94)',
  boxShadow: vars.boxShadow.float,
});

export const button = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.spacing[1],
  minWidth: 72,
  height: 34,
  padding: `0 ${vars.spacing[4]}`,
  border: 'none',
  borderRadius: vars.borderRadius.full,
  backgroundColor: 'transparent',
  cursor: 'pointer',
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.bold,
  transition:
    'background-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease',
});

export const compactButton = style({
  minWidth: 62,
  height: 32,
  padding: `0 ${vars.spacing[3]}`,
  fontSize: vars.fontSize.xs,
});

export const iconOnlyButton = style({
  width: 40,
  minWidth: 40,
  height: 40,
  padding: 0,
});

export const compactIconOnlyButton = style({
  width: 28,
  minWidth: 28,
  height: 28,
  padding: 0,
});

export const buttonTone = styleVariants({
  header: {
    color: 'rgba(255, 255, 255, 0.82)',
    ':hover': {
      color: vars.colors.common.white,
    },
  },
  surface: {
    color: vars.colors.text.sub,
    ':hover': {
      color: vars.colors.text.body,
    },
  },
});

export const activeButtonTone = styleVariants({
  header: {
    backgroundColor: vars.colors.common.white,
    color: vars.colors.primary.default,
    boxShadow: vars.boxShadow.sm,
    ':hover': {
      color: vars.colors.primary.default,
    },
  },
  surface: {
    backgroundColor: vars.colors.primary.default,
    color: vars.colors.common.white,
    boxShadow: vars.boxShadow.sm,
    ':hover': {
      color: vars.colors.common.white,
    },
  },
});
