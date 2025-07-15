import { 
  Asset, 
  AssetListResponse, 
  AssetListResponseSchema, 
  AssetMetricsResponse, 
  AssetMetricsResponseSchema,
  AssetRiskScoreResponse,
  AssetRiskScoreResponseSchema,
  AssetSchema,
  Sector,
  RiskTier
} from '@/types/assets';
import { FuturesInstrument, PerpetualInstrument, DexPerpInstrument } from '@/config/columns';

// API base URL from environment variable with fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Check if code is running in browser or server
const isBrowser = typeof window !== "undefined";

export type AssetFilters = {
  sectors?: Sector[];
  risk_tiers?: RiskTier[];
  min_risk_score?: number;
  max_risk_score?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  is_active?: boolean;
  skip?: number;
  limit?: number;
};

/**
 * Fetches a list of assets with optional filtering
 */
export async function fetchAssets(filters: AssetFilters = {}): Promise<AssetListResponse> {
  // Return empty result during build if running on server
  if (!isBrowser) {
    return { data: [], total: 0, skip: 0, limit: 0 };
  }

  const params = new URLSearchParams();
  
  // Add all filters to query params
  if (filters.sectors?.length) {
    filters.sectors.forEach(sector => params.append('sectors', sector));
  }
  
  if (filters.risk_tiers?.length) {
    filters.risk_tiers.forEach(tier => params.append('risk_tiers', tier));
  }
  
  if (filters.min_risk_score !== undefined) {
    params.append('min_risk_score', filters.min_risk_score.toString());
  }
  
  if (filters.max_risk_score !== undefined) {
    params.append('max_risk_score', filters.max_risk_score.toString());
  }
  
  if (filters.search) {
    params.append('search', filters.search);
  }
  
  if (filters.sort_by) {
    params.append('sort_by', filters.sort_by);
  }
  
  if (filters.sort_order) {
    params.append('sort_order', filters.sort_order);
  }
  
  if (filters.is_active !== undefined) {
    params.append('is_active', filters.is_active.toString());
  }
  
  params.append('skip', (filters.skip || 0).toString());
  params.append('limit', (filters.limit || 100).toString());
  
  try {
    const response = await fetch(`${API_BASE_URL}/assets/?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch assets: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return AssetListResponseSchema.parse(data);
  } catch (error) {
    console.error("Error fetching assets:", error);
    return { data: [], total: 0, skip: 0, limit: 0 };
  }
}

/**
 * Fetches a single asset by ID
 */
export async function fetchAssetById(id: string): Promise<Asset> {
  const response = await fetch(`${API_BASE_URL}/assets/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch asset: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return AssetSchema.parse(data.data);
}

/**
 * Fetches historical metrics for an asset
 */
export async function fetchAssetMetrics(
  assetId: string, 
  metricType?: string, 
  startDate?: string, 
  endDate?: string,
  limit: number = 100
): Promise<AssetMetricsResponse> {
  const params = new URLSearchParams();
  
  if (metricType) {
    params.append('metric_type', metricType);
  }
  
  if (startDate) {
    params.append('start_date', startDate);
  }
  
  if (endDate) {
    params.append('end_date', endDate);
  }
  
  params.append('limit', limit.toString());
  
  const response = await fetch(`${API_BASE_URL}/assets/${assetId}/metrics?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch asset metrics: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return AssetMetricsResponseSchema.parse(data);
}

/**
 * Fetches the current risk score for an asset
 */
export async function fetchAssetRiskScore(assetId: string): Promise<AssetRiskScoreResponse> {
  const response = await fetch(`${API_BASE_URL}/assets/${assetId}/risk-score`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch asset risk score: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return AssetRiskScoreResponseSchema.parse(data);
}

/**
 * Fetches all available sectors
 */
export async function fetchSectors(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/assets/sectors`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch sectors: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Fetches all available risk tiers
 */
export async function fetchRiskTiers(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/assets/risk-tiers`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch risk tiers: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Fetches instruments for a specific sector
 * @param sector The sector to fetch instruments for (cex-futures, cex-perps, dex-perps)
 * @returns Promise with array of instruments
 */
export async function fetchSectorInstruments(sector: string): Promise<any[]> {
  // In a real implementation, this would call an API endpoint
  // For now, we'll return mock data
  
  // Mock data for different sectors
  const mockData = {
    'cex-futures': [
      {
        id: "btc-0924",
        symbol: "BTC-0924",
        name: "Bitcoin September 2024",
        venue: "Binance",
        price: 65420.50,
        change24h: 2.35,
        volume24h: 1250000000,
        basisAbs: 120.25,
        basisApr: 1.85,
        termSlope: 0.012,
        elr: 2.4,
        liqUsd: 450000000,
      },
      {
        id: "eth-0924",
        symbol: "ETH-0924",
        name: "Ethereum September 2024",
        venue: "Binance",
        price: 3420.75,
        change24h: 1.85,
        volume24h: 750000000,
        basisAbs: 45.50,
        basisApr: 1.35,
        termSlope: 0.008,
        elr: 2.1,
        liqUsd: 280000000,
      },
      {
        id: "sol-0924",
        symbol: "SOL-0924",
        name: "Solana September 2024",
        venue: "OKX",
        price: 142.30,
        change24h: 3.65,
        volume24h: 320000000,
        basisAbs: 2.15,
        basisApr: 1.52,
        termSlope: 0.009,
        elr: 2.6,
        liqUsd: 85000000,
      },
    ],
    'cex-perps': [
      {
        id: "btc-perp",
        symbol: "BTC-PERP",
        name: "Bitcoin Perpetual",
        venue: "Bybit",
        price: 65380.25,
        change24h: 2.28,
        volume24h: 2100000000,
        fundingRate: 0.0012,
        fundingApr: 1.05,
        oiUsd: 1850000000,
        skew: 1.12,
        liqUsd: 520000000,
      },
      {
        id: "eth-perp",
        symbol: "ETH-PERP",
        name: "Ethereum Perpetual",
        venue: "Bybit",
        price: 3418.50,
        change24h: 1.92,
        volume24h: 1250000000,
        fundingRate: 0.0008,
        fundingApr: 0.72,
        oiUsd: 950000000,
        skew: 1.05,
        liqUsd: 320000000,
      },
      {
        id: "arb-perp",
        symbol: "ARB-PERP",
        name: "Arbitrum Perpetual",
        venue: "Binance",
        price: 1.28,
        change24h: 5.75,
        volume24h: 180000000,
        fundingRate: 0.0025,
        fundingApr: 2.19,
        oiUsd: 120000000,
        skew: 0.92,
        liqUsd: 45000000,
      },
    ],
    'dex-perps': [
      {
        id: "btc-perp-gmx",
        symbol: "BTC-PERP",
        name: "Bitcoin Perpetual",
        venue: "GMX",
        price: 65410.75,
        change24h: 2.32,
        volume24h: 320000000,
        fundingRate: 0.0010,
        fundingApr: 0.88,
        oiUsd: 280000000,
        skew: 1.08,
        liqUsd: 95000000,
        tvl: 520000000,
        utilization: 53.8,
        fees24h: 850000,
      },
      {
        id: "eth-perp-dydx",
        symbol: "ETH-PERP",
        name: "Ethereum Perpetual",
        venue: "dYdX",
        price: 3421.25,
        change24h: 1.88,
        volume24h: 280000000,
        fundingRate: 0.0007,
        fundingApr: 0.61,
        oiUsd: 210000000,
        skew: 1.02,
        liqUsd: 75000000,
        tvl: 420000000,
        utilization: 50.0,
        fees24h: 720000,
      },
      {
        id: "sol-perp-drift",
        symbol: "SOL-PERP",
        name: "Solana Perpetual",
        venue: "Drift",
        price: 142.85,
        change24h: 3.72,
        volume24h: 95000000,
        fundingRate: 0.0018,
        fundingApr: 1.57,
        oiUsd: 65000000,
        skew: 1.15,
        liqUsd: 28000000,
        tvl: 180000000,
        utilization: 36.1,
        fees24h: 320000,
      },
    ],
  };
  
  return mockData[sector as keyof typeof mockData] || [];
}
