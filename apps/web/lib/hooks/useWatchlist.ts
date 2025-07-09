import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';

// Types
export interface WatchlistItem {
  id: number;
  symbol: string;
  usd_value: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface WatchlistCreateInput {
  symbol: string;
  usd_value: number;
}

export interface WatchlistUpdateInput {
  usd_value: number;
}

// API endpoints - using Next.js API routes instead of direct FastAPI calls
const WATCHLIST_ENDPOINT = '/api/watchlist';

/**
 * Custom hook for managing watchlist data
 */
export function useWatchlist() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  // Fetch watchlist data
  const { data: watchlist = [], isLoading, error } = useQuery({
    queryKey: ['watchlist'],
    queryFn: async () => {
      const response = await fetch(WATCHLIST_ENDPOINT);
      
      if (!response.ok) {
        throw new Error('Failed to fetch watchlist');
      }
      
      return response.json();
    },
    enabled: !!userId, // Only fetch if user is authenticated
  });

  // Add asset to watchlist
  const addAsset = useMutation({
    mutationFn: async (newItem: WatchlistCreateInput) => {
      const response = await fetch(WATCHLIST_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add asset to watchlist');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  // Update asset allocation
  const updateAllocation = useMutation({
    mutationFn: async ({ symbol, usd_value }: { symbol: string; usd_value: number }) => {
      const response = await fetch(`${WATCHLIST_ENDPOINT}/${symbol}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usd_value }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update asset allocation');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  // Remove asset from watchlist
  const removeAsset = useMutation({
    mutationFn: async (symbol: string) => {
      const response = await fetch(`${WATCHLIST_ENDPOINT}/${symbol}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove asset from watchlist');
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  // Calculate total portfolio value
  const totalValue = watchlist.reduce((sum: number, item: WatchlistItem) => sum + item.usd_value, 0);

  return {
    watchlist,
    isLoading,
    error,
    addAsset,
    updateAllocation,
    removeAsset,
    totalValue,
  };
}
