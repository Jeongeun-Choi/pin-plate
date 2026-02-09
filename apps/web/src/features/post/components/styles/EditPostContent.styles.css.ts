import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';

export const label = style({
  color: vars.colors.primary.text,
  fontSize: vars.fontSize.caption,
  fontWeight: vars.fontWeight.bold,
});

export const form = style({
  padding: '0px 20px',
  width: '100%',
  flex: 1, // fill the available space
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  overflow: 'auto',
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

export const addPhotoButton = style({
  width: '110px',
  height: '110px',
  borderRadius: '16px',
  backgroundColor: '#FEF3E9',
  border: '2px solid #FDE4D8',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  padding: 0,
});

export const addPhotoText = style({
  fontFamily: '"Pretendard", "Noto Sans KR", sans-serif',
  fontWeight: 900,
  fontSize: '12px',
  lineHeight: '16px',
  color: '#8B6F5C',
  textAlign: 'center',
});

export const icon = style({
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#8B6F5C',
});

export const clickableInput = style({
  cursor: 'pointer',
});

export const mobileSearchTrigger = style({
  display: 'none', // Default hidden (Desktop)
  width: '100%',
  height: '50px',
  padding: '0 16px',
  borderRadius: '16px',
  border: '2px solid #fde4d8',
  backgroundColor: '#fff',
  alignItems: 'center',
  justifyContent: 'space-between',
  cursor: 'pointer',
  '@media': {
    'screen and (max-width: 768px)': {
      display: 'flex', // Visible on Mobile
    },
  },
});

export const mobileSearchPlaceholder = style({
  color: 'rgba(107, 93, 82, 0.5)',
  fontSize: '16px',
});

export const mobileSearchIcon = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  color: '#ffa07a',
  fontWeight: vars.fontWeight.bold,
  fontSize: '14px',
});

export const desktopSearchContainer = style({
  display: 'block', // Default visible
  '@media': {
    'screen and (max-width: 768px)': {
      display: 'none', // Hidden on Mobile
    },
  },
});
