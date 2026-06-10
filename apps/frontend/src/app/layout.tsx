import type { Metadata } from 'next';

import './globals.css';

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
      <body>{children}</body>
    </html>
  );
}
