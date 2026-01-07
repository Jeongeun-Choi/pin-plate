# Tasks: Native Naver Map Script Implementation

**Feature**: `003-native-script-map`
**Status**: Pending
**Spec**: `specs/003-native-script-map/spec.md`

## Dependencies

- **Phase 1 (Cleanup)** must be completed to avoid conflicts.
- **Phase 2 (Setup)** enables the script loading.
- **Phase 3 (Implementation)** builds the custom logic.

## Phase 1: Cleanup (Remove Library)

**Goal**: Remove `react-naver-maps` and related configurations.

- [ ] T001 Uninstall react-naver-maps
  - Run `pnpm remove react-naver-maps` in `apps/web`.
- [ ] T002 Revert webpack config
  - Remove webpack alias hacks from `apps/web/next.config.mjs`.
- [ ] T003 Clean up MapProvider
  - Delete `apps/web/src/shared/providers/MapProvider.tsx` or replace content with a simple fragment/pass-through if needed (likely delete as we use script in layout).
  - Update `apps/web/src/app/layout.tsx` to remove `MapProvider` usage.

## Phase 2: Setup (Script Loading)

**Goal**: Load Naver Maps API via Next.js Script.

- [ ] T004 [US1] Add Script to Layout
  - Update `apps/web/src/app/layout.tsx`.
  - Import `Script` from `next/script`.
  - Add `<Script src="https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=YOUR_CLIENT_ID" strategy="afterInteractive" />`.
  - Use `process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` for the client ID.
- [ ] T005 [US1] Configure Global Types
  - Create `apps/web/src/types/naver.d.ts` (or similar) to ensure `window.naver` is recognized if `@types/navermaps` doesn't cover window extension automatically. Or ensure `@types/navermaps` is referenced in `tsconfig.json`.

## Phase 3: Implementation (Custom Hook & Component)

**Goal**: Implement map rendering using native API.

- [ ] T006 [US1] Implement useMap Hook
  - Create `apps/web/src/features/map/hooks/useMap.ts`.
  - Implement logic to initialize `new naver.maps.Map(ref.current, options)` when `window.naver` is available.
  - Return the map instance.
- [ ] T007 [US1] Update MapContainer
  - Rewrite `apps/web/src/features/map/components/MapContainer.tsx`.
  - Remove `react-naver-maps` imports.
  - Use `useRef` for the map div.
  - Use `useMap` hook to initialize map centered on Seoul City Hall.
  - Apply `mapContainerStyle` from `../styles.css`.
- [ ] T008 [US1] Verify Page Integration
  - Ensure `apps/web/src/app/page.tsx` renders `MapContainer` correctly (it might already be doing so, but verify imports).

## Final Phase: Polish

**Goal**: Verify functionality.

- [ ] T009 Manual Verification
  - Run `pnpm dev:web`.
  - Verify map loads without console errors.
  - Verify map interactivity.
