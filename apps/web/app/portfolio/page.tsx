'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { WatchlistTable } from '@/components/WatchlistTable';
import { PortfolioPieChart } from '@/components/PortfolioPieChart';
import { RiskGauge } from '@/components/RiskGauge';
import { useWatchlist } from '@/lib/hooks/useWatchlist';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { auth } from '@clerk/nextjs';

export default function PortfolioPage() {
  const { watchlist, isLoading: isWatchlistLoading, totalValue } = useWatchlist();
  
  // Fetch market data for all assets
  const { data: marketData = [], isLoading: isMarketDataLoading } = useQuery({
    queryKey: ['market-data'],
    queryFn: async () => {
      const response = await fetch('/api/crypto/market-overview');
      if (!response.ok) {
        throw new Error('Failed to fetch market data');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  const isLoading = isWatchlistLoading || isMarketDataLoading;
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Portfolio Dashboard</h1>
      
      <Tabs defaultValue="watchlist" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="watchlist" className="space-y-6">
          {isLoading ? (
            <Skeleton className="w-full h-[400px]" />
          ) : (
            <WatchlistTable marketData={marketData} />
          )}
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              <>
                <Skeleton className="w-full h-[400px]" />
                <Skeleton className="w-full h-[400px]" />
              </>
            ) : (
              <>
                <PortfolioPieChart watchlist={watchlist} totalValue={totalValue} />
                <RiskGauge watchlist={watchlist} marketData={marketData} />
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
