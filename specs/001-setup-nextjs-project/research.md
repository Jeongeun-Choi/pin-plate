# Research: Next.js + React Native Setup

## Decisions

### 7. Map Library

**Decision**: Naver Maps (`react-naver-maps` + `@types/navermaps`)

**Rationale**:

-   Better data quality for Korean locations (user preference).

-   `react-naver-maps` provides React-friendly wrappers.



## Integration Plan



1.  **Root Setup**:

    -   `pnpm init`

    -   Create `pnpm-workspace.yaml` with `packages: ["apps/*", "packages/*"]`.



2.  **Shared UI Setup (`packages/ui`)**:

    -   `mkdir -p packages/ui`

    -   `cd packages/ui && pnpm init`

    -   Set `name` to `@pin-plate/ui`.

    -   `pnpm add @vanilla-extract/css`

    -   Export a dummy component (e.g., `Button`).



3.  **Web Setup (`apps/web`)**:

    -   `pnpm create next-app apps/web --typescript --eslint --tailwind=false --src-dir --app --import-alias "@/*"`

    -   `cd apps/web`

    -   `pnpm add @vanilla-extract/css @vanilla-extract/next-plugin jotai react-naver-maps`

        -   `pnpm add -D @types/navermaps`

        -   `pnpm add @pin-plate/ui --workspace`

        -   **Config**: Update `next.config.mjs` to use `createVanillaExtractPlugin` and `transpilePackages`.

        -   **Cleanup**: Remove default `globals.css` and `page.module.css`.

    

    4.  **Mobile Setup (`apps/mobile`)**:

    

    

    -   `npx create-expo-app apps/mobile -t expo-template-blank-typescript`

    -   `cd apps/mobile && pnpm add react-native-webview jotai`

    -   *(Optional)* Add `@pin-plate/ui` if we implement universal components later.


