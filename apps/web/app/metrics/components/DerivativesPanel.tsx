'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus, Star, StarOff, TrendingUp, TrendingDown } from 'lucide-react';
import { DerivativesLatest } from '@/types/supabase';
import { DerivativesSector, useDerivatives } from '@/hooks/useDerivatives';
import { formatCompactNumber, formatCurrency, formatPercent } from '@/utils/formatters';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useToast } from '@/components/ui/use-toast';
import { AddTradeDialog } from '@/components/portfolio/AddTradeDialog';
import { AddToWatchlistDialog } from '@/components/watchlist/AddToWatchlistDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DerivativesPanelProps {
  sector: DerivativesSector;
  title: string;
}

interface DerivativeRowProps {
  contract: DerivativesLatest;
  sector: DerivativesSector;
}

function DerivativeRow({ contract, sector }: DerivativeRowProps) {
  
  // Create pre-filled trade data for the AddTradeDialog
  const prefilledTradeData = {
    exchange: contract.exchange,
    symbol: contract.symbol,
    entry_price: contract.index_price.toString(),
  };
  
  return (
    <TableRow>
      <TableCell className="font-medium">{contract.exchange}</TableCell>
      <TableCell>{contract.symbol}</TableCell>
      <TableCell>{contract.contract_type}</TableCell>
      <TableCell className="text-right">{formatCompactNumber(contract.vol24h)}</TableCell>
      <TableCell className="text-right">{formatCurrency(contract.index_price)}</TableCell>
      {/* Only show Funding Rate cell for DEX derivatives */}
      {sector === 'dex-perps' && (
        <TableCell className="text-right">
          {contract.funding_rate !== null ? formatPercent(contract.funding_rate) : 'N/A'}
        </TableCell>
      )}
      <TableCell className="text-xs">{new Date(contract.ts).toLocaleString()}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <AddToWatchlistDialog contract={contract} />
          
          <AddTradeDialog
            trigger={
              <Button variant="default" size="sm" className="h-8 px-2">
                <Plus className="h-3 w-3 mr-1" />
                Add to Portfolio
              </Button>
            }
            prefilledData={prefilledTradeData}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}

interface PrefilledAddTradeDialogProps {
  prefilledData: {
    exchange: string;
    symbol: string;
    entry_price: string;
  };
}

function PrefilledAddTradeDialog({ prefilledData }: PrefilledAddTradeDialogProps) {
  return (
    <AddTradeDialog 
      trigger={
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Plus className="h-4 w-4" />
        </Button>
      }
      prefilledData={prefilledData}
    />
  );
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
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-[100px]" />
              <Skeleton className="h-[100px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const { stats, data: contracts } = data;
  
  // Sort contracts by vol24h (descending)
  const sortedContracts = [...contracts].sort((a, b) => b.vol24h - a.vol24h);
  
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stats cards - removed open interest */}
          <div className="bg-muted rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">24h Volume</div>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalVolume24h)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Across {stats.contractCount} contracts
            </div>
          </div>
          
          <div className="bg-muted rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">Top Volume Derivative</div>
            <div className="text-2xl font-bold">
              {sortedContracts.length > 0 ? sortedContracts[0].symbol : 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {sortedContracts.length > 0 
                ? `${formatCompactNumber(sortedContracts[0].vol24h)} 24h volume on ${sortedContracts[0].exchange}`
                : 'No data available'
              }
            </div>
          </div>
        </div>
        
        {/* Derivatives Data Table - removed open interest column */}
        <div className="mt-8 overflow-x-auto">
          <h3 className="text-lg font-medium mb-4">Derivatives Data (Sorted by Volume)</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exchange</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Contract Type</TableHead>
                <TableHead className="text-right">Volume 24h</TableHead>
                <TableHead className="text-right">Index Price</TableHead>
                {/* Only show Funding Rate column for DEX derivatives */}
                {sector === 'dex-perps' && (
                  <TableHead className="text-right">Funding Rate</TableHead>
                )}
                <TableHead>Timestamp</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedContracts.slice(0, 20).map((contract) => (
                <DerivativeRow 
                  key={`${contract.exchange}-${contract.symbol}`}
                  contract={contract}
                  sector={sector}
                />
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Funding Rate Heatmap (only for DEX derivatives) */}
        {sector === 'dex-perps' && (
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
