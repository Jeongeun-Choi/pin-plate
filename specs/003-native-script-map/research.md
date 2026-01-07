# Research: Native Naver Map Script

## Decisions

### 1. Library Removal
**Decision**: Remove `react-naver-maps`.
**Rationale**:
-   User request.
-   Direct control over script loading (`next/script`).
-   Avoids React version compatibility issues (e.g., React 19 vs Library peer deps).

### 2. Script Loading Strategy
**Decision**: Use `next/script` with `strategy="afterInteractive"` (or `beforeInteractive` if critical) in `layout.tsx`.
**Rationale**:
-   Next.js optimized loading.
-   Global availability of `window.naver`.

### 3. Custom Hook (`useMap`)
**Decision**: Implement `useMap(ref, options)` hook.
**Rationale**:
-   Encapsulates map initialization logic.
-   Handles `useEffect` for map creation when script is ready.
-   Returns map instance for further control (markers, events).

### 4. Styling
**Decision**: Keep `100dvh` / `100vw`.
**Rationale**: Mobile-first fullscreen map.
