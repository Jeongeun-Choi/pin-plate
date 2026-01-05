import { createGlobalTheme } from '@vanilla-extract/css';

export const vars = createGlobalTheme(':root', {
  color: {
    primary: '#0070f3',
    background: '#ffffff',
    text: '#000000',
  },
  space: {
    small: '8px',
    medium: '16px',
    large: '24px',
  },
});
