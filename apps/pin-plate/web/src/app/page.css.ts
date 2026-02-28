import { style } from '@vanilla-extract/css';

export const mainWrapper = style({
  position: 'relative',
  width: '100%',
  height: '100dvh',
});

export const fallbackContainer = style({
  padding: '80px 20px',
  textAlign: 'center',
});
