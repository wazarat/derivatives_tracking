import { useQuery } from '@tanstack/react-query';

// Define types locally until the generated types are available
interface DerivativesLatest {
  id: number;
  ts: string;
  exchange: string;
  symbol: string;
  contract_type: 'derivatives';
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

// Fallback mock data in case API fails
const mockData: DerivativesLatest[] = [
  {
    id: 1,
    ts: new Date().toISOString(),
    exchange: 'binance',
    symbol: 'BTCUSDT',
    contract_type: 'derivatives',
    oi_usd: 1000000000,
    funding_rate: 0.0001,
    volume_24h: 5000000000,
    index_price: 65000
  },
  {
    id: 2,
    ts: new Date().toISOString(),
    exchange: 'binance',
    symbol: 'ETHUSDT',
    contract_type: 'derivatives',
    oi_usd: 500000000,
    funding_rate: 0.0002,
    volume_24h: 2500000000,
    index_price: 3500
  },
  {
    id: 3,
    ts: new Date().toISOString(),
    exchange: 'okx',
    symbol: 'BTC-USDT-SWAP',
    contract_type: 'derivatives',
    oi_usd: 800000000,
    funding_rate: -0.0001,
    volume_24h: 4000000000,
    index_price: 65100
  },
  {
    id: 4,
    ts: new Date().toISOString(),
    exchange: 'bybit',
    symbol: 'BTCUSDT',
    contract_type: 'derivatives',
    oi_usd: 600000000,
    funding_rate: null,
    volume_24h: 3000000000,
    index_price: 64900
  }
];

/**
 * Fetch derivatives data from the API
 * @param sector The derivatives sector to fetch (cex-perps, cex-futures, dex-perps)
 * @returns Promise with the derivatives data
 */
async function fetchDerivatives(sector: DerivativesSector): Promise<DerivativesLatest[]> {
  console.log('[useDerivatives] Fetching derivatives data for sector:', sector);
  console.log('[useDerivatives] Environment:', process.env.NODE_ENV);
  
  try {
    // Get the base URL for the API request
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const apiUrl = `${baseUrl}/api/cmc-derivatives`;
    
    // Add timestamp and sector to prevent caching
    const timestamp = new Date().getTime();
    const urlWithParams = `${apiUrl}?_t=${timestamp}&sector=${sector}`;
    
    console.log('[useDerivatives] Fetching from URL:', urlWithParams);
    
    // Make the API request with proper headers
    const response = await fetch(urlWithParams, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    console.log('[useDerivatives] API response status:', response.status);
    
    if (!response.ok) {
      console.error('[useDerivatives] Error response:', response.statusText);
      // Try to get more details from the error response
      try {
        const errorData = await response.json();
        console.error('[useDerivatives] Error details:', errorData);
      } catch (e) {
        console.error('[useDerivatives] Could not parse error response');
      }
      console.log('[useDerivatives] Falling back to mock data due to API error');
      return mockData; // Fallback to mock data on error
    }
    
    const data = await response.json();
    console.log('[useDerivatives] Received data count:', data?.data?.length || 0);
    
    if (!data || !data.data || data.data.length === 0) {
      console.log('[useDerivatives] No data returned from API, falling back to mock data');
      return mockData; // Fallback to mock data if no data returned
    }
    
    // Ensure all contracts are treated as 'derivatives'
    const normalizedData = data.data.map((item: any) => ({
      ...item,
      contract_type: 'derivatives'
    }));
    
    // Log a sample of the data
    if (normalizedData.length > 0) {
      console.log('[useDerivatives] Sample data item:', JSON.stringify(normalizedData[0]));
      
      // Count by exchange
      const exchanges = Array.from(new Set(normalizedData.map((item: any) => item.exchange)));
      const exchangeCounts: Record<string, number> = {};
      exchanges.forEach(exchange => {
        exchangeCounts[exchange as string] = normalizedData.filter((item: any) => item.exchange === exchange).length;
      });
      console.log('[useDerivatives] Exchange counts:', exchangeCounts);
    }
    
    return normalizedData;
  } catch (error) {
    console.error('[useDerivatives] Error fetching derivatives data:', error);
    console.log('[useDerivatives] Falling back to mock data due to error');
    return mockData; // Fallback to mock data on error
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
  
  // Calculate average funding rate for all contracts with non-null funding rates
  const contractsWithFundingRate = data.filter(item => item.funding_rate !== null);
  
  const averageFundingRate = contractsWithFundingRate.length > 0
    ? contractsWithFundingRate.reduce((sum, item) => sum + (item.funding_rate || 0), 0) / contractsWithFundingRate.length
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
  console.log('[useDerivatives] Hook called with sector:', sector);
  
  return useQuery<DerivativesLatest[], Error, { data: DerivativesLatest[], stats: DerivativesStats }>({
    queryKey: ['derivatives', 'cmc-api', sector], // Include sector in the key for proper caching
    queryFn: () => fetchDerivatives(sector),
    refetchInterval: 30000, // Refetch every 30 seconds
    select: (data) => {
      console.log('[useDerivatives] Received data from query:', data?.length || 0, 'items');
      console.log('[useDerivatives] Is mock data?', data === mockData ? 'YES - Using mock data' : 'NO - Using real data');
      return {
        data,
        stats: calculateDerivativesStats(data),
      };
    },
  });
}
