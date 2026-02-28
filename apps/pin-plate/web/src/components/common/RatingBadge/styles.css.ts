import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '3px 19px 3px 19px',
  backgroundColor: '#FFFFFF',
  border: '2.76px solid #F9E09C',
  borderRadius: '9999px',
  boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.1), 0px 1px 2px 0px rgba(0,0,0,0.1)',
  width: 'fit-content',
});

export const iconWrapper = style({
  width: '20px',
  height: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#F4C075', // Star color
});

export const text = style({
  fontFamily: '"Inter", sans-serif',
  fontWeight: 900,
  fontSize: '20px',
  lineHeight: '28px',
  color: '#8B6F5C',
  margin: 0,
});
