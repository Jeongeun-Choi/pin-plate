import type { Metadata } from "next";
import "@pin-plate/ui/src/styles/reset.css.ts"; // UI 패키지의 Reset CSS 적용

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
      <body>{children}</body>
    </html>
  );
}
