'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus, Star, StarOff, TrendingUp, TrendingDown, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { DerivativesLatest } from '@/types/supabase';
import { DerivativesSector, useDerivatives } from '@/hooks/useDerivatives';
import { formatCompactNumber, formatCurrency, formatPercent } from '@/utils/formatters';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useToast } from '@/components/ui/use-toast';
import { AddTradeDialog } from '@/components/portfolio/AddTradeDialog';
import { AddToWatchlistDialog } from '@/components/watchlist/AddToWatchlistDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const [fundingRateTooltipOpen, setFundingRateTooltipOpen] = useState(false);
  
  // State for filtering and pagination
  const [selectedExchange, setSelectedExchange] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
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
  
  // Get unique exchanges for filter dropdown
  const uniqueExchanges = [...new Set(contracts.map(c => c.exchange))].sort();
  
  // Filter contracts by selected exchange
  const filteredContracts = selectedExchange === 'all' 
    ? sortedContracts 
    : sortedContracts.filter(contract => contract.exchange === selectedExchange);
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedContracts = filteredContracts.slice(startIndex, endIndex);
  
  // Reset to page 1 when exchange filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedExchange]);
  
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Derivatives Data (Sorted by Volume)</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Filter by Exchange:</span>
                <Select value={selectedExchange} onValueChange={setSelectedExchange}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Exchanges" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Exchanges</SelectItem>
                    {uniqueExchanges.map(exchange => (
                      <SelectItem key={exchange} value={exchange}>
                        {exchange.charAt(0).toUpperCase() + exchange.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredContracts.length)} of {filteredContracts.length} trades
              </div>
            </div>
          </div>
          <TooltipProvider>
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
                    <TableHead className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        Funding Rate
                        <Tooltip open={fundingRateTooltipOpen} onOpenChange={setFundingRateTooltipOpen}>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-auto p-0 hover:bg-transparent"
                              onClick={() => setFundingRateTooltipOpen(!fundingRateTooltipOpen)}
                            >
                              <Info className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">⚠️ Funding rate data is not accurate and is being resolved. Please use this information with caution.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableHead>
                  )}
                  <TableHead>Timestamp</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {paginatedContracts.map((contract) => (
                <DerivativeRow 
                  key={`${contract.exchange}-${contract.symbol}`}
                  contract={contract}
                  sector={sector}
                />
              ))}
            </TableBody>
            </Table>
          </TooltipProvider>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
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
