import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  width: '100%',
  padding: '0 24px',
  textAlign: 'center',
  background: 'linear-gradient(135deg, #fff5f5 0%, #ffffff 100%)',
});

export const card = style({
  maxWidth: '480px',
  width: '100%',
  padding: '48px 32px',
  borderRadius: '24px',
  backgroundColor: '#ffffff',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.05)',
  border: '1px solid rgba(0, 0, 0, 0.03)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '24px',
});

export const iconContainer = style({
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  backgroundColor: '#fff5f5',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '40px',
  marginBottom: '8px',
});

export const title = style({
  fontSize: '28px',
  fontWeight: 800,
  color: '#1a1a1a',
  letterSpacing: '-0.5px',
  margin: 0,
});

export const description = style({
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#666666',
  margin: 0,
});

export const buttonGroup = style({
  display: 'flex',
  gap: '12px',
  marginTop: '8px',
  width: '100%',
});

export const primaryButton = style({
  flex: 1,
  padding: '16px 24px',
  borderRadius: '12px',
  backgroundColor: '#1a1a1a',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
  transition: 'transform 0.2s ease, background-color 0.2s ease',
  ':hover': {
    backgroundColor: '#333333',
    transform: 'translateY(-2px)',
  },
  ':active': {
    transform: 'translateY(0)',
  },
});

export const secondaryButton = style({
  flex: 1,
  padding: '16px 24px',
  borderRadius: '12px',
  backgroundColor: '#f5f5f5',
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
  transition: 'transform 0.2s ease, background-color 0.2s ease',
  ':hover': {
    backgroundColor: '#eeeeee',
    transform: 'translateY(-2px)',
  },
  ':active': {
    transform: 'translateY(0)',
  },
});
