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
  boxShadow: '0px 20px 25px rgba(0,0,0,0.1), 0px 8px 10px rgba(0,0,0,0.1)',
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
  width: 64,
  height: 64,
  borderRadius: vars.borderRadius.full,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0px 10px 15px rgba(0,0,0,0.1), 0px 4px 6px rgba(0,0,0,0.1)',
  backgroundImage: 'linear-gradient(135deg, #FF6900 0%, #FB2C36 100%)',
});

export const title = style({
  margin: 0,
  fontFamily: vars.fontFamily.body,
  fontSize: '30px',
  lineHeight: '36px',
  fontWeight: vars.fontWeight.bold,
  color: '#101828',
  textAlign: 'center',
});

export const subtitle = style({
  margin: 0,
  fontFamily: vars.fontFamily.body,
  fontSize: vars.fontSize.base,
  color: '#4A5565',
  textAlign: 'center',
});

export const form = style({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[4],
  alignItems: 'stretch',
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

export const input = style({
  height: 50,
  borderRadius: 14,
  border: '0.9px solid #D1D5DC',
  padding: `12px 16px`,
  fontSize: '16px',
  color: 'rgba(10,10,10,0.85)',
});

export const cta = style({
  height: 56,
  borderRadius: 14,
  backgroundImage: 'linear-gradient(90deg, #FF6900 0%, #FB2C36 100%)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.spacing[2],
  fontFamily: vars.fontFamily.body,
  fontSize: vars.fontSize.base,
  fontWeight: vars.fontWeight.medium,
  boxShadow:
    '0px 10px 15px rgba(255,105,0,0.3), 0px 4px 6px rgba(255,105,0,0.3)',
  border: 'none',
  cursor: 'pointer',
  marginTop: vars.spacing[2],
});

export const signupLink = style({
  width: '100%',
  textAlign: 'center',
  color: '#F54900',
  fontFamily: vars.fontFamily.body,
  fontSize: vars.fontSize.base,
  fontWeight: vars.fontWeight.medium,
  cursor: 'pointer',
  textDecoration: 'none',
});
