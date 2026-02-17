import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui/styles';

export const container = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  backgroundColor: vars.colors.secondary.bg, // Corrected
  padding: '0 20px',
});

export const formContainer = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '400px',
  gap: '24px',
});

export const title = style({
  fontSize: vars.fontSize['2xl'], // Corrected
  fontWeight: vars.fontWeight.bold, // Corrected
  color: vars.colors.text.primary,
  textAlign: 'center',
});

export const description = style({
  fontSize: vars.fontSize.base, // Corrected
  color: vars.colors.text.body, // Corrected
  textAlign: 'center',
  marginBottom: '16px',
});

export const inputGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

export const label = style({
  fontSize: vars.fontSize.sm, // Corrected
  fontWeight: vars.fontWeight.medium, // Corrected
  color: vars.colors.text.primary,
});

export const input = style({
  width: '100%',
  padding: '12px 16px',
  borderRadius: vars.borderRadius.xl, // Corrected
  border: `1px solid ${vars.colors.secondary.border}`,
  fontSize: vars.fontSize.base, // Corrected
  color: vars.colors.text.primary,
  outline: 'none',
  transition: 'border-color 0.2s',

  ':focus': {
    borderColor: vars.colors.primary.default,
  },

  '::placeholder': {
    color: vars.colors.text.sub,
  },

  ':disabled': {
    backgroundColor: vars.colors.secondary.surface,
    color: vars.colors.text.sub,
    cursor: 'not-allowed',
  },
});

export const errorMessage = style({
  color: vars.colors.status.error, // Corrected
  fontSize: vars.fontSize.xs, // Corrected
});
