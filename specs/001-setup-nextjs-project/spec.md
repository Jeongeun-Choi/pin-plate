# Feature Specification: Next.js Project Setup

## Requirements
- Initialize Next.js project (Web) with App Router.
- Initialize React Native project (Mobile).
- Initialize shared UI package (`packages/ui`).
- Configure Vanilla Extract for styling (Web & Shared UI).
  - Install and configure `@vanilla-extract/next-plugin`.
  - Clean up default Next.js styles.
  - Create global theme (`theme.css.ts`) and reset CSS in `src/shared/styles`.
- Configure Jotai for state management.
- Configure Naver Maps (Web).
- Setup Monorepo structure (pnpm workspaces).
- Scaffold project structure:
  - `src/features`
  - `src/shared`
