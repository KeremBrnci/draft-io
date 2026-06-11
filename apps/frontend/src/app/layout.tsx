import type { Metadata } from 'next';

import { FootballCardSilhouetteDefs } from '@/components/cards/card-silhouette';

import './globals.css';
import '@/styles/overlay.css';

export const metadata: Metadata = {
  title: 'draft.io',
  description: 'Football draft and simulation game platform',
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
