"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDerivatives } from "@/hooks/useDerivatives";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define trending instrument interface
export interface TrendingInstrument {
  id: string;
  symbol: string;
  name: string;
  venue: string;
  price: number;
  change24h: number;
  volume24h: number;
  trendScore: number;
  socialScore: number;
  technicalScore: number;
}

interface TrendingTableProps {
  type: 'futures' | 'perps' | 'dex-perps';
}

export function TrendingTable({ type }: TrendingTableProps) {
  // Fetch trending data based on type
  const { data: derivativesResponse, isLoading, error } = useDerivatives(
    type === 'dex-perps' ? 'dex-perps' : (type === 'futures' ? 'cex-futures' : 'cex-perps')
  );

  // Extract data array from response (handle both array and object with data property)
  const rawData = Array.isArray(derivativesResponse) ? derivativesResponse : (derivativesResponse?.data || []);

  // Transform raw derivatives data to TrendingInstrument format
  const instruments: TrendingInstrument[] = rawData.map((item) => ({
    id: item.id,
    symbol: item.symbol,
    name: item.symbol, // Use symbol as name for now
    venue: item.exchange,
    price: item.price,
    change24h: Math.random() * 10 - 5, // Mock data for now
    volume24h: item.vol24h,
    trendScore: Math.floor(Math.random() * 100), // Mock data for now
    socialScore: Math.floor(Math.random() * 100), // Mock data for now
    technicalScore: Math.floor(Math.random() * 100), // Mock data for now
  }));

  // Function to add to watchlist
  const addToWatchlist = (instrument: TrendingInstrument) => {
    // TODO: Implement watchlist functionality
    console.log("Add to watchlist:", instrument);
  };

  // Function to add to portfolio
  const addToPortfolio = (instrument: TrendingInstrument) => {
    // TODO: Implement portfolio functionality
    console.log("Add to portfolio:", instrument);
  };

  // Format percentage with color
  const formatPercentage = (value: number) => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);

    return (
      <div className={`text-right font-medium ${value >= 0 ? "text-green-500" : "text-red-500"}`}>
        {formatted}
      </div>
    );
  };

  // Format price
  const formatPrice = (value: number) => {
    const decimalPlaces = value < 100 ? 5 : 2;
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(value);

    return <div className="text-right font-medium">{formatted}</div>;
  };

  // Format volume
  const formatVolume = (value: number) => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);

    return <div className="text-right font-medium">{formatted}</div>;
  };

  // Format score (0-100)
  const formatScore = (value: number) => {
    let colorClass = "text-yellow-500";
    if (value >= 70) colorClass = "text-green-500";
    if (value < 30) colorClass = "text-red-500";

    return <div className={`text-right font-medium ${colorClass}`}>{value}</div>;
  };

  return (
    <div className="rounded-md border">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p>Loading trending instruments...</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Error loading data</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Instrument</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">24h Change</TableHead>
              <TableHead className="text-right">24h Volume</TableHead>
              <TableHead className="text-right">Trend Score</TableHead>
              <TableHead className="text-right">Social Score</TableHead>
              <TableHead className="text-right">Technical Score</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {instruments.length > 0 ? (
              instruments.map((instrument) => (
                <TableRow key={instrument.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{instrument.symbol}</div>
                      <div className="text-xs text-muted-foreground">{instrument.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>{instrument.venue}</TableCell>
                  <TableCell>{formatPrice(instrument.price)}</TableCell>
                  <TableCell>{formatPercentage(instrument.change24h)}</TableCell>
                  <TableCell>{formatVolume(instrument.volume24h)}</TableCell>
                  <TableCell>{formatScore(instrument.trendScore)}</TableCell>
                  <TableCell>{formatScore(instrument.socialScore)}</TableCell>
                  <TableCell>{formatScore(instrument.technicalScore)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Add to...
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => addToWatchlist(instrument)}>
                          Add to Watchlist
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => addToPortfolio(instrument)}>
                          Add to Portfolio
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No trending instruments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

// Mock data for trending instruments
const mockTrendingData: Record<string, TrendingInstrument[]> = {
  'futures': [
    {
      id: "1",
      symbol: "BTC-0924",
      name: "Bitcoin September 2024",
      venue: "Binance",
      price: 65420.50,
      change24h: 2.35,
      volume24h: 1250000000,
      trendScore: 85,
      socialScore: 78,
      technicalScore: 72,
    },
    {
      id: "2",
      symbol: "ETH-0924",
      name: "Ethereum September 2024",
      venue: "Binance",
      price: 3420.75,
      change24h: 1.85,
      volume24h: 750000000,
      trendScore: 82,
      socialScore: 75,
      technicalScore: 68,
    },
    {
      id: "3",
      symbol: "SOL-0924",
      name: "Solana September 2024",
      venue: "OKX",
      price: 142.30,
      change24h: 3.65,
      volume24h: 320000000,
      trendScore: 88,
      socialScore: 82,
      technicalScore: 76,
    },
  ],
  'perps': [
    {
      id: "4",
      symbol: "BTC-PERP",
      name: "Bitcoin Perpetual",
      venue: "Bybit",
      price: 65380.25,
      change24h: 2.28,
      volume24h: 2100000000,
      trendScore: 84,
      socialScore: 80,
      technicalScore: 74,
    },
    {
      id: "5",
      symbol: "ETH-PERP",
      name: "Ethereum Perpetual",
      venue: "Bybit",
      price: 3418.50,
      change24h: 1.92,
      volume24h: 1250000000,
      trendScore: 80,
      socialScore: 76,
      technicalScore: 70,
    },
    {
      id: "6",
      symbol: "ARB-PERP",
      name: "Arbitrum Perpetual",
      venue: "Binance",
      price: 1.28,
      change24h: 5.75,
      volume24h: 180000000,
      trendScore: 92,
      socialScore: 88,
      technicalScore: 78,
    },
  ],
  'dex-perps': [
    {
      id: "7",
      symbol: "BTC-PERP",
      name: "Bitcoin Perpetual",
      venue: "GMX",
      price: 65410.75,
      change24h: 2.32,
      volume24h: 320000000,
      trendScore: 83,
      socialScore: 77,
      technicalScore: 72,
    },
    {
      id: "8",
      symbol: "ETH-PERP",
      name: "Ethereum Perpetual",
      venue: "dYdX",
      price: 3421.25,
      change24h: 1.88,
      volume24h: 280000000,
      trendScore: 79,
      socialScore: 74,
      technicalScore: 69,
    },
    {
      id: "9",
      symbol: "SOL-PERP",
      name: "Solana Perpetual",
      venue: "Drift",
      price: 142.85,
      change24h: 3.72,
      volume24h: 95000000,
      trendScore: 87,
      socialScore: 81,
      technicalScore: 75,
    },
  ],
};
