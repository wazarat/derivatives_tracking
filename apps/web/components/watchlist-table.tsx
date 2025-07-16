"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpDown, Star, StarOff, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

// Define the type for cryptocurrency data
interface CryptoData {
  id: string;
  rank: number;
  name: string;
  symbol: string;
  logoUrl: string;
  price: number | null;
  marketCap: number | null;
  volume24h: number | null;
  change24h: number;
  sparkline7d?: number[];
  isWatchlisted: boolean;
}

interface WatchlistTableProps {
  data: CryptoData[];
  isWatchlistPage?: boolean;
  onToggleWatchlist?: (id: string) => void;
}

export function WatchlistTable({
  data,
  isWatchlistPage = false,
  onToggleWatchlist,
}: WatchlistTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof CryptoData;
    direction: "asc" | "desc";
  }>({
    key: "rank",
    direction: "asc",
  });

  // Handle sorting
  const handleSort = (key: keyof CryptoData) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc",
    });
  };

  // Sort data based on current sort configuration
  const sortedData = [...data].sort((a, b) => {
    // Handle undefined values safely
    const valueA = a[sortConfig.key];
    const valueB = b[sortConfig.key];
    
    // If either value is undefined, handle it gracefully
    if (valueA === undefined && valueB === undefined) return 0;
    if (valueA === undefined) return sortConfig.direction === "asc" ? -1 : 1;
    if (valueB === undefined) return sortConfig.direction === "asc" ? 1 : -1;
    
    // Now compare the values normally
    if (valueA < valueB) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (valueA > valueB) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Format price with appropriate decimal places
  const formatPrice = (price: number | null) => {
    if (price === null) return '0.00';
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    if (price < 10) return price.toFixed(2);
    return price.toLocaleString("en-US", { maximumFractionDigits: 2 });
  };

  // Format large numbers (market cap, volume)
  const formatLargeNumber = (num: number | null) => {
    if (num === null) return '0';
    if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
    return num.toString();
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">
              <Button
                variant="ghost"
                onClick={() => handleSort("rank")}
                className="px-2"
              >
                #
                <ArrowUpDown className="ml-1 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="min-w-[180px]">
              <Button
                variant="ghost"
                onClick={() => handleSort("name")}
                className="px-2"
              >
                Name
                <ArrowUpDown className="ml-1 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button
                variant="ghost"
                onClick={() => handleSort("price")}
                className="px-2"
              >
                Price
                <ArrowUpDown className="ml-1 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right hidden md:table-cell">
              <Button
                variant="ghost"
                onClick={() => handleSort("change24h")}
                className="px-2"
              >
                24h %
                <ArrowUpDown className="ml-1 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right hidden lg:table-cell">
              <Button
                variant="ghost"
                onClick={() => handleSort("marketCap")}
                className="px-2"
              >
                Market Cap
                <ArrowUpDown className="ml-1 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right hidden lg:table-cell">
              <Button
                variant="ghost"
                onClick={() => handleSort("volume24h")}
                className="px-2"
              >
                Volume (24h)
                <ArrowUpDown className="ml-1 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length > 0 ? (
            sortedData.map((crypto) => (
              <TableRow key={crypto.id}>
                <TableCell className="font-medium">{crypto.rank}</TableCell>
                <TableCell>
                  <Link
                    href={`/crypto/${crypto.id}`}
                    className="flex items-center hover:underline"
                  >
                    {crypto.logoUrl && (
                      <div className="mr-2 relative h-6 w-6">
                        <Image
                          src={crypto.logoUrl}
                          alt={crypto.name}
                          fill
                          className="rounded-full object-contain"
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{crypto.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {crypto.symbol}
                      </div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="text-right">
                  ${formatPrice(crypto.price)}
                </TableCell>
                <TableCell className="text-right hidden md:table-cell">
                  <div
                    className={`flex items-center justify-end ${
                      crypto.change24h >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {crypto.change24h >= 0 ? (
                      <TrendingUp className="mr-1 h-4 w-4" />
                    ) : (
                      <TrendingDown className="mr-1 h-4 w-4" />
                    )}
                    {Math.abs(crypto.change24h).toFixed(2)}%
                  </div>
                </TableCell>
                <TableCell className="text-right hidden lg:table-cell">
                  ${formatLargeNumber(crypto.marketCap)}
                </TableCell>
                <TableCell className="text-right hidden lg:table-cell">
                  ${formatLargeNumber(crypto.volume24h)}
                </TableCell>
                <TableCell>
                  {onToggleWatchlist && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onToggleWatchlist(crypto.id)}
                      className="h-8 w-8"
                      title={crypto.isWatchlisted ? "Remove from watchlist" : "Add to watchlist"}
                    >
                      {crypto.isWatchlisted ? (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                {isWatchlistPage
                  ? "Your watchlist is empty. Add cryptocurrencies to track them here."
                  : "No cryptocurrencies found."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
