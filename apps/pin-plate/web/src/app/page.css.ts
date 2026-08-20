import { style } from '@vanilla-extract/css';

export const mainWrapper = style({
  position: 'relative',
  width: '100%',
  height: '100dvh',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
});

export const fallbackContainer = style({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
});
