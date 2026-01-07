"use client";

import dynamic from "next/dynamic";

const MapContainer = dynamic(() => import("../../features/map/components/MapContainer"), {
  ssr: false,
  loading: () => (
    <div style={{ width: "100vw", height: "100dvh", backgroundColor: "#eee" }}>Loading Map...</div>
  ),
});

export default function Home() {
  return (
    <main style={{ width: "100vw", height: "100dvh", position: "relative" }}>
      <MapContainer />
    </main>
  );
}
