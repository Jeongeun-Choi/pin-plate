<!--
SYNC IMPACT REPORT
Version: 1.3.0 (Responsive Web Design Added)
Changes:
- [Principle] Added "Responsive Design" principle.
- [Principle] Updated "Project Identity" to explicitly mention Responsive Web.
- [Tech Stack] Reconfirmed existing stack (Next.js/Vanilla Extract support this natively).
- [Guidelines] Added Responsive Styling guidelines.

Templates requiring updates:
- ⚠ specs/001-setup-nextjs-project/plan.md (Needs review for responsive strategy if re-run)
- ⚠ specs/001-setup-nextjs-project/spec.md (Needs review)

TODOs:
- Ensure theme tokens (breakpoints) are defined in Vanilla Extract theme.
-->

# Pin-Plate Project Constitution

이 문서는 **Pin-Plate** 프로젝트의 절대적인 개발 원칙(Non-negotiables)을 정의합니다.

## 0. Governance

- **Version**: 1.3.0
- **Ratified Date**: 2026-01-05
- **Last Amended**: 2026-01-05
- **Review Cycle**: 변경 사항 발생 시 즉시 검토 및 버전 업데이트.

## 1. Project Identity

- **Name**: Pin-Plate
- **Type**: 모바일 앱(WebView) 및 **반응형 웹(Responsive Web)**을 지원하는 맛집/장소 기록 서비스.
- **Goal**: 데스크톱과 모바일 환경 모두에서 최적화된 UX를 제공하며, 기록과 **공유(Share)**가 용이한 지도 기반 서비스.

## 2. Tech Stack (Strict)

이 스택 외의 라이브러리를 임의로 추가하지 마십시오.

- **Language**: TypeScript (Strict Mode 필수).
- **Framework**: **Next.js** (App Router 사용).
- **State Management**: Jotai (Client), TanStack Query (Server/Async).
- **Styling**: **Vanilla Extract** (`@vanilla-extract/css`).
  - _Setup_: Next.js 플러그인(`@vanilla-extract/next-plugin`) 사용.
  - _Structure_: 스타일은 `.css.ts` 파일로 분리.
- **Map Library**: `react-naver-maps` (Naver Maps).
- **Package Manager**: `pnpm`.

## 3. Coding Guidelines

### 3.1 Responsive Design (New)

- **Strategy**: **Mobile-First** 접근 방식을 권장하지만, 데스크톱 UX도 동등하게 중요하게 다룹니다.
- **Breakpoints**: Vanilla Extract의 테마 시스템(`theme.css.ts`)에 표준 Breakpoint(Mobile, Tablet, Desktop)를 정의하고 사용해야 합니다.
- **Layout**:
  - **Mobile**: 하단 탭(Bottom Tab) 또는 햄버거 메뉴 위주의 네비게이션.
  - **Desktop**: 사이드바(Sidebar) 또는 상단 GNB(Global Navigation Bar) 위주의 네비게이션.
  - 동일한 콘텐츠라도 화면 크기에 따라 레이아웃 구조가 변경될 수 있음을 전제로 컴포넌트를 설계합니다.

### 3.2 Next.js Specifics

- **Components**: 기본적으로 **Server Component**를 사용하고, 인터랙션(Hook 사용, Bridge 통신)이 필요한 경우에만 `"use client"`를 명시합니다.
- **Routing**: `next/navigation`의 `useRouter`, `usePathname`을 사용합니다.
- **Image**: `next/image`를 사용하여 이미지를 최적화합니다.

### 3.3 WebView & Bridge

- **SSR Safety**: `window` 객체나 네이티브 브릿지(`window.ReactNativeWebView` 등) 접근은 반드시 클라이언트 사이드(`useEffect`, Event Handler)에서만 실행되어야 합니다.
- **Layout**: 모바일 뷰포트(Mobile Viewport) 설정을 `layout.tsx`에 정확히 명시하여 확대/축소를 방지하되, 데스크톱에서는 적절한 메타 태그를 유지합니다.

### 3.4 TypeScript Quality

- `any` 타입 사용 금지.
- 데이터 Fetching 결과와 Props에 대한 인터페이스를 명확히 정의합니다.

## 4. Documentation

- 모든 기술적 의사결정과 명세는 Markdown(`.md`)으로 기록합니다.