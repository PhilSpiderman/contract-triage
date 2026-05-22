import './globals.css';
import { Inter, Fraunces } from 'next/font/google';
import type { Metadata } from 'next';
import { isIndexingAllowed } from '@/lib/config';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  weight: ['400', '600', '700'],
});

export const metadata: Metadata = {
  title: 'contract triage — hands on with.ai',
  description:
    'A small AI demo for teams drowning in repetitive paperwork. Built as a working example by Chris @ hands on with.ai.',
  robots: isIndexingAllowed() ? undefined : { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
