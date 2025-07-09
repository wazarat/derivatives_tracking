'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, BarChart2 } from 'lucide-react';
import { formatNumber, formatCurrency, formatPercent } from '@/lib/utils';

interface CryptoMetric {
  id: number;
  name: string;
  symbol: string;
  price: number;
  percent_change_24h: number;
  volume_24h: number;
  market_cap: number;
  last_updated: string;
}

interface MarketOverview {
  total_market_cap: number;
  total_volume_24h: number;
  btc_dominance: number;
  eth_dominance: number;
  active_cryptocurrencies: number;
  last_updated: string;
}

export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState<CryptoMetric[]>([]);
  const [overview, setOverview] = useState<MarketOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Function to fetch data from API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch metrics data
      const metricsResponse = await fetch('/api/crypto/dashboard-metrics');
      if (!metricsResponse.ok) {
        throw new Error(`Failed to fetch metrics: ${metricsResponse.statusText}`);
      }
      const metricsData = await metricsResponse.json();
      
      // Fetch market overview data
      const overviewResponse = await fetch('/api/crypto/market-overview');
      if (!overviewResponse.ok) {
        throw new Error(`Failed to fetch market overview: ${overviewResponse.statusText}`);
      }
      const overviewData = await overviewResponse.json();
      
      // Update state
      setMetrics(metricsData);
      setOverview(overviewData);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and every 30 seconds
  useEffect(() => {
    fetchData();
    
    // Set up interval for auto-refresh
    const intervalId = setInterval(fetchData, 30000); // 30 seconds
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Format last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never';
    return lastUpdated.toLocaleTimeString();
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Crypto Metrics Dashboard</h1>
        <Button 
          onClick={fetchData} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Market Cap</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview ? formatCurrency(overview.total_market_cap) : '-'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">24h Trading Volume</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview ? formatCurrency(overview.total_volume_24h) : '-'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">BTC Dominance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview ? formatPercent(overview.btc_dominance) : '-'}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Top Cryptocurrencies</CardTitle>
          <p className="text-sm text-muted-foreground">
            Last updated: {formatLastUpdated()}
          </p>
        </CardHeader>
        <CardContent>
          {loading && metrics.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">24h Change</TableHead>
                    <TableHead className="text-right">Volume (24h)</TableHead>
                    <TableHead className="text-right">Market Cap</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.length > 0 ? (
                    metrics.slice(0, 20).map((crypto) => (
                      <TableRow key={crypto.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{crypto.symbol}</span>
                            <span className="text-muted-foreground">{crypto.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(crypto.price)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className={`flex items-center justify-end gap-1 ${
                            crypto.percent_change_24h > 0 
                              ? 'text-green-600' 
                              : crypto.percent_change_24h < 0 
                                ? 'text-red-600' 
                                : ''
                          }`}>
                            {crypto.percent_change_24h > 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : crypto.percent_change_24h < 0 ? (
                              <TrendingDown className="h-4 w-4" />
                            ) : null}
                            {formatPercent(crypto.percent_change_24h)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(crypto.volume_24h)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(crypto.market_cap)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        {error ? 'Failed to load data' : 'No data available'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="text-sm text-muted-foreground text-center">
        Data provided by CoinMarketCap API. Refreshes automatically every 30 seconds.
      </div>
    </div>
  );
}
