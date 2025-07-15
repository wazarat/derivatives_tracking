'use client';

import { useState } from "react";
import { 
  ArrowUpRight, 
  ChevronDown, 
  ChevronUp, 
  DollarSign, 
  Download, 
  Edit,
  Filter, 
  PieChart, 
  Plus, 
  RefreshCw, 
  Search, 
  Trash2 
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";

interface Asset {
  id: string;
  name: string;
  symbol: string;
  amount: number;
  buyPrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercentage: number;
}

export default function PortfolioPage() {
  const [assets, setAssets] = useState<Asset[]>([
    {
      id: "1",
      name: "Bitcoin",
      symbol: "BTC",
      amount: 0.5,
      buyPrice: 50000,
      currentPrice: 67432.58,
      value: 33716.29,
      pnl: 8716.29,
      pnlPercentage: 34.86,
    },
    {
      id: "2",
      name: "Ethereum",
      symbol: "ETH",
      amount: 5,
      buyPrice: 2800,
      currentPrice: 3245.67,
      value: 16228.35,
      pnl: 2228.35,
      pnlPercentage: 15.91,
    },
    {
      id: "3",
      name: "Solana",
      symbol: "SOL",
      amount: 50,
      buyPrice: 120,
      currentPrice: 143.21,
      value: 7160.5,
      pnl: 1160.5,
      pnlPercentage: 19.34,
    },
  ]);

  const [newAsset, setNewAsset] = useState({
    symbol: "",
    amount: "",
    buyPrice: "",
  });

  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalPnl = assets.reduce((sum, asset) => sum + asset.pnl, 0);
  const totalPnlPercentage = (totalPnl / (totalValue - totalPnl)) * 100;

  const handleAddAsset = () => {
    // In a real app, we would fetch the current price from the API
    // and calculate the value and PnL based on that
    const amount = parseFloat(newAsset.amount);
    const buyPrice = parseFloat(newAsset.buyPrice);
    
    // Mock data for demonstration
    const mockCurrentPrice = buyPrice * 1.1; // 10% higher than buy price
    const value = amount * mockCurrentPrice;
    const pnl = value - (amount * buyPrice);
    const pnlPercentage = (pnl / (amount * buyPrice)) * 100;
    
    const newAssetData: Asset = {
      id: Date.now().toString(),
      name: newAsset.symbol, // In a real app, we would fetch the name from the API
      symbol: newAsset.symbol,
      amount,
      buyPrice,
      currentPrice: mockCurrentPrice,
      value,
      pnl,
      pnlPercentage,
    };
    
    setAssets([...assets, newAssetData]);
    setNewAsset({ symbol: "", amount: "", buyPrice: "" });
    setIsAddAssetOpen(false);
  };

  const handleDeleteAsset = (id: string) => {
    setAssets(assets.filter(asset => asset.id !== id));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page Header */}
      <div className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <h1 className="text-lg font-semibold">Portfolio</h1>
          <Dialog>
            <DialogTrigger>
              <Button size="sm" className="flex items-center gap-1">
                <Plus className="h-4 w-4" /> Add Asset
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Asset</DialogTitle>
                <DialogDescription>
                  Add a new asset to your portfolio.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="symbol">Symbol</Label>
                  <Select
                    value={newAsset.symbol}
                    onValueChange={(value) => setNewAsset({ ...newAsset, symbol: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cryptocurrency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                      <SelectItem value="SOL">Solana (SOL)</SelectItem>
                      <SelectItem value="BNB">Binance Coin (BNB)</SelectItem>
                      <SelectItem value="XRP">XRP (XRP)</SelectItem>
                      <SelectItem value="ADA">Cardano (ADA)</SelectItem>
                      <SelectItem value="DOGE">Dogecoin (DOGE)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={newAsset.amount}
                    onChange={(e) => setNewAsset({ ...newAsset, amount: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="buyPrice">Buy Price (USD)</Label>
                  <Input
                    id="buyPrice"
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={newAsset.buyPrice}
                    onChange={(e) => setNewAsset({ ...newAsset, buyPrice: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddAssetOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddAsset}
                  disabled={!newAsset.symbol || !newAsset.amount || !newAsset.buyPrice}
                >
                  Add Asset
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Page Content */}
      <div className="container px-4 py-6 md:px-6 md:py-8">
        {/* Portfolio Overview Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Portfolio Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
              <p className="text-xs text-muted-foreground">
                {assets.length} assets
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Profit/Loss
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(totalPnl)}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className={`inline-flex items-center ${totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {totalPnl >= 0 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {formatPercentage(Math.abs(totalPnlPercentage))}
                </span>
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Best Performing Asset
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assets.length > 0 ? (
                <>
                  <div className="text-2xl font-bold">
                    {assets.reduce((best, asset) => asset.pnlPercentage > best.pnlPercentage ? asset : best, assets[0]).symbol}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-500 inline-flex items-center">
                      <ChevronUp className="h-4 w-4" />
                      {formatPercentage(assets.reduce((best, asset) => asset.pnlPercentage > best.pnlPercentage ? asset : best, assets[0]).pnlPercentage)}
                    </span>
                  </p>
                </>
              ) : (
                <div className="text-muted-foreground">No assets</div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Portfolio Assets */}
        <Card>
          <CardHeader>
            <CardTitle>Your Assets</CardTitle>
            <CardDescription>
              Track the performance of your cryptocurrency holdings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assets.length > 0 ? (
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b transition-colors hover:bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle font-medium">Asset</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Amount</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Buy Price</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Current Price</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Value</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">P&L</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assets.map((asset) => (
                        <tr key={asset.id} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{asset.name}</span>
                              <span className="text-muted-foreground">{asset.symbol}</span>
                            </div>
                          </td>
                          <td className="p-4 align-middle text-right">
                            {asset.amount}
                          </td>
                          <td className="p-4 align-middle text-right">
                            {formatCurrency(asset.buyPrice)}
                          </td>
                          <td className="p-4 align-middle text-right">
                            {formatCurrency(asset.currentPrice)}
                          </td>
                          <td className="p-4 align-middle text-right">
                            {formatCurrency(asset.value)}
                          </td>
                          <td className="p-4 align-middle text-right">
                            <div className="flex flex-col items-end">
                              <span className={`${asset.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {formatCurrency(asset.pnl)}
                              </span>
                              <span className={`text-xs ${asset.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {asset.pnl >= 0 ? '+' : ''}{formatPercentage(asset.pnlPercentage)}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 align-middle text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeleteAsset(asset.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No assets yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Add your first cryptocurrency asset to start tracking your portfolio.
                </p>
                <Button onClick={() => setIsAddAssetOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Asset
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
