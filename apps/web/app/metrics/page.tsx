'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, BarChart2 } from 'lucide-react';
import { formatNumber, formatCurrency, formatPercent } from '../../lib/utils';
import Link from 'next/link';
import { ArrowUpRight, ChevronDown, ChevronUp, Filter, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

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

export default async function MetricsDashboard() {
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

  // Mock data for UI demonstration
  const topCryptos = metrics;

  const gainers = topCryptos
    .filter(crypto => crypto.percent_change_24h > 0)
    .sort((a, b) => b.percent_change_24h - a.percent_change_24h)
    .slice(0, 5);

  const losers = topCryptos
    .filter(crypto => crypto.percent_change_24h < 0)
    .sort((a, b) => a.percent_change_24h - b.percent_change_24h)
    .slice(0, 5);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page Header */}
      <div className="border-b">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <h1 className="text-lg font-semibold">Crypto Metrics</h1>
        </div>
      </div>
      
      {/* Page Content */}
      <div className="container px-4 py-6 md:px-6 md:py-8">
        {/* Market Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Market Cap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview ? formatCurrency(overview.total_market_cap) : '-'}</div>
              <p className="text-xs text-muted-foreground">
                <span className={`inline-flex items-center ${overview && overview.total_market_cap > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {overview && overview.total_market_cap > 0 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {overview ? formatPercent(overview.total_market_cap / (overview.total_market_cap - 1000000000)) : '0'}%
                </span>{" "}
                from yesterday
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                24h Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview ? formatCurrency(overview.total_volume_24h) : '-'}</div>
              <p className="text-xs text-muted-foreground">
                <span className={`inline-flex items-center ${overview && overview.total_volume_24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {overview && overview.total_volume_24h > 0 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {overview ? formatPercent(overview.total_volume_24h / (overview.total_volume_24h - 1000000000)) : '0'}%
                </span>{" "}
                from yesterday
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                BTC Dominance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview ? formatPercent(overview.btc_dominance) : '-'}</div>
              <p className="text-xs text-muted-foreground">
                <span className={`inline-flex items-center ${overview && overview.btc_dominance > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {overview && overview.btc_dominance > 0 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {overview ? formatPercent(overview.btc_dominance / (overview.btc_dominance - 0.01)) : '0'}%
                </span>{" "}
                from yesterday
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Cryptocurrencies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview ? overview.active_cryptocurrencies : '-'}</div>
              <p className="text-xs text-muted-foreground">
                <span className={`inline-flex items-center ${overview && overview.active_cryptocurrencies > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {overview && overview.active_cryptocurrencies > 0 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {overview ? overview.active_cryptocurrencies : '0'}
                </span>{" "}
                new today
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search cryptocurrencies..."
              className="pl-8 w-full"
            />
          </div>
          <div className="flex gap-2">
            <Select defaultValue="market_cap">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market_cap">Market Cap</SelectItem>
                <SelectItem value="volume">Volume (24h)</SelectItem>
                <SelectItem value="price_change">Price Change (24h)</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Cryptocurrencies</TabsTrigger>
            <TabsTrigger value="gainers">Top Gainers</TabsTrigger>
            <TabsTrigger value="losers">Top Losers</TabsTrigger>
          </TabsList>
          
          {/* All Cryptocurrencies Tab */}
          <TabsContent value="all" className="space-y-4">
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="border-b transition-colors hover:bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium">#</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                      <th className="h-12 px-4 text-right align-middle font-medium">Price</th>
                      <th className="h-12 px-4 text-right align-middle font-medium">24h %</th>
                      <th className="h-12 px-4 text-right align-middle font-medium">Market Cap</th>
                      <th className="h-12 px-4 text-right align-middle font-medium">Volume (24h)</th>
                      <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCryptos.map((crypto, index) => (
                      <tr key={crypto.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">{index + 1}</td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{crypto.name}</span>
                            <span className="text-muted-foreground">{crypto.symbol}</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle text-right">
                          {formatCurrency(crypto.price)}
                        </td>
                        <td className="p-4 align-middle text-right">
                          <span className={`inline-flex items-center ${crypto.percent_change_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {crypto.percent_change_24h >= 0 ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                            {Math.abs(crypto.percent_change_24h)}%
                          </span>
                        </td>
                        <td className="p-4 align-middle text-right">
                          {formatCurrency(crypto.market_cap)}
                        </td>
                        <td className="p-4 align-middle text-right">
                          {formatCurrency(crypto.volume_24h)}
                        </td>
                        <td className="p-4 align-middle text-right">
                          <Link href={`/metrics/${crypto.symbol.toLowerCase()}`}>
                            <Button variant="ghost" size="sm">
                              <ArrowUpRight className="h-4 w-4 mr-1" /> Details
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
          
          {/* Top Gainers Tab */}
          <TabsContent value="gainers" className="space-y-4">
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="border-b transition-colors hover:bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium">#</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                      <th className="h-12 px-4 text-right align-middle font-medium">Price</th>
                      <th className="h-12 px-4 text-right align-middle font-medium">24h %</th>
                      <th className="h-12 px-4 text-right align-middle font-medium">Market Cap</th>
                      <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gainers.map((crypto, index) => (
                      <tr key={crypto.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">{index + 1}</td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{crypto.name}</span>
                            <span className="text-muted-foreground">{crypto.symbol}</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle text-right">
                          {formatCurrency(crypto.price)}
                        </td>
                        <td className="p-4 align-middle text-right">
                          <span className="inline-flex items-center text-green-500">
                            <ChevronUp className="h-4 w-4 mr-1" />
                            {crypto.percent_change_24h}%
                          </span>
                        </td>
                        <td className="p-4 align-middle text-right">
                          {formatCurrency(crypto.market_cap)}
                        </td>
                        <td className="p-4 align-middle text-right">
                          <Link href={`/metrics/${crypto.symbol.toLowerCase()}`}>
                            <Button variant="ghost" size="sm">
                              <ArrowUpRight className="h-4 w-4 mr-1" /> Details
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
          
          {/* Top Losers Tab */}
          <TabsContent value="losers" className="space-y-4">
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="border-b transition-colors hover:bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium">#</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                      <th className="h-12 px-4 text-right align-middle font-medium">Price</th>
                      <th className="h-12 px-4 text-right align-middle font-medium">24h %</th>
                      <th className="h-12 px-4 text-right align-middle font-medium">Market Cap</th>
                      <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {losers.map((crypto, index) => (
                      <tr key={crypto.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">{index + 1}</td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{crypto.name}</span>
                            <span className="text-muted-foreground">{crypto.symbol}</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle text-right">
                          {formatCurrency(crypto.price)}
                        </td>
                        <td className="p-4 align-middle text-right">
                          <span className="inline-flex items-center text-red-500">
                            <ChevronDown className="h-4 w-4 mr-1" />
                            {Math.abs(crypto.percent_change_24h)}%
                          </span>
                        </td>
                        <td className="p-4 align-middle text-right">
                          {formatCurrency(crypto.market_cap)}
                        </td>
                        <td className="p-4 align-middle text-right">
                          <Link href={`/metrics/${crypto.symbol.toLowerCase()}`}>
                            <Button variant="ghost" size="sm">
                              <ArrowUpRight className="h-4 w-4 mr-1" /> Details
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
