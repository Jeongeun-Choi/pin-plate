import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui/vars';

export const wrapper = style({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: vars.colors.secondary.bg,
  padding: vars.spacing[6],
});

export const card = style({
  width: '100%',
  maxWidth: 360,
  backgroundColor: vars.colors.secondary.surface,
  borderRadius: 24,
  border: `2px solid ${vars.colors.secondary.border}`,
  boxShadow: vars.boxShadow.card,
  padding: `${vars.spacing[5]} ${vars.spacing[6]}`,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[4],
  alignItems: 'center',
});

export const topSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[3],
  alignItems: 'center',
});

export const topIconWrap = style({
  width: 96,
  height: 96,
  borderRadius: vars.borderRadius.full,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: vars.colors.common.white,
  border: `2px solid ${vars.colors.secondary.border}`,
  boxShadow: '0px 10px 15px rgba(0,0,0,0.1), 0px 4px 6px rgba(0,0,0,0.1)',
});

export const title = style({
  margin: 0,
  fontFamily: vars.fontFamily.body,
  fontSize: '36px',
  lineHeight: '36px',
  fontWeight: vars.fontWeight.bold,
  color: '#101828',
  textAlign: 'center',
});

export const subtitle = style({
  margin: 0,
  fontFamily: vars.fontFamily.body,
  fontSize: vars.fontSize.base,
  color: '#ff8c69',
  textAlign: 'center',
});

export const form = style({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[4],
  alignItems: 'stretch',
});

export const ssoButton = style({
  width: '100%',
  height: '60px',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  textDecoration: 'none',
  border: 'none',
  fontFamily: vars.fontFamily.body,
  fontSize: '16px',
  fontWeight: vars.fontWeight.bold,
  padding: '0 20px',
});

export const googleButton = style([
  ssoButton,
  {
    backgroundColor: '#ffffff',
    border: '1px solid #dadce0',
    color: '#1f1f1f',
    ':hover': {
      backgroundColor: '#f8f9fa',
    },
  },
]);

export const buttonIcon = style({
  position: 'absolute',
  left: '20px',
  width: '20px',
  height: '20px',
});

export const buttonText = style({
  flex: 1,
  textAlign: 'center',
});

export const policyText = style({
  fontSize: '12px',
  color: '#6b6b6b',
  textAlign: 'center',
  lineHeight: '1.6',
  marginTop: '20px',
});

export const dividerWrap = style({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing[3],
});

export const dividerLine = style({
  flex: 1,
  height: '1px',
  backgroundColor: '#D1D5DC',
});

export const dividerText = style({
  fontSize: vars.fontSize.sm,
  color: vars.colors.text.sub,
  whiteSpace: 'nowrap',
});

export const fieldsWrap = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[4],
});

export const field = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[2],
});

export const label = style({
  fontFamily: vars.fontFamily.body,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.medium,
  color: '#364153',
});

export const emailInput = style({
  height: 50,
  borderRadius: 14,
  border: '0.9px solid #D1D5DC',
  padding: '12px 16px',
  fontSize: '16px',
  color: 'rgba(10,10,10,0.85)',
  fontFamily: vars.fontFamily.body,
  outline: 'none',
  ':focus': {
    borderColor: vars.colors.primary.default,
  },
});

export const loginButton = style({
  width: '100%',
  height: 50,
  marginTop: vars.spacing[4],
  borderRadius: 14,
  backgroundColor: vars.colors.primary.default,
  color: '#fff',
  fontFamily: vars.fontFamily.body,
  fontSize: vars.fontSize.base,
  fontWeight: vars.fontWeight.bold,
  border: 'none',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
  ':hover': {
    backgroundColor: vars.colors.primary.hover,
  },
  ':disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
});

export const errorText = style({
  color: vars.colors.status.error,
  fontSize: '14px',
  textAlign: 'center',
});

export const signupLink = style({
  width: '100%',
  textAlign: 'center',
  color: vars.colors.primary.hover,
  fontFamily: vars.fontFamily.body,
  fontSize: vars.fontSize.base,
  fontWeight: vars.fontWeight.medium,
  cursor: 'pointer',
  textDecoration: 'none',
});
