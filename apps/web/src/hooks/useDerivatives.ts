import { useQuery } from '@tanstack/react-query';

// Define types locally until the generated types are available
interface DerivativesLatest {
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

interface DerivativesStats {
  totalOpenInterest: number;
  totalVolume24h: number;
  averageFundingRate: number | null;
  contractCount: number;
}

// Define sector types
export type DerivativesSector = 'cex-perps' | 'cex-futures' | 'dex-perps';

/**
 * Fetch derivatives data from the API
 * @param sector The derivatives sector to fetch (cex-perps, cex-futures, dex-perps)
 * @returns Promise with the derivatives data
 */
async function fetchDerivatives(sector: DerivativesSector): Promise<DerivativesLatest[]> {
  // Add console logs for debugging
  console.log('Fetching derivatives data for sector:', sector);
  
  try {
    // For now, use the unified endpoint for all sectors
    const response = await fetch('/api/derivatives/all');
    
    console.log('API response status:', response.status);
    
    if (!response.ok) {
      console.error('Error response:', response.statusText);
      throw new Error(`Failed to fetch derivatives data: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Received data count:', data.length);
    
    // If we need to filter by contract_type based on sector, we can do it here
    // For now, we'll return all data regardless of sector
    return data;
  } catch (error) {
    console.error('Error fetching derivatives data:', error);
    throw error;
  }
}

/**
 * Calculate aggregated statistics from derivatives data
 * @param data Array of derivatives contracts
 * @returns Object with aggregated statistics
 */
export function calculateDerivativesStats(data: DerivativesLatest[]): DerivativesStats {
  if (!data || data.length === 0) {
    return {
      totalOpenInterest: 0,
      totalVolume24h: 0,
      averageFundingRate: null,
      contractCount: 0,
    };
  }
  
  const totalOpenInterest = data.reduce((sum, item) => sum + item.oi_usd, 0);
  const totalVolume24h = data.reduce((sum, item) => sum + item.volume_24h, 0);
  
  // Calculate average funding rate only for perpetual contracts with non-null funding rates
  const perpetuals = data.filter(item => 
    item.contract_type === 'perpetual' && item.funding_rate !== null
  );
  
  const averageFundingRate = perpetuals.length > 0
    ? perpetuals.reduce((sum, item) => sum + (item.funding_rate || 0), 0) / perpetuals.length
    : null;
  
  return {
    totalOpenInterest,
    totalVolume24h,
    averageFundingRate,
    contractCount: data.length,
  };
}

/**
 * React Query hook for fetching derivatives data
 * @param sector The derivatives sector to fetch (cex-perps, cex-futures, dex-perps)
 * @returns Query result with derivatives data and stats
 */
export function useDerivatives(sector: DerivativesSector) {
  console.log('useDerivatives hook called with sector:', sector);
  
  return useQuery<DerivativesLatest[], Error, { data: DerivativesLatest[], stats: DerivativesStats }>({
    queryKey: ['derivatives', 'all'], // Use 'all' instead of sector to ensure same data for all pages
    queryFn: () => fetchDerivatives(sector),
    refetchInterval: 30000, // Refetch every 30 seconds
    select: (data) => {
      console.log('Received data from query:', data);
      return {
        data,
        stats: calculateDerivativesStats(data),
      };
    },
  });
}
