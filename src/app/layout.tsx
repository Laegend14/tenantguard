import type { Metadata } from 'next';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/ThemeProvider';
import { RootLayoutClient } from './RootLayoutClient';

export const metadata: Metadata = {
  title: 'TenantGuard NYC | AI Tenant Rights, Eviction Defense & Deposit Recovery',
  description: 'Empowering New York City tenants against unlawful eviction demands and withholding of security deposits under the 2019 HSTPA and NY GOL § 7-108.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" data-theme="light" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        </head>
        <body className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] antialiased transition-colors">
          <ThemeProvider>
            <RootLayoutClient>
              {children}
            </RootLayoutClient>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
