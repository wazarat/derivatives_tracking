'use client';

import React, { useState, useEffect } from 'react';
import { Star, StarOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Asset } from '@/types/assets';
import { isInWatchlist, toggleWatchlist } from '@/services/watchlistService';
import { useToast } from '@/components/ui/use-toast';

interface WatchlistButtonProps {
  asset: Asset;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showText?: boolean;
  onToggle?: (isAdded: boolean) => void;
}

export function WatchlistButton({
  asset,
  variant = 'outline',
  size = 'icon',
  className = '',
  showText = false,
  onToggle,
}: WatchlistButtonProps) {
  const { toast } = useToast();
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Check if asset is in watchlist on mount (client-side only)
  useEffect(() => {
    setIsMounted(true);
    setIsWatchlisted(isInWatchlist(asset.id));
  }, [asset.id]);

  // Don't render anything during SSR
  if (!isMounted) {
    return null;
  }

  const handleToggleWatchlist = () => {
    const wasAdded = toggleWatchlist(asset);
    setIsWatchlisted(wasAdded);
    
    // Show toast notification
    toast({
      title: wasAdded ? 'Added to Watchlist' : 'Removed from Watchlist',
      description: `${asset.name} (${asset.ticker}) was ${wasAdded ? 'added to' : 'removed from'} your watchlist.`,
      duration: 3000,
    });
    
    // Call onToggle callback if provided
    if (onToggle) {
      onToggle(wasAdded);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleToggleWatchlist}
      aria-label={isWatchlisted ? `Remove ${asset.name} from watchlist` : `Add ${asset.name} to watchlist`}
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
