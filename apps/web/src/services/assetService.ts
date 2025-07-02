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

// API base URL from environment variable with fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
  
  const response = await fetch(`${API_BASE_URL}/assets/?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch assets: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return AssetListResponseSchema.parse(data);
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
