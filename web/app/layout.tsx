import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { Shell } from '@/components/Shell';

import './globals.css';
import './design-system.css';

export const metadata: Metadata = {
  title: 'JobPilot',
  description: 'Piloter sa recherche, ses offres et ses candidatures au même endroit',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
