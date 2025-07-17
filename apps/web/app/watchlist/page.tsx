"use client";

import { useState } from "react";
import { 
  Plus, 
  Search, 
  Star, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  MoreHorizontal, 
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogFooter, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "../../components/ui/skeleton";
import { useWatchlist, WatchlistItem } from "../../src/hooks/useWatchlist";
import { useAuth } from "@clerk/nextjs";

// Simple format functions to avoid import issues
const formatPrice = (price: number) => `$${price.toFixed(4)}`;
const formatCompactNumber = (num: number) => {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toString();
};

export default function WatchlistPage() {
  const { isSignedIn } = useAuth();
  const { 
    watchlist, 
    loading, 
    error, 
    addToWatchlist: addToWatchlistHook, 
    removeFromWatchlist: removeFromWatchlistHook, 
    toggleStar: toggleStarHook 
  } = useWatchlist();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [newAssetSymbol, setNewAssetSymbol] = useState("");
  const [newAssetExchange, setNewAssetExchange] = useState("");
  const [newAssetContractType, setNewAssetContractType] = useState("derivatives");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
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
  
  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please sign in to access your watchlist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter watchlist based on search query
  const filteredWatchlist = watchlist?.filter(item => 
    item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.exchange.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleToggleStar = async (item: WatchlistItem) => {
    try {
      await toggleStarHook(item.id);
      toast({
        title: item.starred ? "Removed from starred" : "Added to starred",
        description: `${item.symbol} has been ${item.starred ? 'unstarred' : 'starred'}.`,
      });
    } catch (error) {
      console.error('Error toggling star:', error);
      toast({
        title: "Error",
        description: "Failed to update star status.",
      });
    }
  };

  const handleRemoveFromWatchlist = async (item: WatchlistItem) => {
    try {
      await removeFromWatchlistHook(item.id);
      toast({
        title: "Removed from watchlist",
        description: `${item.symbol} has been removed from your watchlist.`,
      });
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from watchlist.",
      });
    }
  };

  const handleAddToWatchlist = async () => {
    if (!newAssetSymbol || !newAssetExchange) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
      });
      return;
    }

    try {
      const newItem = {
        symbol: newAssetSymbol.toUpperCase(),
        exchange: newAssetExchange,
        contract_type: newAssetContractType,
        starred: false,
      };

      await addToWatchlistHook(newItem);
      
      toast({
        title: "Added to watchlist",
        description: `${newItem.symbol} has been added to your watchlist.`,
      });
      
      // Reset form
      setNewAssetSymbol("");
      setNewAssetExchange("");
      setNewAssetContractType("derivatives");
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to add item to watchlist.",
      });
    }
  };

  // Wrapper functions to match WatchlistRow expected signatures
  const handleToggleStarById = async (id: string) => {
    const item = filteredWatchlist.find(item => item.id === id);
    if (item) {
      await handleToggleStar(item);
    }
  };

  const handleRemoveById = async (id: string) => {
    const item = filteredWatchlist.find(item => item.id === id);
    if (item) {
      await handleRemoveFromWatchlist(item);
    }
  };

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
          <Dialog>
            <DialogTrigger>
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
                <Button variant="outline" onClick={() => setNewAssetSymbol("")}>
                  Cancel
                </Button>
                <Button onClick={handleAddToWatchlist}>Add</Button>
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
                            onToggleStar={handleToggleStarById} 
                            onRemove={handleRemoveById} 
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
                            onToggleStar={handleToggleStarById} 
                            onRemove={handleRemoveById} 
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
            <div className="font-medium">{item.name || item.symbol}</div>
            <div className="text-xs text-muted-foreground">{item.symbol}</div>
          </div>
        </div>
      </td>
      <td className="p-4 align-middle text-right">
        {item.price ? formatPrice(item.price) : '-'}
      </td>
      <td className="p-4 align-middle text-right">
        {item.change24h !== undefined ? (
          <span className={`inline-flex items-center ${item.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {item.change24h >= 0 ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
            {formatPercentage(item.change24h)}
          </span>
        ) : (
          '-'
        )}
      </td>
      <td className="p-4 align-middle text-right">
        {item.marketCap ? formatCurrency(item.marketCap) : '-'}
      </td>
      <td className="p-4 align-middle text-right">
        {item.volume24h ? formatCurrency(item.volume24h) : '-'}
      </td>
      <td className="p-4 align-middle text-right">
        <DropdownMenu>
          <DropdownMenuTrigger>
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
