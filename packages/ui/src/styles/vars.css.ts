import { createGlobalTheme } from '@vanilla-extract/css';

export const vars = createGlobalTheme(':root', {
  colors: {
    common: {
      white: '#ffffff',
      black: '#000000',
    },
    btn: {
      solid: {
        bg: '#ffa07a',
        border: '#ffffff',
        bgHover: '#ff8c69',
        text: '#ffffff',
      },
      outline: {
        border: '#ffa07a',
        text: '#ffa07a',
        bgHover: '#fff4e6',
      },
      ghost: {
        text: '#1a1a1a',
        bgHover: '#fff4e6',
      },
      danger: {
        bg: '#ff6b6b',
        text: '#ffffff',
        hover: 'rgba(255, 107, 107, 0.9)', // 90% opacity of #ff6b6b
      },
    },
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
      primary: '#1a1a1a', // text-primary
      body: '#4a4a4a', // text-secondary
      sub: '#6b6b6b', // text-tertiary
      caption: '#ff8c69', // text-accent
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
    '4xl': '36px',
    '3xl': '30px',
    '2xl': '24px',
    xl: '20px',
    base: '16px',
    sm: '14px',
    xs: '12px',
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
    xl: '12px',
    '2xl': '16px',
    '3xl': '24px',
    full: '9999px',
  },

  // Retaining existing shadow structure for compatibility, mapped to new values or kept generic
  boxShadow: {
    card: '0 2px 8px rgba(139, 69, 19, 0.08)', // Brownish shadow matching text
    float: '0 4px 16px rgba(139, 69, 19, 0.12)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.10), 0 1px 2px -1px rgba(0, 0, 0, 0.10)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.10), 0 1px 2px -1px rgba(0, 0, 0, 0.10)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.10), 0 2px 4px -2px rgba(0, 0, 0, 0.10)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.10), 0 4px 6px -4px rgba(0, 0, 0, 0.10)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.10), 0 8px 10px -6px rgba(0, 0, 0, 0.10)',
    none: 'none',
  },

  zIndex: {
    header: '50',
    bottomSheet: '100',
    toast: '200',
  },
});
