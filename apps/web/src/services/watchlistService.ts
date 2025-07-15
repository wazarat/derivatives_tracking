import { supabase } from "@/lib/supabase";
import { AddTradeFormData } from "@/components/research/AddTradeModal";

// Define types for watchlist and portfolio items
export interface WatchlistItem {
  id: string;
  user_id: string;
  instrument_id: string;
  instrument_symbol: string;
  instrument_name: string;
  venue: string;
  notes: string;
  created_at: string;
}

export interface PortfolioItem extends WatchlistItem {
  position_side: 'long' | 'short';
  position_size: number;
  entry_price: number;
  stop_loss?: number;
  take_profit?: number;
  leverage?: number;
}

/**
 * Add an instrument to the user's watchlist
 * @param data The trade data to add
 * @returns The created watchlist item
 */
export async function addToWatchlist(data: AddTradeFormData): Promise<WatchlistItem> {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error("User not authenticated");
  }
  
  const { data: watchlistItem, error } = await supabase
    .from("watchlist")
    .insert({
      user_id: user.user.id,
      instrument_id: data.instrumentId,
      instrument_symbol: data.instrumentSymbol,
      instrument_name: data.instrumentName,
      venue: data.venue,
      notes: data.notes,
    })
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  // Emit websocket event for real-time updates
  await supabase.channel('watchlist_changes').send({
    type: 'broadcast',
    event: 'watchlist_add',
    payload: { user_id: user.user.id, item: watchlistItem },
  });
  
  return watchlistItem;
}

/**
 * Add an instrument to the user's portfolio
 * @param data The trade data to add
 * @returns The created portfolio item
 */
export async function addToPortfolio(data: AddTradeFormData): Promise<PortfolioItem> {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error("User not authenticated");
  }
  
  if (!data.position) {
    throw new Error("Position data is required for portfolio items");
  }
  
  const { data: portfolioItem, error } = await supabase
    .from("portfolio")
    .insert({
      user_id: user.user.id,
      instrument_id: data.instrumentId,
      instrument_symbol: data.instrumentSymbol,
      instrument_name: data.instrumentName,
      venue: data.venue,
      notes: data.notes,
      position_side: data.position.side,
      position_size: data.position.size,
      entry_price: data.position.entryPrice,
      stop_loss: data.position.stopLoss,
      take_profit: data.position.takeProfit,
      leverage: data.position.leverage,
    })
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  // Emit websocket event for real-time updates
  await supabase.channel('portfolio_changes').send({
    type: 'broadcast',
    event: 'portfolio_add',
    payload: { user_id: user.user.id, item: portfolioItem },
  });
  
  return portfolioItem;
}

/**
 * Get the user's watchlist
 * @returns Array of watchlist items
 */
export async function getWatchlist(): Promise<WatchlistItem[]> {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error("User not authenticated");
  }
  
  const { data, error } = await supabase
    .from("watchlist")
    .select("*")
    .eq("user_id", user.user.id)
    .order("created_at", { ascending: false });
  
  if (error) {
    throw error;
  }
  
  return data || [];
}

/**
 * Get the user's portfolio
 * @returns Array of portfolio items
 */
export async function getPortfolio(): Promise<PortfolioItem[]> {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error("User not authenticated");
  }
  
  const { data, error } = await supabase
    .from("portfolio")
    .select("*")
    .eq("user_id", user.user.id)
    .order("created_at", { ascending: false });
  
  if (error) {
    throw error;
  }
  
  return data || [];
}

/**
 * Remove an item from the user's watchlist
 * @param id The ID of the watchlist item to remove
 */
export async function removeFromWatchlist(id: string): Promise<void> {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error("User not authenticated");
  }
  
  const { error } = await supabase
    .from("watchlist")
    .delete()
    .eq("id", id)
    .eq("user_id", user.user.id);
  
  if (error) {
    throw error;
  }
  
  // Emit websocket event for real-time updates
  await supabase.channel('watchlist_changes').send({
    type: 'broadcast',
    event: 'watchlist_remove',
    payload: { user_id: user.user.id, item_id: id },
  });
}

/**
 * Remove an item from the user's portfolio
 * @param id The ID of the portfolio item to remove
 */
export async function removeFromPortfolio(id: string): Promise<void> {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error("User not authenticated");
  }
  
  const { error } = await supabase
    .from("portfolio")
    .delete()
    .eq("id", id)
    .eq("user_id", user.user.id);
  
  if (error) {
    throw error;
  }
  
  // Emit websocket event for real-time updates
  await supabase.channel('portfolio_changes').send({
    type: 'broadcast',
    event: 'portfolio_remove',
    payload: { user_id: user.user.id, item_id: id },
  });
}
