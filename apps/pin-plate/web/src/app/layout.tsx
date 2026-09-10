import type { Metadata } from 'next';
import Script from 'next/script';
import QueryProvider from '@/providers/QueryProvider';
import MapProvider from '@/providers/MapProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import '@pin-plate/ui/reset'; // UI 패키지의 Reset CSS 적용
import './boundary.styles.css';

const googleAnalyticsMeasurementId =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';
const googleAnalyticsMeasurementIdForScript = JSON.stringify(
  googleAnalyticsMeasurementId,
);

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pin Plate',
  description: 'Record your favorite places',
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {googleAnalyticsMeasurementId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
                googleAnalyticsMeasurementId,
              )}`}
              strategy="afterInteractive"
            />
            <Script id="google-tag" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', ${googleAnalyticsMeasurementIdForScript});
              `}
            </Script>
          </>
        ) : null}
      </head>
      <body>
        <QueryProvider>
          <ToastProvider>
            <MapProvider>
              {children}
              {modal}
            </MapProvider>
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
