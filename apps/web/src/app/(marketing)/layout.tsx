import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TestPulse AI',
  description: 'AI-Powered Test Reliability Platform',
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}