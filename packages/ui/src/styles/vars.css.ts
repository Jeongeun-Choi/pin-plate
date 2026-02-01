import { createGlobalTheme } from '@vanilla-extract/css';

export const vars = createGlobalTheme(':root', {
  colors: {
    primary: {
      default: '#ffa07a', // brand-primary (Peach Orange)
      hover: '#ff8c69', // brand-primary-dark (Dark Peach Orange)
      light: '#fff4e6', // app-bg-light (Light Peach Background)
      text: '#8b4513', // text-primary (Chocolate Brown) - Contrast for primary button
    },
    secondary: {
      bg: '#fff8ed', // app-bg (Cream/Vanilla Background)
      surface: '#ffffff', // app-bg-white (White Background)
      border: '#ffe4d6', // border-light (Peach Cream Border)
    },
    text: {
      primary: '#8b4513', // text-primary (Chocolate Brown)
      body: '#a0522d', // text-secondary (Sienna Brown)
      sub: '#d2691e', // text-tertiary (Caramel Brown)
      caption: '#daa520', // text-accent (Goldenrod)
    },
    status: {
      success: '#4CAF50', // Existing green (Keep standard for now)
      error: '#ff6b6b', // brand-secondary (Tomato Red)
      warning: '#ffd93d', // rating-3/border-yellow (Butter Yellow)
    },
    rating: {
      '0': '#e9c46a', // Mustard Yellow
      '1': '#f4a261', // Sandy Orange
      '2': '#ffb84d', // Carrot Orange
      '3': '#ffd93d', // Butter Yellow
      '4': '#ffa07a', // Peach Orange
      '5': '#ff6b6b', // Tomato Red
    },
    shadow: {
      primary: 'rgba(255, 160, 122, 0.5)',
      rating5: 'rgba(255, 107, 107, 0.5)',
      rating4: 'rgba(255, 160, 122, 0.5)',
      rating3: 'rgba(255, 217, 61, 0.5)',
      rating2: 'rgba(255, 184, 77, 0.5)',
      rating1: 'rgba(244, 162, 97, 0.5)',
      rating0: 'rgba(233, 196, 106, 0.5)',
    },
    overlay: 'rgba(139, 69, 19, 0.4)', // Chocolate Brown with opacity for modal backdrop
  },

  fontFamily: {
    body: '"Pretendard", "Noto Sans KR", sans-serif',
  },

  fontSize: {
    h1: '24px',
    h2: '20px',
    body: '16px',
    caption: '14px',
    tiny: '12px',
  },

  fontWeight: {
    regular: '400',
    medium: '500',
    bold: '700',
  },

  lineHeight: {
    heading: '1.3',
    body: '1.5',
  },

  spacing: {
    0: '0',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px', // Base unit
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
  },

  borderRadius: {
    sm: '8px', // Button, Input
    md: '12px', // Card
    lg: '20px', // Modal, Bottom Sheet
    full: '9999px', // Rounded Button
  },

  // Retaining existing shadow structure for compatibility, mapped to new values or kept generic
  boxShadow: {
    card: '0 2px 8px rgba(139, 69, 19, 0.08)', // Brownish shadow matching text
    float: '0 4px 16px rgba(139, 69, 19, 0.12)',
    none: 'none',
  },

  zIndex: {
    header: '50',
    bottomSheet: '100',
    toast: '200',
  },
});
