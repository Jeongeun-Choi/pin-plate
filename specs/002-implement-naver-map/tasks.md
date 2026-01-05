# Tasks: Implement Naver Map View

**Feature**: `002-implement-naver-map`
**Status**: Pending
**Spec**: `specs/002-implement-naver-map/spec.md`

## Dependencies

- **Phase 1 (Setup)** ensures dependencies and environment are ready.
- **Phase 2 (Foundational)** sets up the context for the map to load.
- **Phase 3 (Map Implementation)** builds the actual feature.

## Phase 1: Setup

**Goal**: Prepare the environment and dependencies.

- [x] T001 Verify/Install dependencies
  - Check if `react-naver-maps` and `@types/navermaps` are installed in `apps/web`. If not, install them.
- [x] T002 Verify Environment Variables
  - Ensure `.env.local` exists in `apps/web` (or root if shared) and contains `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`.

## Phase 2: Foundational (Provider Configuration)

**Goal**: Configure global map provider.

- [x] T003 Update MapProvider configuration
  - Verify/Update `apps/web/src/shared/providers/MapProvider.tsx` to correctly use `NavermapsProvider` with the client ID from environment variables.

## Phase 3: Map Implementation (US1: View Map)

**Goal**: Render a responsive map centered on Seoul City Hall.

- [x] T004 [US1] Create Map Styles
  - Create `apps/web/src/features/map/styles.css.ts`.
  - Define a container class using `style` from `@vanilla-extract/css`.
  - Set `width: '100vw'` and `height: '100dvh'`.
- [x] T005 [US1] Implement MapContainer Component
  - Create `apps/web/src/features/map/components/MapContainer.tsx`.
  - Use `'use client'` directive.
  - Import `NaverMap` from `react-naver-maps` and styles from `./styles.css`.
  - Render `NaverMap` inside the styled div.
  - Set `defaultCenter` to `{ lat: 37.5665, lng: 126.9780 }` (Seoul City Hall).
  - Set `defaultZoom` to `15`.
- [x] T006 [US1] Integrate Map into Home Page
  - Update `apps/web/src/app/page.tsx`.
  - Import `MapContainer`.
  - Replace current placeholder content with `<MapContainer />`.

## Final Phase: Polish

**Goal**: Verify implementation.

- [x] T007 Manual Verification
  - Run `pnpm dev:web`.
  - Verify map loads, centers correctly, and takes full viewport height on mobile emulation.
