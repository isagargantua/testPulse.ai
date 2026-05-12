import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'TestPulse AI - AI-Powered Test Reliability Platform',
  description: 'Analyze failed automation tests, identify flaky test root causes, and generate fix recommendations.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={dmSans.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
