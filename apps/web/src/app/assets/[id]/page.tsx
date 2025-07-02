'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { fetchAssetById, fetchAssetMetrics, fetchAssetRiskScore } from '@/services/assetService';
import { riskTierColors, riskTierDisplayNames, sectorDisplayNames } from '@/types/assets';
import { Loader2, ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { WatchlistButton } from '@/components/assets/WatchlistButton';
import { InfoTooltip } from '@/components/ui/info-tooltip';

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
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

  // Get risk tier color
  const riskColor = riskTierColors[asset.risk_tier];
  
  // Default logo if none provided
  const logoUrl = asset.logo_url || '/assets/default-token.svg';

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back button and actions */}
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={handleBack} 
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assets
        </Button>
        
        {asset && (
          <WatchlistButton 
            asset={asset}
            variant="outline"
            size="default"
            showText={true}
          />
        )}
      </div>

      {/* Asset header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="relative h-24 w-24 rounded-full overflow-hidden border border-gray-200">
          <Image 
            src={logoUrl} 
            alt={asset.name} 
            fill 
            className="object-cover"
            onError={(e) => {
              // Fallback to default image on error
              const target = e.target as HTMLImageElement;
              target.src = '/assets/default-token.svg';
            }}
          />
        </div>

        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <h1 className="text-3xl font-bold">{asset.name}</h1>
            <span className="text-xl text-muted-foreground">{asset.ticker}</span>
            <div 
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
              style={{ backgroundColor: `${riskColor}20`, color: riskColor }}
            >
              {riskTierDisplayNames[asset.risk_tier]}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-2 items-center">
            <span className="px-3 py-1 bg-secondary rounded-md text-sm">
              {sectorDisplayNames[asset.sector]}
            </span>
            
            {asset.website && (
              <a 
                href={asset.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Website <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {asset.description && (
            <p className="mt-4 text-muted-foreground">{asset.description}</p>
          )}
        </div>
      </div>

      {/* Risk score card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Risk Score
              <InfoTooltip 
                term="Composite Risk Score" 
                context="Crypto asset risk assessment"
                iconSize={16}
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingRiskScore ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </div>
            ) : (
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold">
                  {riskScore?.score.toFixed(1) || '-'}
                </span>
                <span className="text-muted-foreground mb-1">/5</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Market data placeholders - in a real app, these would show actual data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Current Price
              <InfoTooltip 
                term="Current Price" 
                context="Crypto asset market data"
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">
                {asset.market_data?.price_usd 
                  ? `$${asset.market_data.price_usd.toFixed(2)}` 
                  : '-'}
              </span>
              {asset.market_data?.price_change_24h && (
                <span className={`mb-1 ${asset.market_data.price_change_24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {asset.market_data.price_change_24h > 0 ? '+' : ''}
                  {asset.market_data.price_change_24h.toFixed(2)}%
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Market Cap
              <InfoTooltip 
                term="Market Cap" 
                context="Cryptocurrency"
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">
                {asset.market_data?.market_cap 
                  ? `$${(asset.market_data.market_cap / 1000000).toFixed(1)}M` 
                  : '-'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different data views */}
      <Tabs defaultValue="price" className="w-full">
        <TabsList>
          <TabsTrigger value="price">Price History</TabsTrigger>
          <TabsTrigger value="volume">Volume History</TabsTrigger>
          <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="price" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Price History (30 Days)</CardTitle>
              <CardDescription>Historical price data in USD</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPriceMetrics ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : priceMetrics?.metrics?.length ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formatPriceData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3b82f6" 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No price history available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="volume" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Volume History (30 Days)</CardTitle>
              <CardDescription>24-hour trading volume in USD</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingVolumeMetrics ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : volumeMetrics?.metrics?.length ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formatVolumeData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#8b5cf6" 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
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
                      <span>{asset.market_data?.max_drawdown_30d 
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
                      <span>{asset.market_data?.apy 
                        ? `${(asset.market_data.apy * 100).toFixed(2)}%` 
                        : '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1">
                        30-Day APY
                        <InfoTooltip term="APY" context="30-day average" iconSize={14} />
                      </span>
                      <span>{asset.market_data?.apy_30d 
                        ? `${(asset.market_data.apy_30d * 100).toFixed(2)}%` 
                        : '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1">
                        90-Day APY
                        <InfoTooltip term="APY" context="90-day average" iconSize={14} />
                      </span>
                      <span>{asset.market_data?.apy_90d 
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
