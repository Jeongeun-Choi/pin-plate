import { globalStyle } from '@vanilla-extract/css';

// 1. Box sizing rules
globalStyle('*, *::before, *::after', {
  boxSizing: 'border-box',
  margin: 0,
  padding: 0,
});

// 2. Remove default margin & padding and set default font
globalStyle('html, body', {
  height: '100%',
  fontSize: '100%',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Pretendard", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
});

// 3. Set core body defaults
globalStyle('body', {
  lineHeight: 1.5,
  WebkitFontSmoothing: 'antialiased',
  overflowX: 'hidden',
});

// 4. Make media elements responsive
globalStyle('img, picture, video, canvas, svg', {
  display: 'block',
  maxWidth: '100%',
});

// 5. Inherit fonts for form controls
globalStyle('input, button, textarea, select', {
  font: 'inherit',
});

// 6. Reset button styles
globalStyle('button', {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
});

// 7. Reset anchor styles
globalStyle('a', {
  textDecoration: 'none',
  color: 'inherit',
});

// 8. Remove list styles
globalStyle('ul, ol, li', {
  listStyle: 'none',
});
