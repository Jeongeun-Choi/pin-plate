import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';

export const container = style({
  width: '100%',
  minHeight: '100dvh',
  padding: '100px 24px 24px 24px', // Account for header (80px), balanced padding
  backgroundColor: vars.colors.secondary.bg,
  display: 'flex',
  justifyContent: 'center',
});

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: 24,
  width: '100%',
  maxWidth: 1200,
});

export const card = style({
  backgroundColor: vars.colors.common.white,
  borderRadius: vars.borderRadius.xl,
  padding: 24,
  boxShadow: vars.boxShadow.sm,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  cursor: 'pointer',
  ':hover': {
    transform: 'translateY(-4px)',
    boxShadow: vars.boxShadow.lg,
  },
});

export const cardTitle = style({
  fontSize: 18,
  fontWeight: 700,
  color: vars.colors.text.primary,
});

export const cardContent = style({
  fontSize: 14,
  color: vars.colors.text.sub,
  lineHeight: 1.5,
});
