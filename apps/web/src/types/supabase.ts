/**
 * This file contains TypeScript types for Supabase database tables and views.
 * These types are generated from the Supabase schema.
 */

export interface DerivativesSnapshot {
  id: number;
  ts: string;
  exchange: string;
  symbol: string;
  contract_type: 'perpetual' | 'futures';
  oi_usd: number;
  funding_rate: number | null;
  volume_24h: number;
  index_price: number;
}

export interface DerivativesLatest extends DerivativesSnapshot {}

export interface DerivativesStats {
  totalOpenInterest: number;
  totalVolume24h: number;
  averageFundingRate: number | null;
  contractCount: number;
}
