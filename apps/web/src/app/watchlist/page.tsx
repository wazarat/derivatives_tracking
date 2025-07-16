'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getWatchlist, removeFromWatchlist, WatchlistItem } from '@/services/watchlistService';
import { Asset } from '@/types/assets';
import { AssetCard } from '@/components/assets/AssetCard';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Star, Trash2 } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/components/ui/use-toast';

export default function WatchlistPage() {
  const [watchlistAssets, setWatchlistAssets] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Load watchlist assets on mount (client-side only)
  useEffect(() => {
    setIsMounted(true);
    loadWatchlist();
  }, []);

  const loadWatchlist = async () => {
    if (typeof window !== 'undefined') {
      setIsLoading(true);
      try {
        const assets = await getWatchlist();
        setWatchlistAssets(assets);
      } catch (error) {
        console.error('Failed to load watchlist:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your watchlist. Please try again.',
          variant: 'destructive',
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle clearing the watchlist
  const handleClearWatchlist = async () => {
    try {
      // Since removeFromWatchlist requires an ID, we need to handle each item individually
      const promises = watchlistAssets.map(asset => removeFromWatchlist(asset.id));
      await Promise.all(promises);
      
      setWatchlistAssets([]);
      toast({
        title: 'Watchlist Cleared',
        description: 'All assets have been removed from your watchlist.',
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to clear watchlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear watchlist. Please try again.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  // Handle asset removal from watchlist (triggered by WatchlistButton)
  const handleAssetRemoved = async (assetId: string) => {
    try {
      await removeFromWatchlist(assetId);
      setWatchlistAssets(prev => prev.filter(item => item.instrument_id !== assetId));
      toast({
        title: 'Asset Removed',
        description: 'Asset has been removed from your watchlist.',
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to remove asset:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove asset. Please try again.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  // Don't render anything during SSR
  if (!isMounted) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading watchlist...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Page header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
            My Watchlist
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your favorite assets and keep an eye on their performance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push('/assets')}
          >
            Browse Assets
          </Button>

          {watchlistAssets.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Watchlist</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to remove all assets from your watchlist? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearWatchlist}>Clear Watchlist</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Watchlist content */}
      {watchlistAssets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {watchlistAssets.map(item => {
            // Create a compatible Asset object from WatchlistItem
            const asset: Asset = {
              id: item.instrument_id,
              name: item.instrument_name,
              ticker: item.instrument_symbol,
              sector: item.venue as any, // Using venue as sector
              risk_tier: 'balanced' as any, // Default risk tier
              is_active: true,
              created_at: item.created_at,
              updated_at: item.created_at,
            };
            
            return (
              <AssetCard 
                key={item.id} 
                asset={asset} 
                onWatchlistChange={
                  () => {
                    handleAssetRemoved(item.instrument_id);
                  }
                }
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your watchlist is empty</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Add assets to your watchlist to track their performance and quickly access them later.
          </p>
          <Button asChild>
            <Link href="/assets">Browse Assets</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
