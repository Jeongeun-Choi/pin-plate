import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';

export const base = style({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '2px 10px',
  borderRadius: vars.borderRadius.full,
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.medium,
  lineHeight: '20px',
  whiteSpace: 'nowrap',
});

export const variant = styleVariants({
  wish: {
    backgroundColor: '#F5F5F5',
    color: '#757575',
    border: '1px solid #E0E0E0',
  },
  visited: {
    backgroundColor: '#FFF4E6',
    color: '#E07B39',
    border: '1px solid #FFE0C2',
  },
  want_to_revisit: {
    backgroundColor: '#EEF4FF',
    color: '#4F8EF7',
    border: '1px solid #C7DCFF',
  },
  recommend: {
    backgroundColor: '#FFFBEA',
    color: '#B07800',
    border: '1px solid #FFE082',
  },
});
