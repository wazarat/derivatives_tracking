"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Star } from "lucide-react";
import Link from "next/link";
import { AddTradeDialog } from "@/components/portfolio/AddTradeDialog";
import { AddToWatchlistDialog } from "@/components/watchlist/AddToWatchlistDialog";
import { useWatchlist } from "@/hooks/useWatchlist";

interface DerivativeData {
  id: number;
  exchange: string;
  symbol: string;
  price: number;
  vol24h: number;
  funding_rate: number;
}

export default function CexPerpsMinimalPage() {
  const [data, setData] = useState<DerivativeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExchange, setSelectedExchange] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 20;
  
  const { toast } = useToast();
  const { addToWatchlist, isInWatchlist } = useWatchlist();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/crypto/cex-perps');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching CEX perps data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter data by exchange
  const filteredData = selectedExchange === "all" 
    ? data 
    : data.filter(item => item.exchange === selectedExchange);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Get unique exchanges for filter
  const exchanges = ["all", ...Array.from(new Set(data.map(item => item.exchange)))];

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedExchange]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(value);
  };

  const formatCompactNumber = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(4)}%`;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center space-x-2 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/research">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Research
          </Link>
        </Button>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">CEX Derivatives Traders</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>CEX Derivatives Market Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p>Loading CEX derivatives data...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-red-500">Error: {error}</p>
            </div>
          ) : (
            <>
              {/* Filter and Pagination Controls */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Filter by Exchange:</span>
                  <Select value={selectedExchange} onValueChange={setSelectedExchange}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {exchanges.map((exchange) => (
                        <SelectItem key={exchange} value={exchange}>
                          {exchange === "all" ? "All Exchanges" : exchange.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} trades
                </div>
              </div>

              {/* Data Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exchange</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">24h Volume</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.exchange.toUpperCase()}
                      </TableCell>
                      <TableCell>{item.symbol}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCompactNumber(item.vol24h)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <AddToWatchlistDialog
                            trigger={
                              <Button variant="outline" size="sm">
                                <Star className="h-4 w-4" />
                              </Button>
                            }
                            contract={{
                              exchange: item.exchange,
                              symbol: item.symbol,
                              contract_type: "derivatives",
                              index_price: item.price
                            }}
                          />
                          <AddTradeDialog
                            trigger={
                              <Button variant="outline" size="sm">
                                <Plus className="h-4 w-4" />
                              </Button>
                            }
                            prefilledData={{
                              exchange: item.exchange,
                              symbol: item.symbol,
                              entry_price: item.price.toString()
                            }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
