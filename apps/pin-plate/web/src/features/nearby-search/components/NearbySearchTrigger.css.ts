import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';

export const trigger = style({
  height: 32,
  padding: '0 14px',
  borderRadius: vars.borderRadius.full,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.medium,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  flexShrink: 0,
  border: `2px solid ${vars.colors.secondary.border}`,
  backgroundColor: vars.colors.secondary.surface,
  color: vars.colors.text.primary,
  transition: 'all 0.2s ease',
  selectors: {
    '&:hover': {
      backgroundColor: vars.colors.primary.light,
    },
  },
});

export const triggerActive = style({
  backgroundColor: vars.colors.primary.light,
  borderColor: vars.colors.primary.default,
  color: vars.colors.primary.default,
});
