import type { Metadata, Viewport } from 'next';

import { FootballCardSilhouetteDefs } from '@/components/cards/card-silhouette';

import './globals.css';
import '@/styles/overlay.css';
import '@/styles/play-responsive.css';

export const metadata: Metadata = {
  title: 'draft.io',
  description: 'Football draft and simulation game platform',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <FootballCardSilhouetteDefs />
        <div id="app-portal" />
        {children}
      </body>
    </html>
  );
}
