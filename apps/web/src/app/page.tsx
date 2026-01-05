"use client";

import dynamic from "next/dynamic";
import { NavermapsProvider } from "react-naver-maps";

const MapContainer = dynamic(() => import("../features/map/components/MapContainer"), {
  ssr: false,
  loading: () => (
    <div style={{ width: "100vw", height: "100dvh", backgroundColor: "#eee" }}>Loading Map...</div>
  ),
});

export default function Home() {
  return (
    <main>
      <MapContainer />
    </main>
  );
}
