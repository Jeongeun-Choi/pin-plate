import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';

export const label = style({
  color: vars.colors.primary.text,
  fontSize: vars.fontSize.caption,
  fontWeight: vars.fontWeight.bold,
});

export const form = style({
  width: '100%',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  overflow: 'visible', // PostModal handles scroll
});

export const fieldWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

export const ratingContainer = style({
  padding: '20px 0px',
  height: '150px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#FEF3E9',
  gap: '12px',
  borderRadius: '16px',
});

export const imageList = style({
  display: 'flex',
  gap: '8px',
});

export const imageItem = style({
  borderRadius: '16px',
  objectFit: 'cover',
});

export const clickableInput = style({
  cursor: 'pointer',
});

export const textarea = style({
  minHeight: '150px',
});
