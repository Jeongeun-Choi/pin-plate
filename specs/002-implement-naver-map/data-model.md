# Data Model / Components

## Components

### `MapContainer`
**Path**: `apps/web/src/features/map/components/MapContainer.tsx`
**Props**: None (initially).
**State**:
-   Implicit map state (center, zoom) managed by `react-naver-maps`.
**Rendering**:
-   Renders `<NaverMap>` within a styled `div`.

### `MapProvider`
**Path**: `apps/web/src/shared/providers/MapProvider.tsx`
**Props**: `children: ReactNode`
**Config**:
-   `ncpClientId`: From `process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`.
