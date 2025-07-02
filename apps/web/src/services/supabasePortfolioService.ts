import { supabase, SupabasePortfolio, SupabasePortfolioEntry, getErrorMessage } from '@/lib/supabase';
import { Portfolio, PortfolioEntry } from '@/services/portfolioService';
import { Asset } from '@/types/assets';

/**
 * Convert a client-side Portfolio to a Supabase-compatible format
 */
export const portfolioToSupabaseFormat = (portfolio: Portfolio): Omit<SupabasePortfolio, 'id' | 'user_id' | 'created_at' | 'updated_at'> => {
  return {
    name: portfolio.name,
    description: portfolio.description || null,
    entries: portfolio.entries.map(entry => ({
      asset_id: entry.assetId,
      allocation: entry.allocation,
    })),
    is_public: portfolio.isPublic || false,
  };
};

/**
 * Convert a Supabase portfolio to client-side format
 * Note: This requires fetching the full asset data for each entry
 */
export const supabaseToPortfolioFormat = (
  supabasePortfolio: SupabasePortfolio,
  assets: Asset[]
): Portfolio => {
  // Create entries with asset data if available
  const entries: PortfolioEntry[] = supabasePortfolio.entries.map(entry => {
    const asset = assets.find(a => a.id === entry.asset_id);
    return {
      assetId: entry.asset_id,
      asset: asset!, // Asset might be undefined if it's no longer available
      allocation: entry.allocation,
      weight: entry.allocation / 100,
    };
  });

  // Filter out entries with missing assets
  const validEntries = entries.filter(entry => entry.asset);

  return {
    id: supabasePortfolio.id,
    name: supabasePortfolio.name,
    description: supabasePortfolio.description || '',
    entries: validEntries,
    createdAt: new Date(supabasePortfolio.created_at),
    updatedAt: new Date(supabasePortfolio.updated_at),
    isPublic: supabasePortfolio.is_public,
    userId: supabasePortfolio.user_id,
  };
};

/**
 * Save a portfolio to Supabase
 */
export const savePortfolioToSupabase = async (
  portfolio: Portfolio,
  userId: string
): Promise<Portfolio | null> => {
  try {
    const supabaseData = portfolioToSupabaseFormat(portfolio);
    
    // If portfolio has an ID, update it, otherwise create a new one
    if (portfolio.id) {
      const { data, error } = await supabase
        .from('portfolios')
        .update({
          ...supabaseData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', portfolio.id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      // Return the updated portfolio with the same assets
      return {
        ...portfolio,
        updatedAt: new Date(),
      };
    } else {
      // Create new portfolio
      const { data, error } = await supabase
        .from('portfolios')
        .insert({
          ...supabaseData,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      // Return the new portfolio with ID from Supabase
      return {
        ...portfolio,
        id: data.id,
        userId,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    }
  } catch (error) {
    console.error('Error saving portfolio to Supabase:', getErrorMessage(error));
    return null;
  }
};

/**
 * Get all portfolios for a user from Supabase
 */
export const getUserPortfoliosFromSupabase = async (
  userId: string,
  assets: Asset[]
): Promise<Portfolio[]> => {
  try {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Convert each portfolio to client format
    return (data as SupabasePortfolio[]).map(portfolio => 
      supabaseToPortfolioFormat(portfolio, assets)
    );
  } catch (error) {
    console.error('Error fetching portfolios from Supabase:', getErrorMessage(error));
    return [];
  }
};

/**
 * Get a specific portfolio by ID from Supabase
 */
export const getPortfolioFromSupabase = async (
  portfolioId: string,
  assets: Asset[]
): Promise<Portfolio | null> => {
  try {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', portfolioId)
      .single();

    if (error) throw new Error(error.message);
    if (!data) return null;

    return supabaseToPortfolioFormat(data as SupabasePortfolio, assets);
  } catch (error) {
    console.error('Error fetching portfolio from Supabase:', getErrorMessage(error));
    return null;
  }
};

/**
 * Delete a portfolio from Supabase
 */
export const deletePortfolioFromSupabase = async (
  portfolioId: string,
  userId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', portfolioId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return true;
  } catch (error) {
    console.error('Error deleting portfolio from Supabase:', getErrorMessage(error));
    return false;
  }
};

/**
 * Get public portfolios from Supabase
 */
export const getPublicPortfoliosFromSupabase = async (
  assets: Asset[],
  limit: number = 10
): Promise<Portfolio[]> => {
  try {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('is_public', true)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);

    // Convert each portfolio to client format
    return (data as SupabasePortfolio[]).map(portfolio => 
      supabaseToPortfolioFormat(portfolio, assets)
    );
  } catch (error) {
    console.error('Error fetching public portfolios from Supabase:', getErrorMessage(error));
    return [];
  }
};
