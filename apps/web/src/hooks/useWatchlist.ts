import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

export interface WatchlistItem {
  id: string;
  user_id: string;
  exchange: string;
  symbol: string;
  contract_type: string;
  added_at: string;
  starred: boolean;
  current_price?: number;
  volume_24h?: number;
  last_updated?: string;
  // Additional properties for display
  name?: string;
  price?: number;
  change24h?: number;
  marketCap?: number;
  volume24h?: number;
}

export function useWatchlist() {
  const { isSignedIn, userId } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWatchlist = async () => {
    if (!isSignedIn || !userId) {
      setWatchlist([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/watchlist');
      
      if (!response.ok) {
        throw new Error('Failed to fetch watchlist');
      }
      
      const data = await response.json();
      setWatchlist(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching watchlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch watchlist');
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async (item: {
    exchange: string;
    symbol: string;
    contract_type: string;
    starred?: boolean;
  }) => {
    if (!isSignedIn) {
      throw new Error('Must be signed in to add to watchlist');
    }

    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add to watchlist');
      }

      const newItem = await response.json();
      setWatchlist(prev => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      console.error('Error adding to watchlist:', err);
      throw err;
    }
  };

  const removeFromWatchlist = async (id: string) => {
    if (!isSignedIn) {
      throw new Error('Must be signed in to remove from watchlist');
    }

    try {
      const response = await fetch(`/api/watchlist?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove from watchlist');
      }

      setWatchlist(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error removing from watchlist:', err);
      throw err;
    }
  };

  const toggleStar = async (id: string) => {
    if (!isSignedIn) {
      throw new Error('Must be signed in to update watchlist');
    }

    const item = watchlist.find(w => w.id === id);
    if (!item) return;

    try {
      const response = await fetch('/api/watchlist', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          starred: !item.starred,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update watchlist item');
      }

      const updatedItem = await response.json();
      setWatchlist(prev => 
        prev.map(w => w.id === id ? updatedItem : w)
      );
    } catch (err) {
      console.error('Error updating watchlist item:', err);
      throw err;
    }
  };

  const isInWatchlist = (exchange: string, symbol: string, contractType: string) => {
    return watchlist.some(item => 
      item.exchange === exchange && 
      item.symbol === symbol && 
      item.contract_type === contractType
    );
  };

  useEffect(() => {
    fetchWatchlist();
  }, [isSignedIn, userId]);

  return {
    watchlist,
    loading,
    error,
    addToWatchlist,
    removeFromWatchlist,
    toggleStar,
    isInWatchlist,
    refetch: fetchWatchlist,
  };
}
