# Feature Specification: Native Naver Map Script Implementation

## Requirements
- Remove `react-naver-maps` dependency.
- Use `next/script` to load Naver Maps API.
  - Strategy: Load in root layout or specific provider, with `strategy="beforeInteractive"` or `onLoad` handling.
- Create a custom hook `useNaverMap` (or similar) to manage:
  - Script loading state.
  - Map initialization.
  - Map instance access.
- Implement `MapContainer` component:
  - Uses the custom hook.
  - Renders a `div` with a `ref`.
  - Initializes `new naver.maps.Map()` when script is ready.
- Styling:
  - Full viewport (`100dvh`, `100vw`).
- Global Type Definition:
  - Declare `naver` global object for TypeScript support (`@types/navermaps` might still be useful or manual declaration).
