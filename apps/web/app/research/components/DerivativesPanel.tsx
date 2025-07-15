import React from 'react';
import { useDerivatives, calculateDerivativesStats, DerivativesSector } from '../../../src/hooks/useDerivatives';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

// Define local format functions since the import is not working
function formatNumber(value: number, options: Intl.NumberFormatOptions = {}) {
  return new Intl.NumberFormat('en-US', options).format(value);
}

function formatPercent(value: number | null) {
  if (value === null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
    signDisplay: 'exceptZero',
  }).format(value);
}

interface DerivativesPanelProps {
  sector: DerivativesSector;
  title: string;
}

export function DerivativesPanel({ sector, title }: DerivativesPanelProps) {
  // Fetch derivatives data
  const { data, isLoading, isError, error } = useDerivatives(sector);
  
  // Get top contracts by open interest
  const topContracts = React.useMemo(() => {
    if (!data || !data.data) return [];
    return [...data.data]
      .sort((a, b) => b.oi_usd - a.oi_usd)
      .slice(0, 10);
  }, [data]);
  
  // Render loading state
  if (isLoading) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Loading derivatives data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Render error state
  if (isError) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Error loading derivatives data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 text-red-700 rounded-md">
            {error?.message || 'Failed to load derivatives data'}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Extract stats from the data
  const stats = data?.stats || {
    totalOpenInterest: 0,
    totalVolume24h: 0,
    averageFundingRate: null,
    contractCount: 0
  };
  
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              {stats.contractCount} contracts • Updated {new Date().toLocaleTimeString()}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-slate-100">
              OI: {formatNumber(stats.totalOpenInterest, { style: 'currency', currency: 'USD', notation: 'compact' })}
            </Badge>
            <Badge variant="outline" className="bg-slate-100">
              24h Vol: {formatNumber(stats.totalVolume24h, { style: 'currency', currency: 'USD', notation: 'compact' })}
            </Badge>
            {stats.averageFundingRate !== null && (
              <Badge 
                variant="outline" 
                className={`${stats.averageFundingRate > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
              >
                Avg Funding: {formatPercent(stats.averageFundingRate)}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Open Interest Bar Chart */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Top Contracts by Open Interest</h3>
            <div className="space-y-1">
              {topContracts.map((contract) => (
                <div key={`${contract.exchange}-${contract.symbol}`} className="flex items-center gap-2">
                  <div className="w-24 truncate text-sm font-medium">
                    {contract.symbol}
                  </div>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500" 
                      style={{ width: `${(contract.oi_usd / (topContracts[0]?.oi_usd || 1)) * 100}%` }}
                    />
                  </div>
                  <div className="w-24 text-xs text-right">
                    {formatNumber(contract.oi_usd, { style: 'currency', currency: 'USD', notation: 'compact' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Funding Rate Heat Map (only for perpetuals) */}
          {sector.includes('perps') && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Funding Rates</h3>
              <div className="grid grid-cols-5 gap-1">
                {topContracts.map((contract) => {
                  const fundingRate = contract.funding_rate || 0;
                  const intensity = Math.min(Math.abs(fundingRate) * 20, 1); // Scale for visual intensity
                  const bgColor = fundingRate > 0 
                    ? `rgba(34, 197, 94, ${intensity})` // green
                    : `rgba(239, 68, 68, ${intensity})`; // red
                  
                  return (
                    <div 
                      key={`funding-${contract.exchange}-${contract.symbol}`}
                      className="p-2 rounded text-center text-xs"
                      style={{ backgroundColor: bgColor }}
                      title={`${contract.symbol}: ${formatPercent(fundingRate)}`}
                    >
                      <div className="font-medium truncate">{contract.symbol}</div>
                      <div>{formatPercent(fundingRate)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
