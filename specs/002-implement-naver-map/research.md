# Research: Implement Naver Map View

## Decisions

### 1. Map Configuration
**Decision**: Use `react-naver-maps` with `NaverMap` component.
**Rationale**: Official-like React wrapper, easy to use.
**Coordinates**:
-   Initial Center: Seoul City Hall (Latitude: 37.5665, Longitude: 126.9780).
-   Zoom: 15 (Standard street view).

### 2. Responsive Styling
**Decision**: `100dvh` for height.
**Rationale**:
-   `100vh` on mobile browsers often includes the address bar, causing scroll issues.
-   `100dvh` (Dynamic Viewport Height) adjusts to the visible area.
-   Width: `100vw`.

### 3. Component Structure
**Decision**: Client Component (`use client`).
**Rationale**: Map rendering interacts with the DOM and window object (`naver` namespace), so it must be client-side.
