'use client';

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useWatchlist, WatchlistItem } from '@/lib/hooks/useWatchlist';

interface CryptoMarketData {
  symbol: string;
  price: number;
  percent_change_24h: number;
}

interface WatchlistTableProps {
  marketData: CryptoMarketData[];
}

export function WatchlistTable({ marketData }: WatchlistTableProps) {
  const { watchlist, isLoading, addAsset, updateAllocation, removeAsset, totalValue } = useWatchlist();
  const [newSymbol, setNewSymbol] = useState('');
  const [newValue, setNewValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Handle adding a new asset
  const handleAddAsset = async () => {
    if (!newSymbol || !newValue) {
      setError('Please enter both symbol and USD value');
      return;
    }

    const symbol = newSymbol.toUpperCase();
    const usd_value = parseFloat(newValue);

    if (isNaN(usd_value) || usd_value <= 0) {
      setError('Please enter a valid USD value');
      return;
    }

    // Check if symbol exists in market data
    const symbolExists = marketData.some(item => item.symbol === symbol);
    if (!symbolExists) {
      setError(`Symbol ${symbol} not found in available assets`);
      return;
    }

    try {
      await addAsset.mutateAsync({ symbol, usd_value });
      setNewSymbol('');
      setNewValue('');
      setError(null);
    } catch (err) {
      setError('Failed to add asset to watchlist');
      console.error(err);
    }
  };

  // Handle updating allocation
  const handleUpdateAllocation = async (symbol: string, value: string) => {
    const usd_value = parseFloat(value);
    if (isNaN(usd_value) || usd_value < 0) {
      setError('Please enter a valid USD value');
      return;
    }

    try {
      await updateAllocation.mutateAsync({ symbol, usd_value });
      setError(null);
    } catch (err) {
      setError('Failed to update allocation');
      console.error(err);
    }
  };

  // Handle removing an asset
  const handleRemoveAsset = async (symbol: string) => {
    try {
      await removeAsset.mutateAsync(symbol);
      setError(null);
    } catch (err) {
      setError('Failed to remove asset from watchlist');
      console.error(err);
    }
  };

  // Get current price for a symbol
  const getCurrentPrice = (symbol: string): number => {
    const asset = marketData.find(item => item.symbol === symbol);
    return asset ? asset.price : 0;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Portfolio Watchlist</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        <div className="flex items-center space-x-2 mb-4">
          <Input
            placeholder="Symbol (e.g., BTC)"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
            className="w-1/3"
          />
          <Input
            placeholder="USD Value"
            type="number"
            min="0"
            step="0.01"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="w-1/3"
          />
          <Button 
            onClick={handleAddAsset} 
            disabled={isLoading || addAsset.isPending}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Allocation ($)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {watchlist.length > 0 ? (
                watchlist.map((item: WatchlistItem) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.symbol}</TableCell>
                    <TableCell>{formatCurrency(getCurrentPrice(item.symbol))}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.usd_value}
                        onChange={(e) => handleUpdateAllocation(item.symbol, e.target.value)}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveAsset(item.symbol)}
                        disabled={removeAsset.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    {isLoading ? 'Loading...' : 'No assets in watchlist. Add your first asset above.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {watchlist.length > 0 && (
          <div className="mt-4 text-right">
            <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
            <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
