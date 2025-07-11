'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { GaugeChart } from '../components/ui/gauge';
import { WatchlistItem } from '../lib/hooks/useWatchlist';
import * as Tooltip from '@radix-ui/react-tooltip';
import { InfoIcon } from 'lucide-react';

interface RiskGaugeProps {
  watchlist: WatchlistItem[];
  marketData: {
    symbol: string;
    price: number;
    percent_change_24h: number;
    volatility?: number;
  }[];
}

export function RiskGauge({ watchlist, marketData }: RiskGaugeProps) {
  // Calculate portfolio risk score (0-100)
  // This is a simplified risk calculation based on:
  // 1. Portfolio concentration (higher concentration = higher risk)
  // 2. Asset volatility (using 24h change as a proxy)
  // 3. Number of assets (fewer assets = higher risk)
  const riskScore = useMemo(() => {
    if (!watchlist.length || !marketData.length) {
      return 0;
    }

    // Calculate total value
    const totalValue = watchlist.reduce((sum, item) => sum + item.usd_value, 0);
    
    // Calculate concentration score (Herfindahl-Hirschman Index simplified)
    // Higher concentration = higher risk
    const concentrationScore = watchlist.reduce((score, item) => {
      const weight = item.usd_value / totalValue;
      return score + (weight * weight);
    }, 0) * 100; // Scale up to 0-100 range
    
    // Calculate volatility score
    const volatilityScore = watchlist.reduce((score, item) => {
      const asset = marketData.find(m => m.symbol === item.symbol);
      const weight = item.usd_value / totalValue;
      const volatility = asset ? Math.abs(asset.percent_change_24h) : 0;
      return score + (weight * volatility);
    }, 0);
    
    // Calculate diversification score based on number of assets
    // Fewer assets = higher risk
    const diversificationScore = Math.max(0, 100 - (watchlist.length * 10));
    
    // Combine scores with weights
    const weightedScore = (
      concentrationScore * 0.4 + 
      volatilityScore * 0.4 + 
      diversificationScore * 0.2
    );
    
    // Cap at 100
    return Math.min(100, weightedScore);
  }, [watchlist, marketData]);

  // Determine risk level
  const getRiskLevel = (score: number) => {
    if (score < 20) return { level: 'Very Low', color: 'bg-green-500' };
    if (score < 40) return { level: 'Low', color: 'bg-emerald-500' };
    if (score < 60) return { level: 'Moderate', color: 'bg-yellow-500' };
    if (score < 80) return { level: 'High', color: 'bg-orange-500' };
    return { level: 'Very High', color: 'bg-red-500' };
  };

  const { level, color } = getRiskLevel(riskScore);

  // Risk explanation
  const riskExplanation = `
    This risk score is calculated based on:
    - Portfolio concentration (higher concentration = higher risk)
    - Asset volatility (using 24h price change)
    - Number of assets (fewer assets = higher risk)
    
    A well-diversified portfolio typically has a lower risk score.
  `;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Portfolio Risk</CardTitle>
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="max-w-xs bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg z-50 text-sm">
                <p className="text-sm">{riskExplanation}</p>
                <Tooltip.Arrow />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <GaugeChart value={riskScore} size="large" showValue={false} />
        <div className="mt-4 text-center">
          <div className={`inline-block w-3 h-3 rounded-full ${color} mr-2`}></div>
          <span className="font-medium">{level} Risk</span>
          <p className="text-sm text-muted-foreground mt-1">Risk Score: {riskScore.toFixed(1)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
