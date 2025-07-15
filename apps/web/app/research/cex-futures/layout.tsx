import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CEX Futures | Research',
  description: 'Centralized Exchange Futures Research Dashboard',
};

export default function CexFuturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
