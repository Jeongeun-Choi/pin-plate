# Implementation Plan: Native Naver Map Script

**Branch**: `003-native-script-map` | **Date**: 2026-01-05 | **Spec**: [specs/003-native-script-map/spec.md](specs/003-native-script-map/spec.md)

## Summary

Replace the `react-naver-maps` library with a direct `next/script` implementation to allow finer control over script loading and map initialization. This involves creating a custom hook to manage the Naver Map instance and cleaning up the previous library dependency.

## Technical Context

**Language/Version**: TypeScript (Strict Mode)
**Primary Dependencies**:
-   `next/script` (for loading Naver API)
-   `@types/navermaps` (for Type Safety)
-   **Removed**: `react-naver-maps`
**Styling**: Vanilla Extract (Responsive).
**Target Platform**: Mobile Web / Desktop.
**Constraints**:
-   Map script must be loaded securely using Client ID.
-   Initialization must handle `window.naver` availability.

## Constitution Check

-   **Tech Stack**: Native Next.js approach is valid.
-   **Map Library**: Still using Naver Maps (just different implementation method).

**Result**: PASS

## Project Structure

### Documentation (this feature)

```text
specs/003-native-script-map/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md
```

### Source Code (`apps/web`)

```text
apps/web/src/
├── app/
│   └── layout.tsx          # Add <Script> here
├── features/
│   └── map/
│       ├── components/
│       │   └── MapContainer.tsx # Update to use hook
│       ├── hooks/
│       │   └── useMap.ts   # New custom hook for map init
│       └── styles.css.ts
└── shared/
    └── providers/
        └── MapProvider.tsx # Remove or repurpose
```

**Structure Decision**: Custom Hook + Script component.
