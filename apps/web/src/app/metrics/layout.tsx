import React from 'react';

export const metadata = {
  title: 'Crypto Metrics Dashboard | CanHav',
  description: 'Real-time cryptocurrency metrics dashboard with market data and funding rates',
};

export default function MetricsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen bg-gray-50">
      {children}
    </section>
  );
}
