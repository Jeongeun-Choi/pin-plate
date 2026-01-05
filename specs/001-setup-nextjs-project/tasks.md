# Tasks: Next.js + React Native Setup

**Feature**: `001-setup-nextjs-project`
**Status**: Pending
**Spec**: `specs/001-setup-nextjs-project/spec.md`

## Dependencies

- **Phase 1 (Setup)** must be completed first to establish the monorepo structure.
- **Phase 2 (Foundational)** depends on Phase 1 and enables shared code consumption.
- **Phase 3 (Web)** and **Phase 4 (Mobile)** can theoretically run in parallel after Phase 2, but sequential execution is recommended for better context.

## Phase 1: Setup (Monorepo Initialization)

**Goal**: Initialize the root project and pnpm workspaces.

- [x] T001 Initialize root package.json
  - Run `pnpm init` in project root.
- [x] T002 Configure pnpm workspaces
  - Create `pnpm-workspace.yaml` with content `packages: ["apps/*", "packages/*"]`.
- [x] T003 Create directory structure
  - Create `apps/` and `packages/` directories.

## Phase 2: Foundational (Shared UI Package)

**Goal**: Create the shared UI package to be consumed by the web app.

- [x] T004 Initialize Shared UI package
  - Create `packages/ui` directory and run `pnpm init` inside it.
  - Set name to `@pin-plate/ui` in `packages/ui/package.json`.
- [x] T005 Install Shared UI dependencies
  - Run `pnpm add @vanilla-extract/css` in `packages/ui`.
- [x] T006 Create dummy component
  - Create `packages/ui/src/Button.tsx` (or similar) with a simple Vanilla Extract style.
  - Create `packages/ui/index.ts` to export the component.
- [x] T007 Configure TypeScript for Shared UI
  - Create `packages/ui/tsconfig.json`.

## Phase 3: Web App Setup (Next.js)

**Goal**: Initialize Next.js app, configure styling, state, and map.

- [x] T008 [US1] Initialize Next.js App
  - Run `pnpm create next-app apps/web --typescript --eslint --tailwind=false --src-dir --app --import-alias "@/*"` from root.
- [x] T009 [US1] Install Web dependencies
  - Run `pnpm add @vanilla-extract/css @vanilla-extract/next-plugin jotai react-naver-maps` in `apps/web`.
  - Run `pnpm add -D @types/navermaps` in `apps/web`.
  - Run `pnpm add @pin-plate/ui --workspace` in `apps/web`.
- [x] T010 [US1] Configure Next.js for Vanilla Extract & Transpilation
  - Update `apps/web/next.config.mjs` to use `createVanillaExtractPlugin`.
  - Add `transpilePackages: ['@pin-plate/ui']` to `next.config.mjs`.
- [x] T011 [US1] Clean up default files
  - Remove default Next.js styles (global.css, page.module.css).
  - Clean up `apps/web/src/app/page.tsx` and `apps/web/src/app/layout.tsx`.
- [x] T012 [US1] Scaffold Project Structure
  - Create `apps/web/src/features`.
  - Create `apps/web/src/shared/styles`.
- [x] T013 [US1] Implement Global Theme & Reset
  - Create `apps/web/src/shared/styles/theme.css.ts` with global theme variables.
  - Create `apps/web/src/shared/styles/reset.css.ts` for CSS reset.
  - Import reset in `apps/web/src/app/layout.tsx`.
- [x] T014 [US1] Setup Naver Maps Provider
  - Wrap root layout or specific provider component with Naver Maps provider context in `apps/web/src/app/layout.tsx` (or a dedicated provider file).

## Phase 4: Mobile App Setup (React Native)

**Goal**: Initialize React Native app with WebView.

- [x] T015 [US2] Initialize Expo App
  - Run `npx create-expo-app apps/mobile -t expo-template-blank-typescript` from root.
- [x] T016 [US2] Install Mobile dependencies
  - Run `pnpm add react-native-webview jotai` in `apps/mobile`.
- [x] T017 [US2] Configure WebView
  - Implement a basic WebView in `apps/mobile/App.tsx` pointing to the web app URL (or localhost for dev).

## Final Phase: Polish

**Goal**: Verify setup and add convenience scripts.

- [x] T018 Add root scripts
  - Update root `package.json` with scripts: `"dev:web": "pnpm --filter web dev"`, `"dev:mobile": "pnpm --filter mobile start"`.
- [x] T019 Verification
  - Ensure `pnpm dev:web` starts the Next.js app without errors.
  - Ensure styles are applied correctly.
  - Ensure Naver Maps loads (requires Client ID, which can be placeholder for now).

## Implementation Strategy

1.  **Monorepo Foundation**: Establish the workspace first so packages link correctly.
2.  **Web Core**: Get the Next.js app running with the custom styling engine (Vanilla Extract) as this is the primary UI.
3.  **Mobile Shell**: Set up the React Native app as a container.
