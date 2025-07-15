import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CEX Perpetuals | Research',
  description: 'Centralized Exchange Perpetual Futures Research Dashboard',
};

export default function CexPerpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
