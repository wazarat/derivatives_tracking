import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

export interface PortfolioPosition {
  id: string;
  user_id: string;
  exchange: string;
  symbol: string;
  contract_type: string;
  position_side: 'long' | 'short';
  position_size: number;
  entry_price: number;
  stop_loss?: number;
  take_profit?: number;
  leverage: number;
  trade_created_at: string;
  notes?: string;
  status: 'open' | 'closed' | 'partially_closed';
  closed_at?: string;
  exit_price?: number;
  realized_pnl?: number;
  created_at: string;
  updated_at: string;
  // Enriched data from API
  current_price?: number;
  unrealized_pnl?: number;
  unrealized_pnl_percentage?: number;
  last_price_update?: string;
}

export function usePortfolio() {
  const { isSignedIn, userId } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = async () => {
    if (!isSignedIn || !userId) {
      setPortfolio([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/portfolio');
      
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio');
      }
      
      const data = await response.json();
      setPortfolio(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolio');
    } finally {
      setLoading(false);
    }
  };

  const addPosition = async (position: {
    exchange: string;
    symbol: string;
    contract_type?: string;
    position_side: 'long' | 'short';
    position_size: number;
    entry_price: number;
    stop_loss?: number;
    take_profit?: number;
    leverage?: number;
    notes?: string;
    trade_created_at?: string;
  }) => {
    if (!isSignedIn) {
      throw new Error('Must be signed in to add position');
    }

    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(position),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add position');
      }

      const newPosition = await response.json();
      setPortfolio(prev => [newPosition, ...prev]);
      return newPosition;
    } catch (err) {
      console.error('Error adding position:', err);
      throw err;
    }
  };

  const updatePosition = async (id: string, updates: {
    position_size?: number;
    entry_price?: number;
    stop_loss?: number;
    take_profit?: number;
    leverage?: number;
    notes?: string;
    status?: 'open' | 'closed' | 'partially_closed';
    exit_price?: number;
  }) => {
    if (!isSignedIn) {
      throw new Error('Must be signed in to update position');
    }

    try {
      const response = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates }),
      });

      if (!response.ok) {
        throw new Error('Failed to update position');
      }

      const updatedPosition = await response.json();
      setPortfolio(prev => 
        prev.map(p => p.id === id ? updatedPosition : p)
      );
      return updatedPosition;
    } catch (err) {
      console.error('Error updating position:', err);
      throw err;
    }
  };

  const closePosition = async (id: string) => {
    if (!isSignedIn) {
      throw new Error('Must be signed in to close position');
    }

    try {
      const response = await fetch(`/api/portfolio?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to close position');
      }

      setPortfolio(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error closing position:', err);
      throw err;
    }
  };

  const getPortfolioStats = () => {
    const activePositions = portfolio.filter(p => p.status === 'open');
    
    const totalUnrealizedPnl = activePositions.reduce((sum, p) => sum + (p.unrealized_pnl || 0), 0);
    const totalEntryValue = activePositions.reduce((sum, p) => sum + (p.entry_price * p.position_size), 0);
    const totalCurrentValue = activePositions.reduce((sum, p) => {
      const currentPrice = p.current_price || p.entry_price;
      return sum + (currentPrice * p.position_size);
    }, 0);
    
    const totalPnlPercentage = totalEntryValue > 0 ? (totalUnrealizedPnl / totalEntryValue) * 100 : 0;
    
    const longPositions = activePositions.filter(p => p.position_side === 'long').length;
    const shortPositions = activePositions.filter(p => p.position_side === 'short').length;
    
    const winningPositions = activePositions.filter(p => (p.unrealized_pnl || 0) > 0).length;
    const losingPositions = activePositions.filter(p => (p.unrealized_pnl || 0) < 0).length;
    
    // Calculate realized P&L from closed positions
    const closedPositions = portfolio.filter(p => p.status === 'closed');
    const totalRealizedPnl = closedPositions.reduce((sum, p) => sum + (p.realized_pnl || 0), 0);
    
    return {
      totalPositions: activePositions.length,
      totalUnrealizedPnl,
      totalRealizedPnl,
      totalPnl: totalUnrealizedPnl + totalRealizedPnl,
      totalPnlPercentage,
      totalEntryValue,
      totalCurrentValue,
      longPositions,
      shortPositions,
      winningPositions,
      losingPositions,
      winRate: activePositions.length > 0 ? (winningPositions / activePositions.length) * 100 : 0,
      closedPositions: closedPositions.length,
    };
  };

  useEffect(() => {
    fetchPortfolio();
  }, [isSignedIn, userId]);

  return {
    portfolio,
    loading,
    error,
    addPosition,
    updatePosition,
    closePosition,
    getPortfolioStats,
    refetch: fetchPortfolio,
  };
}
