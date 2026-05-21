import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'contract triage',
  description: 'A small AI demo for teams drowning in repetitive paperwork.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
