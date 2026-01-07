# Data Model / Components

## Hooks

### `useMap`
**Path**: `apps/web/src/features/map/hooks/useMap.ts`
**Parameters**:
-   `mapRef`: `RefObject<HTMLDivElement>`
-   `options`: `naver.maps.MapOptions`
**Returns**: `naver.maps.Map | undefined`

## Components

### `MapContainer`
**Path**: `apps/web/src/features/map/components/MapContainer.tsx`
**Props**: None
**Logic**:
-   Uses `useMap`.
-   Renders `<div ref={mapRef} />`.

### Root Layout
**Path**: `apps/web/src/app/layout.tsx`
**Updates**:
-   Add `<Script src="..." strategy="afterInteractive" />`.
