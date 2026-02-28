import { style } from '@vanilla-extract/css';

export const container = style({
  minHeight: '100vh',
  backgroundColor: '#fff8ed', // Figma background
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

export const contentWrapper = style({
  maxWidth: 600,
  width: '100%',
  margin: '0 auto',
  padding: '0 20px 80px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});
