"use client";

import { useState } from "react";
import { 
  BarChart3, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  Filter, 
  LineChart, 
  Search, 
  Share2 
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

interface SectorData {
  id: string;
  name: string;
  marketCap: number;
  volume24h: number;
  change24h: number;
  assets: number;
}

interface TrendData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
}

export default function ResearchPage() {
  // Mock data for sectors
  const sectorData: SectorData[] = [
    { id: "1", name: "DeFi", marketCap: 45.8, volume24h: 3.2, change24h: 2.4, assets: 124 },
    { id: "2", name: "Smart Contract Platforms", marketCap: 789.3, volume24h: 42.1, change24h: 1.8, assets: 87 },
    { id: "3", name: "Web3", marketCap: 32.5, volume24h: 2.1, change24h: -1.2, assets: 76 },
    { id: "4", name: "Gaming", marketCap: 18.7, volume24h: 1.5, change24h: 3.7, assets: 92 },
    { id: "5", name: "Privacy", marketCap: 12.3, volume24h: 0.8, change24h: -0.5, assets: 43 },
    { id: "6", name: "Layer-2", marketCap: 28.9, volume24h: 2.3, change24h: 4.2, assets: 38 },
    { id: "7", name: "Meme", marketCap: 21.4, volume24h: 3.7, change24h: 5.8, assets: 67 },
    { id: "8", name: "AI & Big Data", marketCap: 15.6, volume24h: 1.2, change24h: 2.1, assets: 29 },
  ];

  // Mock data for trending assets
  const trendingData: TrendData[] = [
    { id: "1", name: "Bitcoin", symbol: "BTC", price: 67432.58, change24h: 2.34, marketCap: 1324.5, volume24h: 28.7 },
    { id: "2", name: "Ethereum", symbol: "ETH", price: 3245.67, change24h: -1.23, marketCap: 389.2, volume24h: 15.3 },
    { id: "3", name: "Solana", symbol: "SOL", price: 143.21, change24h: 5.67, marketCap: 62.3, volume24h: 4.8 },
    { id: "4", name: "Avalanche", symbol: "AVAX", price: 34.56, change24h: 3.21, marketCap: 12.8, volume24h: 1.1 },
    { id: "5", name: "Chainlink", symbol: "LINK", price: 15.67, change24h: 4.56, marketCap: 8.4, volume24h: 0.6 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 2
    }).format(value * 1000000000); // Convert billions to actual value
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      signDisplay: 'exceptZero',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page Header */}
      <div className="border-b">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <h1 className="text-lg font-semibold">Research</h1>
        </div>
      </div>
      
      {/* Page Content */}
      <div className="container px-4 py-6 md:px-6 md:py-8">
        {/* Research Tabs */}
        <Tabs defaultValue="sectors" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sectors">Sectors</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="correlations">Correlations</TabsTrigger>
          </TabsList>
          
          {/* Sectors Tab */}
          <TabsContent value="sectors" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search sectors..."
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
                    <SelectItem value="change">Change (24h)</SelectItem>
                    <SelectItem value="assets">Number of Assets</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sectorData.map((sector) => (
                <Card key={sector.id}>
                  <CardHeader className="pb-2">
                    <CardTitle>{sector.name}</CardTitle>
                    <CardDescription>{sector.assets} assets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Market Cap</p>
                        <p className="text-xl font-bold">{formatCurrency(sector.marketCap)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">24h Change</p>
                        <p className={`text-xl font-bold flex items-center ${
                          sector.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {sector.change24h >= 0 ? 
                            <ChevronUp className="h-4 w-4 mr-1" /> : 
                            <ChevronDown className="h-4 w-4 mr-1" />
                          }
                          {formatPercentage(sector.change24h)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">24h Volume</p>
                        <p className="text-xl font-bold">{formatCurrency(sector.volume24h)}</p>
                      </div>
                      <div className="flex items-end">
                        <Button variant="outline" size="sm" className="w-full">
                          View Assets
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Trending Tab */}
          <TabsContent value="trending" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Trending Assets</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" /> Export
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" /> Share
                </Button>
              </div>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <div className="rounded-md">
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
                          <th className="h-12 px-4 text-right align-middle font-medium">Chart</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trendingData.map((asset, index) => (
                          <tr key={asset.id} className="border-b transition-colors hover:bg-muted/50">
                            <td className="p-4 align-middle">{index + 1}</td>
                            <td className="p-4 align-middle">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{asset.name}</span>
                                <span className="text-muted-foreground">{asset.symbol}</span>
                              </div>
                            </td>
                            <td className="p-4 align-middle text-right">
                              {formatCurrency(asset.price / 1000000000)}
                            </td>
                            <td className="p-4 align-middle text-right">
                              <span className={`inline-flex items-center ${asset.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {asset.change24h >= 0 ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                                {formatPercentage(asset.change24h)}
                              </span>
                            </td>
                            <td className="p-4 align-middle text-right">
                              {formatCurrency(asset.marketCap)}
                            </td>
                            <td className="p-4 align-middle text-right">
                              {formatCurrency(asset.volume24h)}
                            </td>
                            <td className="p-4 align-middle text-right">
                              <div className="h-10 w-24 inline-block">
                                {/* Placeholder for mini chart */}
                                <div className={`h-full w-full flex items-end ${asset.change24h >= 0 ? 'bg-green-100 dark:bg-green-950' : 'bg-red-100 dark:bg-red-950'} rounded`}>
                                  <div className={`w-full h-6 ${asset.change24h >= 0 ? 'bg-green-500' : 'bg-red-500'} rounded-b opacity-50`}></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Correlations Tab */}
          <TabsContent value="correlations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Asset Correlations</CardTitle>
                <CardDescription>
                  Analyze how different cryptocurrencies move in relation to each other
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <LineChart className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Correlation Analysis</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    Select assets to analyze their price correlation over time.
                    This feature helps you understand how assets move in relation to each other.
                  </p>
                  <div className="flex gap-4">
                    <Select>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select asset 1" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                        <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                        <SelectItem value="sol">Solana (SOL)</SelectItem>
                        <SelectItem value="avax">Avalanche (AVAX)</SelectItem>
                        <SelectItem value="link">Chainlink (LINK)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select asset 2" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                        <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                        <SelectItem value="sol">Solana (SOL)</SelectItem>
                        <SelectItem value="avax">Avalanche (AVAX)</SelectItem>
                        <SelectItem value="link">Chainlink (LINK)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button>Analyze</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
