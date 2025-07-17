'use client';

import React, { useState } from 'react';
import { Star, StarOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useToast } from '@/components/ui/use-toast';

interface WatchlistButtonProps {
  exchange: string;
  symbol: string;
  contract_type: string;
  name?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showText?: boolean;
  onToggle?: (isAdded: boolean) => void;
}

export function WatchlistButton({
  exchange,
  symbol,
  contract_type,
  name = symbol, // Use symbol as fallback if name is not provided
  variant = 'outline',
  size = 'icon',
  className = '',
  showText = false,
  onToggle,
}: WatchlistButtonProps) {
  const { toast } = useToast();
  const { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  
  // Check if the derivative is in the watchlist
  const watchlistItem = watchlist.find(item => 
    item.exchange === exchange && 
    item.symbol === symbol && 
    item.contract_type === contract_type
  );
  
  const isWatchlisted = !!watchlistItem;
  
  const handleToggleWatchlist = async () => {
    try {
      if (isWatchlisted && watchlistItem) {
        // Remove from watchlist
        await removeFromWatchlist(watchlistItem.id);
        
        // Show toast notification
        toast({
          title: 'Removed from Watchlist',
          description: `${name} (${symbol}) was removed from your watchlist.`,
          duration: 3000,
        });
        
        // Call onToggle callback if provided
        if (onToggle) {
          onToggle(false);
        }
      } else {
        // Add to watchlist
        await addToWatchlist({
          exchange,
          symbol,
          contract_type,
          starred: false
        });
        
        // Show toast notification
        toast({
          title: 'Added to Watchlist',
          description: `${name} (${symbol}) was added to your watchlist.`,
          duration: 3000,
        });
        
        // Call onToggle callback if provided
        if (onToggle) {
          onToggle(true);
        }
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to update watchlist. Please try again.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleToggleWatchlist}
      aria-label={isWatchlisted ? `Remove ${name} from watchlist` : `Add ${name} to watchlist`}
    >
      {isWatchlisted ? (
        <>
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          {showText && <span className="ml-2">Remove from Watchlist</span>}
        </>
      ) : (
        <>
          <StarOff className="h-4 w-4" />
          {showText && <span className="ml-2">Add to Watchlist</span>}
        </>
      )}
    </Button>
  );
}
