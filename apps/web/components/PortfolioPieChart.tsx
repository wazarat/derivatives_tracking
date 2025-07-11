'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { WatchlistItem } from '../lib/hooks/useWatchlist';
import { formatCurrency, formatPercentage } from '../lib/utils';

// Define a set of colors for the pie chart segments
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', 
  '#82CA9D', '#8DD1E1', '#A4DE6C', '#D0ED57', '#FAAAA3'
];

interface PortfolioPieChartProps {
  watchlist: WatchlistItem[];
  totalValue: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background p-3 border rounded-md shadow-md">
        <p className="font-medium">{data.symbol}</p>
        <p className="text-sm">{formatCurrency(data.usd_value)}</p>
        <p className="text-sm">{formatPercentage(data.percentage)}</p>
      </div>
    );
  }
  return null;
};

export function PortfolioPieChart({ watchlist, totalValue }: PortfolioPieChartProps) {
  // Don't render if no data or total value is 0
  if (!watchlist.length || totalValue === 0) {
    return (
      <Card className="w-full h-[400px]">
        <CardHeader>
          <CardTitle>Portfolio Allocation</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">Add assets to your watchlist to see allocation</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for the pie chart with percentages
  const chartData = watchlist.map((item, index) => ({
    ...item,
    percentage: (item.usd_value / totalValue) * 100,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <Card className="w-full h-[400px]">
      <CardHeader>
        <CardTitle>Portfolio Allocation</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="usd_value"
              nameKey="symbol"
              label={({ symbol, percentage }) => `${symbol} ${percentage.toFixed(1)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
