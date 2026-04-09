import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px',
  width: '100%',
  padding: '40px',
  textAlign: 'center',
  backgroundColor: '#ffffff',
  borderRadius: '20px',
});

export const title = style({
  fontSize: '22px',
  fontWeight: 700,
  color: '#1a1a1a',
  marginBottom: '12px',
});

export const message = style({
  fontSize: '15px',
  color: '#666666',
  lineHeight: '1.5',
  marginBottom: '24px',
});

export const retryButton = style({
  padding: '12px 24px',
  borderRadius: '10px',
  backgroundColor: '#1a1a1a',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
  ':hover': {
    backgroundColor: '#333333',
  },
});
