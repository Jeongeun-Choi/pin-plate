# Feature Specification: Implement Naver Map View

## Requirements
- Install `react-naver-maps` and `@types/navermaps`.
- Configure environment variable `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` in `.env.local` (already exists, verify access).
- Configure Global Provider:
  - Implement `NavermapsProvider` in `src/app/providers.tsx` (or update existing provider wrapper).
  - Ensure script loading is managed globally.
- Implement Map Component:
  - Create `src/features/map/components/MapContainer.tsx`.
  - Must be a Client Component (`use client`).
  - Initial center: Seoul City Hall or Gangnam Station.
  - Initial zoom level: 15 (default).
- Styling (Vanilla Extract):
  - Map container must take full mobile viewport height (`100dvh`).
  - Use `100vw` width.
