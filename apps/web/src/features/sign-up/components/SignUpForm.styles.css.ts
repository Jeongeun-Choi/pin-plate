import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';

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
  fontSize: '32px',
  lineHeight: '32px',
  fontWeight: vars.fontWeight.bold,
  color: '#101828',
  textAlign: 'center',
});

export const subtitle = style({
  margin: 0,
  fontFamily: vars.fontFamily.body,
  fontSize: vars.fontSize.body,
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
  fontSize: vars.fontSize.caption,
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
  fontSize: vars.fontSize.body,
  fontWeight: vars.fontWeight.medium,
  boxShadow:
    '0px 10px 15px rgba(255,105,0,0.3), 0px 4px 6px rgba(255,105,0,0.3)',
  border: 'none',
  cursor: 'pointer',
});

export const loginLink = style({
  width: '100%',
  textAlign: 'center',
  color: '#F54900',
  fontFamily: vars.fontFamily.body,
  fontSize: vars.fontSize.body,
  fontWeight: vars.fontWeight.medium,
});

export const dividerWrap = style({
  width: '100%',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const dividerLine = style({
  height: '1px',
  width: '100%',
  backgroundColor: '#D1D5DC',
});

export const dividerText = style({
  backgroundColor: vars.colors.secondary.surface,
  padding: '0 8px',
  fontSize: vars.fontSize.caption,
  color: vars.colors.text.sub,
});

export const googleBtn = style({
  height: 58,
  borderRadius: 14,
  border: `1.4px solid ${vars.colors.secondary.border}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.spacing[3],
  fontFamily: vars.fontFamily.body,
  fontSize: vars.fontSize.body,
  color: '#364153',
  background: vars.colors.secondary.surface,
  cursor: 'pointer',
});

export const footerText = style({
  fontSize: vars.fontSize.tiny,
  color: '#6A7282',
  textAlign: 'center',
});
