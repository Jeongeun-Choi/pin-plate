import { keyframes, style } from '@vanilla-extract/css';

const spin = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

export const spinnerStyle = style({
  animation: `${spin} 1s linear infinite`,
  transformOrigin: 'center',
  display: 'block',
});
