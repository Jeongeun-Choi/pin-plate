import type { Metadata } from 'next';
import QueryProvider from '@/providers/QueryProvider';
import MapProvider from '@/providers/MapProvider';
import { GuestPostsProvider } from '@/features/guest/providers/GuestPostsProvider';
import '@pin-plate/ui/reset'; // UI 패키지의 Reset CSS 적용

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
      <body>
        <QueryProvider>
          <MapProvider>
            <GuestPostsProvider>
              {children}
              {modal}
            </GuestPostsProvider>
          </MapProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
