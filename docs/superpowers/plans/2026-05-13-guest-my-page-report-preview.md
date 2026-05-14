# Guest My Page Report Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 비로그인 사용자가 `/my-page`에 들어왔을 때 로그인 벽 대신 잠긴 취향 리포트 프리뷰와 현재 기기 저장 기록 섹션을 볼 수 있게 만든다.

**Architecture:** 기존 `MyPage`의 로그인 분기는 유지하되, 비로그인 분기에서 인라인 `GuestMyPage`를 제거하고 `GuestMyPagePreview` 컴포넌트를 렌더링한다. 새 컴포넌트는 정적 샘플 차트 프리뷰와 CTA만 담당하며, 실제 게스트 기록 집계나 서버 리포트 로직은 만들지 않는다. 게스트 저장 글은 기존 `GuestSavedPostsSection`을 재사용하되 로그인 사용자 전용 sync 액션과 분리된 읽기 전용 게스트 목록 컴포넌트로 표시한다.

**Tech Stack:** Next.js App Router, React 19 Client Components, TypeScript, Vanilla Extract, Vitest, Testing Library, Jotai guest post storage.

---

## Scope

In scope:
- `/my-page` 비로그인 화면을 "로그인이 필요합니다" 빈 화면에서 잠긴 리포트 프리뷰 화면으로 변경한다.
- 사용자 노출 문구를 아래 확정 문구로 고정한다.
- 샘플 차트는 CSS 기반 정적 UI로 구현한다.
- 현재 기기에 저장된 게스트 글은 차트 프리뷰 아래에 읽기 전용으로 보여준다.
- UI에 `guest`, `guest-post`, `비로그인`, `로그인이 필요합니다` 문구를 노출하지 않는다.

Out of scope:
- 실제 주간/월간 차트 계산
- `/my-page/report` 구현
- 차트 라이브러리 도입
- 게스트 글 서버 동기화 UX 변경
- 인증, Supabase, 업로드 정책 변경

## Confirmed User-Facing Copy

Top section:
- Title: `나의 맛집 기록`
- Description: `지금은 이 기기에 임시로 저장돼요. 로그인하면 기록을 안전하게 보관하고 취향 리포트를 볼 수 있어요.`
- Primary CTA: `로그인하고 리포트 보기`
- Secondary CTA: `회원가입`

Report preview:
- Section title: `취향 리포트`
- Section description: `주간·월간으로 자주 간 음식점과 장소를 정리해드려요.`
- Overlay title: `로그인하면 내 취향 차트가 열려요`
- Overlay description: `기록을 계정에 저장하면 주간·월간 리포트와 기기 간 동기화를 사용할 수 있어요.`
- Overlay CTA: `로그인하고 리포트 보기`

Sample chart labels:
- `이번 주 자주 간 음식점`
- `월간 장소 분포`
- `자주 남긴 태그`

Guest saved records:
- Section title: `이 기기에 저장된 기록`
- Empty text: `아직 이 기기에 저장된 기록이 없어요.`
- Empty action: `맛집 기록하러 가기`

## File Structure

Create:
- `apps/pin-plate/web/src/features/my-page/components/GuestMyPagePreview.tsx`
  - Owns the full guest `/my-page` screen UI.
  - Uses `useRouter` for CTA navigation.
  - Renders the locked report preview and the guest saved records section.
- `apps/pin-plate/web/src/features/my-page/components/GuestMyPagePreview.css.ts`
  - Co-located Vanilla Extract styles for the guest preview screen.
  - Uses `@pin-plate/ui` tokens instead of hardcoded product colors where tokens exist.
- `apps/pin-plate/web/src/features/guest/components/GuestLocalPostsSection.tsx`
  - Read-only "이 기기에 저장된 기록" section for anonymous users.
  - Uses `useGuestPosts` and routes to existing post detail URLs.
- `apps/pin-plate/web/src/features/guest/components/GuestLocalPostsSection.css.ts`
  - Styles for the read-only guest records list.
- `apps/pin-plate/web/src/app/my-page/__tests__/MyPage.test.tsx`
  - Tests logged-out rendering, copy, CTA routing, and guest local records.

Modify:
- `apps/pin-plate/web/src/app/my-page/page.tsx`
  - Remove inline `GuestMyPage`.
  - Render `GuestMyPagePreview` when `useMyProfile()` returns no profile.
- `apps/pin-plate/web/src/features/my-page/index.ts`
  - Export `GuestMyPagePreview`.
- `apps/pin-plate/web/src/features/guest/components/GuestSavedPostsSection.tsx`
  - No behavioral change planned.
- `apps/pin-plate/web/src/features/guest/components/GuestSavedPostsSection.css.ts`
  - No behavioral change planned.

## UI Flow Diagram

```text
/my-page
  |
  v
useMyProfile()
  |
  +-- loading ------------------> render null (existing behavior)
  |
  +-- profile exists -----------> MyPageHeader
  |                               GuestSavedPostsSection(userId)
  |                               MyPageMenu
  |                               footer message
  |
  +-- profile missing ----------> GuestMyPagePreview
                                  |
                                  +-- hero copy + login/signup CTA
                                  +-- locked report preview
                                  +-- GuestLocalPostsSection
```

## Task 1: Add Read-Only Guest Local Posts Section

**Files:**
- Create: `apps/pin-plate/web/src/features/guest/components/GuestLocalPostsSection.tsx`
- Create: `apps/pin-plate/web/src/features/guest/components/GuestLocalPostsSection.css.ts`

- [ ] **Step 1: Create the component file**

Create `apps/pin-plate/web/src/features/guest/components/GuestLocalPostsSection.tsx`:

```tsx
'use client';

import { useRouter } from 'next/navigation';
import * as styles from './GuestLocalPostsSection.css';
import { useGuestPosts } from '../hooks/useGuestPosts';

export const GuestLocalPostsSection = () => {
  const router = useRouter();

  const { guestPosts, guestPostCount } = useGuestPosts();

  const handleWriteClick = () => {
    router.push('/');
  };

  const handlePostClick = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  return (
    <section className={styles.container} aria-labelledby="local-posts-title">
      <div className={styles.header}>
        <div>
          <h2 id="local-posts-title" className={styles.title}>
            이 기기에 저장된 기록
          </h2>
          <p className={styles.description}>
            지금 브라우저에서 작성한 기록만 보여요.
          </p>
        </div>
        {guestPostCount > 0 && (
          <span className={styles.countBadge}>{guestPostCount}개</span>
        )}
      </div>

      {guestPostCount === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>
            아직 이 기기에 저장된 기록이 없어요.
          </p>
          <button
            type="button"
            className={styles.writeButton}
            onClick={handleWriteClick}
          >
            맛집 기록하러 가기
          </button>
        </div>
      ) : (
        <div className={styles.previewList}>
          {guestPosts.slice(0, 3).map((post) => (
            <button
              key={post.id}
              type="button"
              className={styles.previewItem}
              onClick={() => handlePostClick(post.id)}
            >
              <span className={styles.placeName}>{post.place_name}</span>
              <span className={styles.rating}>{post.rating.toFixed(1)}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};
```

- [ ] **Step 2: Create the styles**

Create `apps/pin-plate/web/src/features/guest/components/GuestLocalPostsSection.css.ts`:

```ts
import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';

export const container = style({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
  padding: 20,
  backgroundColor: vars.colors.common.white,
  borderRadius: 16,
  border: `4px solid ${vars.colors.secondary.border}`,
  boxShadow:
    '0px 10px 15px -3px rgba(0,0,0,0.08), 0px 4px 6px -4px rgba(0,0,0,0.08)',
  '@media': {
    '(max-width: 767px)': {
      padding: 16,
      borderRadius: 14,
    },
  },
});

export const header = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 12,
});

export const title = style({
  fontSize: 18,
  lineHeight: '26px',
  fontWeight: vars.fontWeight.bold,
  color: vars.colors.text.primary,
});

export const description = style({
  marginTop: 2,
  fontSize: 14,
  lineHeight: '22px',
  fontWeight: vars.fontWeight.medium,
  color: vars.colors.text.body,
});

export const countBadge = style({
  flexShrink: 0,
  padding: '4px 10px',
  borderRadius: vars.borderRadius.full,
  backgroundColor: vars.colors.primary.light,
  color: vars.colors.primary.default,
  fontSize: 13,
  fontWeight: vars.fontWeight.bold,
});

export const emptyState = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 12,
  padding: 16,
  borderRadius: 12,
  backgroundColor: vars.colors.secondary.bg,
});

export const emptyText = style({
  fontSize: 14,
  lineHeight: '22px',
  fontWeight: vars.fontWeight.medium,
  color: vars.colors.text.body,
});

export const writeButton = style({
  minHeight: 42,
  padding: '0 18px',
  border: 'none',
  borderRadius: vars.borderRadius.xl,
  backgroundColor: vars.colors.primary.default,
  color: vars.colors.common.white,
  fontSize: 15,
  fontWeight: vars.fontWeight.bold,
  cursor: 'pointer',
});

export const previewList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

export const previewItem = style({
  width: '100%',
  minHeight: 42,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '10px 12px',
  border: 'none',
  borderRadius: 10,
  backgroundColor: vars.colors.secondary.bg,
  cursor: 'pointer',
  textAlign: 'left',
});

export const placeName = style({
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: 14,
  fontWeight: vars.fontWeight.bold,
  color: vars.colors.text.primary,
});

export const rating = style({
  flexShrink: 0,
  fontSize: 13,
  fontWeight: vars.fontWeight.bold,
  color: vars.colors.primary.default,
});
```

- [ ] **Step 3: Run focused tests for existing guest hooks**

Run:

```bash
pnpm --filter web test -- src/features/guest/hooks/__tests__/useGuestPosts.test.tsx
```

Expected: existing guest storage hook tests pass.

## Task 2: Add Guest My Page Preview Component

**Files:**
- Create: `apps/pin-plate/web/src/features/my-page/components/GuestMyPagePreview.tsx`
- Create: `apps/pin-plate/web/src/features/my-page/components/GuestMyPagePreview.css.ts`
- Modify: `apps/pin-plate/web/src/features/my-page/index.ts`

- [ ] **Step 1: Create the component file**

Create `apps/pin-plate/web/src/features/my-page/components/GuestMyPagePreview.tsx`:

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { GuestLocalPostsSection } from '@/features/guest/components/GuestLocalPostsSection';
import * as styles from './GuestMyPagePreview.css';

const weeklyPlaces = [
  { label: '오렌지 키친', value: '72%' },
  { label: '소금집 델리', value: '56%' },
  { label: '초록 식탁', value: '42%' },
];

const monthlyPlaces = [
  { label: '성수', value: '38%' },
  { label: '망원', value: '27%' },
  { label: '연남', value: '21%' },
];

const tags = ['파스타', '브런치', '카페', '재방문'];

export const GuestMyPagePreview = () => {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push('/sign-in');
  };

  const handleSignUpClick = () => {
    router.push('/sign-up');
  };

  return (
    <div className={styles.container}>
      <section className={styles.hero} aria-labelledby="guest-my-page-title">
        <div className={styles.heroTextGroup}>
          <h1 id="guest-my-page-title" className={styles.title}>
            나의 맛집 기록
          </h1>
          <p className={styles.description}>
            지금은 이 기기에 임시로 저장돼요. 로그인하면 기록을 안전하게
            보관하고 취향 리포트를 볼 수 있어요.
          </p>
        </div>

        <div className={styles.heroActions}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleLoginClick}
          >
            로그인하고 리포트 보기
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleSignUpClick}
          >
            회원가입
          </button>
        </div>
      </section>

      <section className={styles.reportSection} aria-labelledby="report-title">
        <div className={styles.reportHeader}>
          <h2 id="report-title" className={styles.reportTitle}>
            취향 리포트
          </h2>
          <p className={styles.reportDescription}>
            주간·월간으로 자주 간 음식점과 장소를 정리해드려요.
          </p>
        </div>

        <div className={styles.lockedPreview}>
          <div className={styles.previewContent} aria-hidden="true">
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>이번 주 자주 간 음식점</h3>
              <div className={styles.barList}>
                {weeklyPlaces.map((place) => (
                  <div key={place.label} className={styles.barRow}>
                    <span className={styles.barLabel}>{place.label}</span>
                    <span className={styles.barTrack}>
                      <span
                        className={styles.barFill}
                        style={{ width: place.value }}
                      />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>월간 장소 분포</h3>
              <div className={styles.donutSummary}>
                <div className={styles.donutChart} />
                <div className={styles.locationList}>
                  {monthlyPlaces.map((place) => (
                    <div key={place.label} className={styles.locationRow}>
                      <span>{place.label}</span>
                      <strong>{place.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>자주 남긴 태그</h3>
              <div className={styles.tagList}>
                {tags.map((tag) => (
                  <span key={tag} className={styles.tagChip}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.lockOverlay}>
            <div className={styles.lockCopy}>
              <p className={styles.lockTitle}>
                로그인하면 내 취향 차트가 열려요
              </p>
              <p className={styles.lockDescription}>
                기록을 계정에 저장하면 주간·월간 리포트와 기기 간 동기화를
                사용할 수 있어요.
              </p>
            </div>
            <button
              type="button"
              className={styles.overlayButton}
              onClick={handleLoginClick}
            >
              로그인하고 리포트 보기
            </button>
          </div>
        </div>
      </section>

      <GuestLocalPostsSection />
    </div>
  );
};
```

- [ ] **Step 2: Create the styles**

Create `apps/pin-plate/web/src/features/my-page/components/GuestMyPagePreview.css.ts`:

```ts
import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';

export const container = style({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
});

export const hero = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
  padding: 24,
  borderRadius: 16,
  backgroundColor: vars.colors.common.white,
  border: `4px solid ${vars.colors.secondary.border}`,
  boxShadow:
    '0px 10px 15px -3px rgba(0,0,0,0.08), 0px 4px 6px -4px rgba(0,0,0,0.08)',
  '@media': {
    '(max-width: 767px)': {
      padding: 20,
      borderRadius: 14,
    },
  },
});

export const heroTextGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

export const title = style({
  fontSize: 24,
  lineHeight: '32px',
  fontWeight: vars.fontWeight.bold,
  color: vars.colors.text.primary,
});

export const description = style({
  fontSize: 15,
  lineHeight: '24px',
  fontWeight: vars.fontWeight.medium,
  color: vars.colors.text.body,
});

export const heroActions = style({
  display: 'flex',
  gap: 8,
  '@media': {
    '(max-width: 767px)': {
      flexDirection: 'column',
    },
  },
});

export const primaryButton = style({
  minHeight: 44,
  padding: '0 18px',
  border: 'none',
  borderRadius: vars.borderRadius.xl,
  backgroundColor: vars.colors.primary.default,
  color: vars.colors.common.white,
  fontSize: 15,
  fontWeight: vars.fontWeight.bold,
  cursor: 'pointer',
});

export const secondaryButton = style({
  minHeight: 44,
  padding: '0 18px',
  borderRadius: vars.borderRadius.xl,
  border: `1px solid ${vars.colors.secondary.border}`,
  backgroundColor: vars.colors.common.white,
  color: vars.colors.primary.default,
  fontSize: 15,
  fontWeight: vars.fontWeight.bold,
  cursor: 'pointer',
});

export const reportSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
});

export const reportHeader = style({
  padding: '0 4px',
});

export const reportTitle = style({
  fontSize: 20,
  lineHeight: '28px',
  fontWeight: vars.fontWeight.bold,
  color: vars.colors.text.primary,
});

export const reportDescription = style({
  marginTop: 4,
  fontSize: 14,
  lineHeight: '22px',
  fontWeight: vars.fontWeight.medium,
  color: vars.colors.text.body,
});

export const lockedPreview = style({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: 16,
  backgroundColor: vars.colors.common.white,
  border: `4px solid ${vars.colors.secondary.border}`,
});

export const previewContent = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 12,
  padding: 16,
  filter: 'blur(4px)',
  pointerEvents: 'none',
  userSelect: 'none',
  '@media': {
    '(max-width: 767px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

export const chartCard = style({
  minHeight: 132,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  padding: 14,
  borderRadius: 12,
  backgroundColor: vars.colors.secondary.bg,
});

export const chartTitle = style({
  fontSize: 14,
  lineHeight: '20px',
  fontWeight: vars.fontWeight.bold,
  color: vars.colors.text.primary,
});

export const barList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
});

export const barRow = style({
  display: 'grid',
  gridTemplateColumns: '88px 1fr',
  alignItems: 'center',
  gap: 8,
});

export const barLabel = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: 12,
  color: vars.colors.text.body,
});

export const barTrack = style({
  height: 9,
  overflow: 'hidden',
  borderRadius: vars.borderRadius.full,
  backgroundColor: vars.colors.common.white,
});

export const barFill = style({
  display: 'block',
  height: '100%',
  borderRadius: vars.borderRadius.full,
  backgroundColor: vars.colors.primary.default,
});

export const donutSummary = style({
  display: 'flex',
  alignItems: 'center',
  gap: 14,
});

export const donutChart = style({
  width: 72,
  height: 72,
  flexShrink: 0,
  borderRadius: vars.borderRadius.full,
  background:
    'conic-gradient(#FF9E7D 0deg 138deg, #FFD6C7 138deg 235deg, #F5E8DC 235deg 360deg)',
});

export const locationList = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

export const locationRow = style({
  display: 'flex',
  justifyContent: 'space-between',
  gap: 8,
  fontSize: 12,
  color: vars.colors.text.body,
});

export const tagList = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
});

export const tagChip = style({
  padding: '6px 10px',
  borderRadius: vars.borderRadius.full,
  backgroundColor: vars.colors.common.white,
  color: vars.colors.primary.default,
  fontSize: 12,
  fontWeight: vars.fontWeight.bold,
});

export const lockOverlay = style({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 16,
  padding: 24,
  backgroundColor: 'rgba(255, 255, 255, 0.72)',
  textAlign: 'center',
});

export const lockCopy = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
});

export const lockTitle = style({
  fontSize: 18,
  lineHeight: '26px',
  fontWeight: vars.fontWeight.bold,
  color: vars.colors.text.primary,
});

export const lockDescription = style({
  maxWidth: 360,
  fontSize: 14,
  lineHeight: '22px',
  fontWeight: vars.fontWeight.medium,
  color: vars.colors.text.body,
});

export const overlayButton = style({
  minHeight: 44,
  padding: '0 18px',
  border: 'none',
  borderRadius: vars.borderRadius.xl,
  backgroundColor: vars.colors.primary.default,
  color: vars.colors.common.white,
  fontSize: 15,
  fontWeight: vars.fontWeight.bold,
  cursor: 'pointer',
});
```

- [ ] **Step 3: Export the component**

Modify `apps/pin-plate/web/src/features/my-page/index.ts` so it includes:

```ts
export * from './api/getMyProfile';
export * from './hooks/useMyProfile';
export * from './myPageKeys';
export * from './components/MyPageHeader';
export * from './components/MyPageMenu';
export * from './components/GuestMyPagePreview';
```

## Task 3: Wire Guest Preview Into My Page

**Files:**
- Modify: `apps/pin-plate/web/src/app/my-page/page.tsx`

- [ ] **Step 1: Replace inline guest screen**

Modify `apps/pin-plate/web/src/app/my-page/page.tsx` to remove the inline `GuestMyPage` component and use `GuestMyPagePreview`.

Final file shape:

```tsx
'use client';

export const dynamic = 'force-dynamic';

import {
  GuestMyPagePreview,
  MyPageHeader,
  MyPageMenu,
  useMyProfile,
} from '@/features/my-page';
import { GuestSavedPostsSection } from '@/features/guest/components/GuestSavedPostsSection';
import * as styles from './page.css';

export default function MyPage() {
  const { data: profile, isLoading } = useMyProfile();

  if (isLoading) return null;
  if (!profile) return <GuestMyPagePreview />;

  return (
    <div className={styles.mainContent}>
      <MyPageHeader />

      <GuestSavedPostsSection userId={profile.id} />

      <MyPageMenu />

      <div className={styles.footerMessage}>
        <p className={styles.footerText}>
          Pin-Plate
          <span className={styles.footerTextLight}>
            는 여러분의 소중한 맛집 기억을 안전하게 보관합니다. 모든 리뷰는
            비공개이며, 오직 본인만 볼 수 있습니다.
          </span>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Keep `page.css.ts` scoped**

Do not add guest-preview styles to `apps/pin-plate/web/src/app/my-page/page.css.ts`. The new guest preview styles belong in `GuestMyPagePreview.css.ts`.

## Task 4: Add My Page Guest Tests

**Files:**
- Create: `apps/pin-plate/web/src/app/my-page/__tests__/MyPage.test.tsx`

- [ ] **Step 1: Write tests**

Create `apps/pin-plate/web/src/app/my-page/__tests__/MyPage.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MyPage from '../page';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock('@/features/my-page/hooks/useMyProfile', () => ({
  useMyProfile: vi.fn(),
}));

vi.mock('@/features/guest/hooks/useGuestPosts', () => ({
  useGuestPosts: vi.fn(),
}));

const { useMyProfile } = await import('@/features/my-page/hooks/useMyProfile');
const { useGuestPosts } = await import('@/features/guest/hooks/useGuestPosts');

const mockedUseMyProfile = vi.mocked(useMyProfile);
const mockedUseGuestPosts = vi.mocked(useGuestPosts);

describe('MyPage guest preview', () => {
  beforeEach(() => {
    pushMock.mockClear();
    mockedUseMyProfile.mockReturnValue({
      data: null,
      isLoading: false,
    } as ReturnType<typeof useMyProfile>);
    mockedUseGuestPosts.mockReturnValue({
      guestPosts: [],
      guestPostCount: 0,
      addGuestPost: vi.fn(),
      updateGuestPost: vi.fn(),
      removeGuestPost: vi.fn(),
      clearGuestPosts: vi.fn(),
    } as ReturnType<typeof useGuestPosts>);
  });

  it('shows the locked report preview copy to signed-out users', () => {
    render(<MyPage />);

    expect(screen.getByRole('heading', { name: '나의 맛집 기록' })).toBeInTheDocument();
    expect(screen.getByText('취향 리포트')).toBeInTheDocument();
    expect(screen.getByText('로그인하면 내 취향 차트가 열려요')).toBeInTheDocument();
    expect(screen.getByText('이번 주 자주 간 음식점')).toBeInTheDocument();
    expect(screen.getByText('월간 장소 분포')).toBeInTheDocument();
    expect(screen.getByText('자주 남긴 태그')).toBeInTheDocument();
    expect(screen.queryByText('로그인이 필요합니다')).not.toBeInTheDocument();
  });

  it('routes primary and secondary actions to auth pages', () => {
    render(<MyPage />);

    fireEvent.click(screen.getAllByRole('button', { name: '로그인하고 리포트 보기' })[0]);
    expect(pushMock).toHaveBeenCalledWith('/sign-in');

    fireEvent.click(screen.getByRole('button', { name: '회원가입' }));
    expect(pushMock).toHaveBeenCalledWith('/sign-up');
  });

  it('shows empty local records state when there are no saved records on this device', () => {
    render(<MyPage />);

    expect(screen.getByRole('heading', { name: '이 기기에 저장된 기록' })).toBeInTheDocument();
    expect(screen.getByText('아직 이 기기에 저장된 기록이 없어요.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '맛집 기록하러 가기' }));
    expect(pushMock).toHaveBeenCalledWith('/');
  });

  it('shows local records and routes to existing post detail URLs', () => {
    mockedUseGuestPosts.mockReturnValue({
      guestPosts: [
        {
          id: 'guest-post-id',
          place_name: '긴 이름의 맛집',
          address: '서울시 성동구',
          lat: 37.5446,
          lng: 127.0557,
          kakao_place_id: 'kakao-guest-post-id',
          rating: 4.5,
          content: '좋았어요',
          image_urls: [],
          tags: [],
          created_at: '2026-05-13T00:00:00.000Z',
        },
      ],
      guestPostCount: 1,
      addGuestPost: vi.fn(),
      updateGuestPost: vi.fn(),
      removeGuestPost: vi.fn(),
      clearGuestPosts: vi.fn(),
    } as ReturnType<typeof useGuestPosts>);

    render(<MyPage />);

    expect(screen.getByText('1개')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /긴 이름의 맛집/ }));
    expect(pushMock).toHaveBeenCalledWith('/post/guest-post-id');
  });
});
```

- [ ] **Step 2: Run the new test**

Run:

```bash
pnpm --filter web test -- src/app/my-page/__tests__/MyPage.test.tsx
```

Expected: the test passes after Tasks 1-3 are implemented.

- [ ] **Step 3: Fix type mismatches if the guest post fixture differs**

If TypeScript reports that the fixture is missing fields from `GuestPost`, open `apps/pin-plate/web/src/features/guest/types/guestPost.ts` and add only the required fixture fields to the test object. Do not loosen production types and do not use `any`.

## Task 5: Verification

**Files:**
- Verify all files changed in Tasks 1-4.

- [ ] **Step 1: Run focused tests**

Run:

```bash
pnpm --filter web test -- src/app/my-page/__tests__/MyPage.test.tsx src/features/guest/hooks/__tests__/useGuestPosts.test.tsx
```

Expected: all listed tests pass.

- [ ] **Step 2: Run lint fix**

Run from repo root:

```bash
pnpm lint:fix
```

Expected: ESLint and Prettier complete. Include any formatter changes to files touched by this plan.

- [ ] **Step 3: Run typecheck**

Run from repo root:

```bash
pnpm tsc
```

Expected: typecheck passes. If the root command is not defined, run the project-local equivalent:

```bash
pnpm --filter web exec tsc --noEmit
```

- [ ] **Step 4: Manual QA in browser**

Start the dev server:

```bash
pnpm --filter web dev
```

Open `/my-page` signed out and verify:
- Page does not redirect to `/sign-in`.
- `나의 맛집 기록` appears at the top.
- `취향 리포트` appears before `이 기기에 저장된 기록`.
- Chart preview is visibly blurred with the overlay text.
- Login CTA routes to `/sign-in`.
- Signup CTA routes to `/sign-up`.
- No user-visible text contains `guest`, `guest-post`, `비로그인`, or `로그인이 필요합니다`.
- Mobile viewport does not overlap text or buttons.

## Self-Review

Spec coverage:
- 비로그인 `/my-page` 접근 허용: Task 3.
- 차트 전체 샘플/블러 프리뷰: Task 2.
- 확정 문구: Task 2 and Task 4.
- 게스트 저장 글 섹션을 차트 아래에 배치: Task 1 and Task 2.
- UI에 guest/source 구분 미노출: Task 4 and manual QA.
- 실제 차트 계산 제외: Scope and Task 2 static arrays.

Placeholder scan:
- No empty placeholder markers remain.
- All code steps include concrete code.

Type consistency:
- Component names: `GuestMyPagePreview`, `GuestLocalPostsSection`.
- Route targets: `/sign-in`, `/sign-up`, `/post/:id`, `/`.
- Test mocks match `useMyProfile` and `useGuestPosts` exports.
