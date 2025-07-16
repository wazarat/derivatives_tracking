'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { fetchAssetById, fetchAssetMetrics, fetchAssetRiskScore } from '../../../services/assetService';
import { riskTierColors, riskTierDisplayNames, sectorDisplayNames } from '../../../types/assets';
import { Loader2, ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { WatchlistButton } from '../../../components/assets/WatchlistButton';
import { InfoTooltip } from '../../../components/ui/info-tooltip';

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  // Add null check for params
  if (!params || !params.id) {
    return (
      <div className="container mx-auto py-12 text-center">
        <p className="text-destructive mb-4">Invalid asset ID</p>
        <Button onClick={() => router.push('/assets')}>Go to Assets</Button>
      </div>
    );
  }
  
  const assetId = params.id as string;

  // Fetch asset details
  const { 
    data: asset, 
    isLoading: isLoadingAsset, 
    isError: isAssetError,
    error: assetError
  } = useQuery({
    queryKey: ['asset', assetId],
    queryFn: () => fetchAssetById(assetId),
  });

  // Fetch asset risk score
  const { 
    data: riskScore,
    isLoading: isLoadingRiskScore
  } = useQuery({
    queryKey: ['assetRiskScore', assetId],
    queryFn: () => fetchAssetRiskScore(assetId),
    enabled: !!asset,
  });

  // Fetch price history (last 30 days)
  const { 
    data: priceMetrics,
    isLoading: isLoadingPriceMetrics
  } = useQuery({
    queryKey: ['assetMetrics', assetId, 'price_usd'],
    queryFn: () => fetchAssetMetrics(assetId, 'price_usd'),
    enabled: !!asset,
  });

  // Fetch volume history (last 30 days)
  const { 
    data: volumeMetrics,
    isLoading: isLoadingVolumeMetrics
  } = useQuery({
    queryKey: ['assetMetrics', assetId, 'volume_24h'],
    queryFn: () => fetchAssetMetrics(assetId, 'volume_24h'),
    enabled: !!asset,
  });

  // Handle back button
  const handleBack = () => {
    router.back();
  };

  // Format price metrics for chart
  const formatPriceData = () => {
    if (!priceMetrics?.metrics) return [];
    
    return priceMetrics.metrics
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(metric => ({
        date: format(new Date(metric.timestamp), 'MMM dd'),
        value: metric.value
      }));
  };

  // Format volume metrics for chart
  const formatVolumeData = () => {
    if (!volumeMetrics?.metrics) return [];
    
    return volumeMetrics.metrics
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(metric => ({
        date: format(new Date(metric.timestamp), 'MMM dd'),
        value: metric.value
      }));
  };

  // Loading state
  if (isLoadingAsset) {
    return (
      <div className="container mx-auto py-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading asset details...</span>
      </div>
    );
  }

  // Error state
  if (isAssetError) {
    return (
      <div className="container mx-auto py-12 text-center">
        <p className="text-destructive mb-4">
          Error loading asset: {(assetError as Error).message}
        </p>
        <Button onClick={handleBack}>Go Back</Button>
      </div>
    );
  }

  // If asset not found
  if (!asset) {
    return (
      <div className="container mx-auto py-12 text-center">
        <p className="text-destructive mb-4">Asset not found</p>
        <Button onClick={handleBack}>Go Back</Button>
      </div>
    );
  }

  // Format price for display
  const formatPrice = (price: number | undefined) => {
    if (price === undefined) return '-';
    
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    if (price < 10) return price.toFixed(2);
    return price.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  // Format percentage for display
  const formatPercentage = (value: number | undefined) => {
    if (value === undefined) return '-';
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Format large numbers (market cap, volume)
  const formatLargeNumber = (num: number | undefined) => {
    if (num === undefined) return '-';
    
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  // Determine price change color
  const getPriceChangeColor = (value: number | undefined) => {
    if (value === undefined) return 'text-muted-foreground';
    return value >= 0 ? 'text-green-500' : 'text-red-500';
  };

  // Get risk tier color
  const getRiskColor = () => {
    if (!asset.risk_tier) return 'bg-gray-200 dark:bg-gray-700';
    return riskTierColors[asset.risk_tier] || 'bg-gray-200 dark:bg-gray-700';
  };

  // Get risk tier name
  const getRiskTierName = () => {
    if (!asset.risk_tier) return 'Unknown';
    return riskTierDisplayNames[asset.risk_tier] || 'Unknown';
  };

  // Get sector display name
  const getSectorDisplayName = () => {
    if (!asset.sector) return 'Unknown';
    return sectorDisplayNames[asset.sector.toString()] || asset.sector.toString();
  };

  const priceData = formatPriceData();
  const volumeData = formatVolumeData();

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" className="gap-1" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {asset.logo_url && (
            <div className="relative h-12 w-12">
              <Image
                src={asset.logo_url}
                alt={asset.name || 'Asset logo'}
                fill
                className="rounded-full object-contain"
              />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {asset.name}
              <span className="text-lg font-normal text-muted-foreground">
                {asset.ticker}
              </span>
              <WatchlistButton asset={asset} />
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">
                {getSectorDisplayName()}
              </span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className={`text-sm px-2 py-0.5 rounded-full ${getRiskColor()} bg-opacity-20`}>
                {getRiskTierName()} Risk
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="text-2xl font-bold">
            {formatPrice(asset.market_data?.price_usd)}
          </div>
          <div className={`flex items-center ${getPriceChangeColor(asset.market_data?.percent_change_24h)}`}>
            {formatPercentage(asset.market_data?.percent_change_24h)}
            <span className="text-sm ml-1">(24h)</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Market Cap</p>
                <h3 className="text-xl font-bold">
                  {formatLargeNumber(asset.market_data?.market_cap_usd)}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Volume (24h)</p>
                <h3 className="text-xl font-bold">
                  {formatLargeNumber(asset.market_data?.volume_24h_usd)}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">APY</p>
                <h3 className="text-xl font-bold">
                  {asset.market_data?.apy !== undefined 
                    ? `${(asset.market_data.apy * 100).toFixed(2)}%` 
                    : '-'}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="price">Price Chart</TabsTrigger>
          <TabsTrigger value="volume">Volume Chart</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>About {asset.name}</CardTitle>
              <CardDescription>Key information and description</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">
                  {asset.description || 'No description available.'}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Website</p>
                    {asset.website ? (
                      <a 
                        href={asset.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        {asset.website}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <p>-</p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Explorer</p>
                    {asset.website ? (
                      <a 
                        href={asset.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        View on Explorer
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <p>-</p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Launch Date</p>
                    <p>{asset.created_at ? format(new Date(asset.created_at), 'MMMM d, yyyy') : '-'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Category</p>
                    <p>{asset.sector ? sectorDisplayNames[asset.sector] : '-'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="price" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Price History</CardTitle>
              <CardDescription>Last 30 days price movement</CardDescription>
            </CardHeader>
            <CardContent>
              {priceData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={priceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }} 
                        tickMargin={10}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        tickMargin={10}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip 
                        formatter={(value) => [`$${value}`, 'Price']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#8884d8" 
                        strokeWidth={2} 
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No price history available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="volume" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Volume History</CardTitle>
              <CardDescription>Last 30 days trading volume</CardDescription>
            </CardHeader>
            <CardContent>
              {volumeData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={volumeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }} 
                        tickMargin={10}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        tickMargin={10}
                        tickFormatter={(value) => formatLargeNumber(value)}
                      />
                      <Tooltip 
                        formatter={(value) => [formatLargeNumber(value as number), 'Volume']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#82ca9d" 
                        strokeWidth={2} 
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No volume history available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="metrics" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
              <CardDescription>Important financial and risk metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Risk metrics */}
                <div>
                  <h3 className="font-semibold mb-2">Risk Metrics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1">
                        Volatility (30d)
                        <InfoTooltip term="Volatility" context="30-day period" iconSize={14} />
                      </span>
                      <span>{asset.market_data?.volatility_30d?.toFixed(2) || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1">
                        Max Drawdown (30d)
                        <InfoTooltip term="Max Drawdown" context="30-day period" iconSize={14} />
                      </span>
                      <span>{asset.market_data?.max_drawdown_30d !== undefined
                        ? `${(asset.market_data.max_drawdown_30d * 100).toFixed(2)}%` 
                        : '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1">
                        Sharpe Ratio
                        <InfoTooltip term="Sharpe Ratio" iconSize={14} />
                      </span>
                      <span>{asset.market_data?.sharpe_ratio?.toFixed(2) || '-'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Yield metrics */}
                <div>
                  <h3 className="font-semibold mb-2">Yield Metrics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1">
                        Current APY
                        <InfoTooltip term="APY" context="Current annual percentage yield" iconSize={14} />
                      </span>
                      <span>{asset.market_data?.apy !== undefined
                        ? `${(asset.market_data.apy * 100).toFixed(2)}%` 
                        : '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1">
                        30-Day APY
                        <InfoTooltip term="APY" context="30-day average" iconSize={14} />
                      </span>
                      <span>{asset.market_data?.apy_30d !== undefined
                        ? `${(asset.market_data.apy_30d * 100).toFixed(2)}%` 
                        : '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1">
                        90-Day APY
                        <InfoTooltip term="APY" context="90-day average" iconSize={14} />
                      </span>
                      <span>{asset.market_data?.apy_90d !== undefined
                        ? `${(asset.market_data.apy_90d * 100).toFixed(2)}%` 
                        : '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
