"use client";

import { useState } from "react";
import { 
  Bell, 
  ChevronDown, 
  ChevronUp, 
  Edit2, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Star, 
  Trash2 
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "../../components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { toast } from "../../components/ui/use-toast";

interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  starred: boolean;
}

export default function WatchlistPage() {
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([
    { id: "1", symbol: "BTC", name: "Bitcoin", price: 67432.58, change24h: 2.34, marketCap: 1324.5, volume24h: 28.7, starred: true },
    { id: "2", symbol: "ETH", name: "Ethereum", price: 3245.67, change24h: -1.23, marketCap: 389.2, volume24h: 15.3, starred: true },
    { id: "3", symbol: "SOL", name: "Solana", price: 143.21, change24h: 5.67, marketCap: 62.3, volume24h: 4.8, starred: false },
    { id: "4", symbol: "AVAX", name: "Avalanche", price: 34.56, change24h: 3.21, marketCap: 12.8, volume24h: 1.1, starred: false },
    { id: "5", symbol: "LINK", name: "Chainlink", price: 15.67, change24h: 4.56, marketCap: 8.4, volume24h: 0.6, starred: false },
    { id: "6", symbol: "MATIC", name: "Polygon", price: 0.58, change24h: -2.14, marketCap: 5.7, volume24h: 0.4, starred: false },
    { id: "7", symbol: "DOT", name: "Polkadot", price: 6.78, change24h: 1.45, marketCap: 8.9, volume24h: 0.3, starred: false },
    { id: "8", symbol: "ADA", name: "Cardano", price: 0.45, change24h: -0.87, marketCap: 16.2, volume24h: 0.5, starred: false },
  ]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAssetSymbol, setNewAssetSymbol] = useState("");
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 2
    }).format(value * 1000000000); // Convert billions to actual value
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: value > 100 ? 2 : value > 1 ? 4 : 6
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      signDisplay: 'exceptZero',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  };
  
  const toggleStar = (id: string) => {
    setWatchlistItems(items => 
      items.map(item => 
        item.id === id ? { ...item, starred: !item.starred } : item
      )
    );
    
    const item = watchlistItems.find(item => item.id === id);
    if (item) {
      toast({
        title: item.starred ? "Removed from favorites" : "Added to favorites",
        description: `${item.name} (${item.symbol}) has been ${item.starred ? "removed from" : "added to"} your favorites.`,
      });
    }
  };
  
  const removeFromWatchlist = (id: string) => {
    const item = watchlistItems.find(item => item.id === id);
    
    setWatchlistItems(items => items.filter(item => item.id !== id));
    
    if (item) {
      toast({
        title: "Removed from watchlist",
        description: `${item.name} (${item.symbol}) has been removed from your watchlist.`,
      });
    }
  };
  
  const addToWatchlist = () => {
    if (!newAssetSymbol) {
      toast({
        title: "Error",
        description: "Please enter a valid symbol",
      });
      return;
    }
    
    // In a real app, we would fetch the asset data from the API
    // For now, we'll just add a mock asset
    const newAsset: WatchlistItem = {
      id: `${watchlistItems.length + 1}`,
      symbol: newAssetSymbol.toUpperCase(),
      name: `New Asset (${newAssetSymbol.toUpperCase()})`,
      price: 100.00,
      change24h: 0.00,
      marketCap: 1.0,
      volume24h: 0.1,
      starred: false,
    };
    
    setWatchlistItems(items => [...items, newAsset]);
    setNewAssetSymbol("");
    setIsAddDialogOpen(false);
    
    toast({
      title: "Added to watchlist",
      description: `${newAsset.name} (${newAsset.symbol}) has been added to your watchlist.`,
    });
  };
  
  const filteredWatchlist = watchlistItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const starredItems = filteredWatchlist.filter(item => item.starred);
  const otherItems = filteredWatchlist.filter(item => !item.starred);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page Header */}
      <div className="border-b">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <h1 className="text-lg font-semibold">Watchlist</h1>
        </div>
      </div>
      
      {/* Page Content */}
      <div className="container px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search watchlist..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Asset
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add to Watchlist</DialogTitle>
                <DialogDescription>
                  Enter the symbol of the cryptocurrency you want to add to your watchlist.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="symbol" className="text-right">
                    Symbol
                  </Label>
                  <Input
                    id="symbol"
                    placeholder="BTC"
                    className="col-span-3"
                    value={newAssetSymbol}
                    onChange={(e) => setNewAssetSymbol(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addToWatchlist}>Add</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Your Watchlist</CardTitle>
            <CardDescription>
              Track your favorite cryptocurrencies and monitor their performance.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-md">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="border-b transition-colors hover:bg-muted/50">
                      <th className="h-12 w-12 px-4 text-left align-middle font-medium"></th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                      <th className="h-12 px-4 text-right align-middle font-medium">Price</th>
                      <th className="h-12 px-4 text-right align-middle font-medium">24h %</th>
                      <th className="h-12 px-4 text-right align-middle font-medium">Market Cap</th>
                      <th className="h-12 px-4 text-right align-middle font-medium">Volume (24h)</th>
                      <th className="h-12 w-[80px] px-4 text-right align-middle font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {starredItems.length > 0 && (
                      <>
                        <tr className="bg-muted/50">
                          <td colSpan={7} className="p-2 px-4 text-xs font-medium">
                            Favorites
                          </td>
                        </tr>
                        {starredItems.map((item) => (
                          <WatchlistRow 
                            key={item.id} 
                            item={item} 
                            onToggleStar={toggleStar} 
                            onRemove={removeFromWatchlist} 
                          />
                        ))}
                      </>
                    )}
                    
                    {otherItems.length > 0 && (
                      <>
                        <tr className="bg-muted/50">
                          <td colSpan={7} className="p-2 px-4 text-xs font-medium">
                            Other Assets
                          </td>
                        </tr>
                        {otherItems.map((item) => (
                          <WatchlistRow 
                            key={item.id} 
                            item={item} 
                            onToggleStar={toggleStar} 
                            onRemove={removeFromWatchlist} 
                          />
                        ))}
                      </>
                    )}
                    
                    {filteredWatchlist.length === 0 && (
                      <tr>
                        <td colSpan={7} className="h-24 text-center text-muted-foreground">
                          {searchQuery ? (
                            <>No assets found matching "{searchQuery}"</>
                          ) : (
                            <>Your watchlist is empty. Add assets to get started.</>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface WatchlistRowProps {
  item: WatchlistItem;
  onToggleStar: (id: string) => void;
  onRemove: (id: string) => void;
}

function WatchlistRow({ item, onToggleStar, onRemove }: WatchlistRowProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 2
    }).format(value * 1000000000); // Convert billions to actual value
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: value > 100 ? 2 : value > 1 ? 4 : 6
    }).format(value);
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
    <tr className="border-b transition-colors hover:bg-muted/50">
      <td className="p-4 align-middle">
        <Button
          variant="ghost"
          size="icon"
          className={item.starred ? "text-yellow-500" : "text-muted-foreground"}
          onClick={() => onToggleStar(item.id)}
        >
          <Star className="h-4 w-4" fill={item.starred ? "currentColor" : "none"} />
        </Button>
      </td>
      <td className="p-4 align-middle">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
            {item.symbol.substring(0, 2)}
          </div>
          <div>
            <div className="font-medium">{item.name}</div>
            <div className="text-xs text-muted-foreground">{item.symbol}</div>
          </div>
        </div>
      </td>
      <td className="p-4 align-middle text-right">
        {formatPrice(item.price)}
      </td>
      <td className="p-4 align-middle text-right">
        <span className={`inline-flex items-center ${item.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {item.change24h >= 0 ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
          {formatPercentage(item.change24h)}
        </span>
      </td>
      <td className="p-4 align-middle text-right">
        {formatCurrency(item.marketCap)}
      </td>
      <td className="p-4 align-middle text-right">
        {formatCurrency(item.volume24h)}
      </td>
      <td className="p-4 align-middle text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onToggleStar(item.id)}>
              {item.starred ? (
                <>
                  <Star className="mr-2 h-4 w-4" /> Remove from favorites
                </>
              ) : (
                <>
                  <Star className="mr-2 h-4 w-4" /> Add to favorites
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell className="mr-2 h-4 w-4" /> Set price alert
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onRemove(item.id)} className="text-red-500">
              <Trash2 className="mr-2 h-4 w-4" /> Remove from watchlist
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
