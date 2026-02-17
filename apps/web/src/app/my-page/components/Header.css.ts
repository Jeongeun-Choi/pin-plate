import { style } from '@vanilla-extract/css';

export const header = style({
  width: '100%',
  height: 60,
  display: 'flex',
  alignItems: 'center',
  padding: '16px 0',
  marginBottom: 20,
  gap: 16,
});

export const backButton = style({
  width: 40,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 16,
  cursor: 'pointer',
});

export const title = style({
  fontSize: 20,
  fontWeight: 900,
  color: '#1a1a1a',
  lineHeight: '28px',
  letterSpacing: '-0.45px',
});
