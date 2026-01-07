"use client";

import Script from "next/script";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="naver-map-script"
        strategy="afterInteractive"
        type="text/javascript"
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`}
      ></Script>
      {children}
    </>
  );
}
