import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css';

export const card = style({
  backgroundColor: vars.colors.common.white,
  borderRadius: '16px',
  border: '4px solid #ffe4d6',
  padding: '4px',
  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  cursor: 'pointer',
  ':hover': {
    transform: 'translateY(-4px)',
    boxShadow:
      '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
  },
});

export const cardImageWrapper = style({
  width: '100%',
  height: '192px',
  backgroundColor: '#fff4e6',
  borderRadius: '12px',
  overflow: 'hidden',
  position: 'relative',
  flexShrink: 0,
});

export const cardImage = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

export const cardInfo = style({
  padding: '16px 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

export const cardHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '8px',
});

export const cardTitle = style({
  fontSize: '18px',
  fontWeight: 900,
  color: '#1a1a1a',
  letterSpacing: '-0.44px',
  lineHeight: '28px',
  margin: 0,
});

export const ratingBadge = style({
  height: '32px',
  padding: '0 12px',
  backgroundColor: '#fff4e6',
  border: '2px solid #ffd93d',
  borderRadius: '9999px',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  flexShrink: 0,
  boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.1)',
});

export const ratingText = style({
  fontSize: '14px',
  fontWeight: 900,
  color: '#4a4a4a',
});

export const locationRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginTop: '4px',
  color: '#9ca3af',
});

export const locationText = style({
  fontSize: '14px',
  fontWeight: 500,
  color: '#4a4a4a',
  letterSpacing: '-0.15px',
});

export const cardContent = style({
  fontSize: '14px',
  fontWeight: 500,
  color: '#1a1a1a',
  lineHeight: '22.75px',
  letterSpacing: '-0.15px',
  marginTop: '8px',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const cardDate = style({
  fontSize: '12px',
  fontWeight: 700,
  color: '#6b6b6b',
  marginTop: '8px',
});
