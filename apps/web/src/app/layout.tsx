import type { Metadata } from "next";
import '../shared/styles/reset.css';
import '../shared/styles/theme.css';
import { MapProvider } from '../shared/providers/MapProvider';

export const metadata: Metadata = {
  title: "Pin Plate",
  description: "Record your favorite places",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MapProvider>
          {children}
        </MapProvider>
      </body>
    </html>
  );
}