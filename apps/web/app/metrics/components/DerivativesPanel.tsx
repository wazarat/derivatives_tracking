import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DerivativesLatest } from '@/types/supabase';
import { DerivativesSector, useDerivatives } from '@/hooks/useDerivatives';
import { formatCurrency, formatCompactNumber, formatPercent } from '@/utils/format';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DerivativesPanelProps {
  sector: DerivativesSector;
  title: string;
}

export function DerivativesPanel({ sector, title }: DerivativesPanelProps) {
  const { data, isLoading, error } = useDerivatives(sector);
  
  if (error) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">Error loading derivatives data: {error.message}</div>
        </CardContent>
      </Card>
    );
  }
  
  if (isLoading || !data) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-[100px]" />
              <Skeleton className="h-[100px]" />
              <Skeleton className="h-[100px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const { stats, data: contracts } = data;
  
  // Sort contracts by volume_24h (descending)
  const sortedContracts = [...contracts].sort((a, b) => b.volume_24h - a.volume_24h);
  
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats cards */}
          <div className="bg-muted rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">Total Open Interest</div>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalOpenInterest)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Across {stats.contractCount} contracts
            </div>
          </div>
          
          <div className="bg-muted rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">24h Volume</div>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalVolume24h)}</div>
          </div>
          
          <div className="bg-muted rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">Avg. Funding Rate</div>
            <div className="text-2xl font-bold">
              {stats.averageFundingRate !== null 
                ? formatPercent(stats.averageFundingRate) 
                : 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {sector === 'cex-futures' ? 'Not applicable for futures' : '8h rate'}
            </div>
          </div>
        </div>
        
        {/* Derivatives Data Table */}
        <div className="mt-8 overflow-x-auto">
          <h3 className="text-lg font-medium mb-4">Derivatives Data (Sorted by Volume)</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exchange</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Contract Type</TableHead>
                <TableHead className="text-right">Volume 24h</TableHead>
                <TableHead className="text-right">Open Interest</TableHead>
                <TableHead className="text-right">Index Price</TableHead>
                <TableHead className="text-right">Funding Rate</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedContracts.slice(0, 20).map((contract) => (
                <TableRow key={`${contract.exchange}-${contract.symbol}`}>
                  <TableCell className="font-medium">{contract.exchange}</TableCell>
                  <TableCell>{contract.symbol}</TableCell>
                  <TableCell>{contract.contract_type}</TableCell>
                  <TableCell className="text-right">{formatCompactNumber(contract.volume_24h)}</TableCell>
                  <TableCell className="text-right">{formatCompactNumber(contract.oi_usd)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(contract.index_price)}</TableCell>
                  <TableCell className="text-right">
                    {contract.funding_rate !== null ? formatPercent(contract.funding_rate) : 'N/A'}
                  </TableCell>
                  <TableCell className="text-xs">{new Date(contract.ts).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Funding Rate Heatmap (only for perpetuals) */}
        {sector !== 'cex-futures' && (
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Funding Rates</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {sortedContracts
                .filter(c => c.funding_rate !== null)
                .slice(0, 20)
                .map((contract) => {
                  // Determine color based on funding rate
                  const fundingRate = contract.funding_rate || 0;
                  let bgColor = 'bg-gray-100';
                  
                  if (fundingRate > 0.001) bgColor = 'bg-red-500';
                  else if (fundingRate > 0.0005) bgColor = 'bg-red-300';
                  else if (fundingRate > 0.0001) bgColor = 'bg-red-100';
                  else if (fundingRate < -0.001) bgColor = 'bg-green-500';
                  else if (fundingRate < -0.0005) bgColor = 'bg-green-300';
                  else if (fundingRate < -0.0001) bgColor = 'bg-green-100';
                  
                  return (
                    <div
                      key={`${contract.exchange}-${contract.symbol}-fr`}
                      className={`${bgColor} rounded-md p-2 text-center`}
                    >
                      <div className="text-xs font-mono truncate">{contract.symbol}</div>
                      <div className="text-sm font-bold">{formatPercent(fundingRate)}</div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
