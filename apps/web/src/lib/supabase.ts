import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for Supabase tables
export type SupabasePortfolio = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  entries: SupabasePortfolioEntry[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type SupabasePortfolioEntry = {
  asset_id: string;
  allocation: number;
};

// Helper functions for Supabase operations
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};
