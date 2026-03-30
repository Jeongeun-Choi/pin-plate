import { style, keyframes } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';

const slideUp = keyframes({
  from: { transform: 'translateY(100%)' },
  to: { transform: 'translateY(0)' },
});

const popIn = keyframes({
  from: { opacity: 0, transform: 'translate(-50%, 8px) scale(0.95)' },
  to: { opacity: 1, transform: 'translate(-50%, 0) scale(1)' },
});

const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

export const backdrop = style({
  position: 'fixed',
  inset: 0,
  zIndex: 90,
  animation: `${fadeIn} 0.2s ease-out`,
});

export const sheet = style({
  position: 'fixed',
  zIndex: 95,
  backgroundColor: vars.colors.common.white,
  paddingBottom: 'env(safe-area-inset-bottom)',

  // 모바일: 바텀시트
  bottom: 60,
  left: 0,
  right: 0,
  borderTopLeftRadius: vars.borderRadius['3xl'],
  borderTopRightRadius: vars.borderRadius['3xl'],
  boxShadow: '0 -4px 20px rgba(139, 69, 19, 0.12)',
  animation: `${slideUp} 0.3s ease-out`,

  // 데스크톱: 클릭 위치 위에 플로팅 카드
  '@media': {
    '(min-width: 768px)': {
      top: 'auto',
      bottom: `calc(100dvh - var(--click-y) + 16px)`,
      left: 'var(--click-x)',
      right: 'auto',
      transform: 'translateX(-50%)',
      width: 320,
      borderRadius: vars.borderRadius['2xl'],
      boxShadow: vars.boxShadow.float,
      animation: `${popIn} 0.2s ease-out`,
      paddingBottom: 0,
    },
  },
});

// 모바일에서만 보이는 드래그 핸들
export const handle = style({
  width: 36,
  height: 4,
  borderRadius: vars.borderRadius.full,
  backgroundColor: vars.colors.secondary.border,
  margin: `${vars.spacing[3]} auto ${vars.spacing[1]}`,

  '@media': {
    '(min-width: 768px)': {
      display: 'none',
    },
  },
});

// 데스크톱 닫기 버튼
export const closeButton = style({
  display: 'none',

  '@media': {
    '(min-width: 768px)': {
      display: 'flex',
      position: 'absolute',
      top: 12,
      right: 12,
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: vars.borderRadius.full,
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      color: vars.colors.text.sub,

      ':hover': {
        backgroundColor: vars.colors.primary.light,
        color: vars.colors.text.primary,
      },
    },
  },
});

export const content = style({
  padding: `${vars.spacing[2]} ${vars.spacing[5]} ${vars.spacing[5]}`,

  '@media': {
    '(min-width: 768px)': {
      padding: vars.spacing[5],
    },
  },
});

export const loadingContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: vars.spacing[3],
  padding: `${vars.spacing[6]} 0`,
});

export const loadingText = style({
  fontSize: vars.fontSize.sm,
  color: vars.colors.text.sub,
});

export const emptyContainer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: `${vars.spacing[8]} 0`,
});

export const emptyText = style({
  fontSize: vars.fontSize.sm,
  color: vars.colors.text.sub,
});

export const detailSection = style({
  marginBottom: vars.spacing[5],
});

export const placeName = style({
  fontSize: vars.fontSize.xl,
  fontWeight: vars.fontWeight.bold,
  color: vars.colors.text.primary,
  lineHeight: vars.lineHeight.heading,
  marginBottom: vars.spacing[1],

  '@media': {
    '(min-width: 768px)': {
      fontSize: vars.fontSize.base,
      paddingRight: vars.spacing[8],
    },
  },
});

export const category = style({
  fontSize: vars.fontSize.xs,
  color: vars.colors.text.caption,
  marginBottom: vars.spacing[3],
});

export const infoRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing[2],
  fontSize: vars.fontSize.sm,
  color: vars.colors.text.body,
  lineHeight: vars.lineHeight.body,
  marginBottom: vars.spacing[1],
});

export const phoneLabel = style({
  color: vars.colors.text.sub,
  flexShrink: 0,
});

export const distanceText = style({
  fontSize: vars.fontSize.xs,
  color: vars.colors.text.caption,
  fontWeight: vars.fontWeight.medium,
  marginTop: vars.spacing[2],
});
