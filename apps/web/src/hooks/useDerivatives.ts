import { useQuery } from '@tanstack/react-query';

// Define types locally until the generated types are available
interface DerivativesLatest {
  id: number;
  ts: string;
  exchange: string;
  symbol: string;
  contract_type: 'perpetual' | 'futures' | 'derivatives';
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
    contract_type: 'perpetual',
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
    contract_type: 'perpetual',
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
    contract_type: 'perpetual',
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
    contract_type: 'futures',
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
  console.log('Fetching derivatives data for sector:', sector);
  
  try {
    // Use the pages/api endpoint instead of app/api
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const apiUrl = `${baseUrl}/api/cmc-derivatives`;
    console.log('Fetching from URL:', apiUrl);
    
    // Log environment information
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Window location:', typeof window !== 'undefined' ? window.location.href : 'No window');
    
    const response = await fetch(apiUrl);
    
    console.log('API response status:', response.status);
    
    if (!response.ok) {
      console.error('Error response:', response.statusText);
      // Try to get more details from the error response
      try {
        const errorData = await response.json();
        console.error('Error details:', errorData);
      } catch (e) {
        console.error('Could not parse error response');
      }
      console.log('Falling back to mock data due to API error');
      return mockData; // Fallback to mock data on error
    }
    
    const data = await response.json();
    console.log('Received data count:', data?.length || 0);
    
    if (!data || data.length === 0) {
      console.log('No data returned from API, falling back to mock data');
      return mockData; // Fallback to mock data if no data returned
    }
    
    // Log a sample of the data
    if (data.length > 0) {
      console.log('Sample data item:', JSON.stringify(data[0]));
      
      // Log contract types for debugging - fixed TypeScript error with Array.from
      const contractTypes = Array.from(new Set(data.map(item => item.contract_type)));
      console.log('Contract types in data:', contractTypes);
      
      // Count by contract type
      const contractTypeCounts = contractTypes.reduce((acc: Record<string, number>, type: string) => {
        acc[type] = data.filter(item => item.contract_type === type).length;
        return acc;
      }, {} as Record<string, number>);
      console.log('Contract type counts:', contractTypeCounts);
    }
    
    // TEMPORARY FIX: For now, show all data on both pages
    // Later we'll need to fix the worker to properly categorize contracts
    if (sector === 'cex-perps') {
      // For now, show all derivatives data on the perps page
      return data;
    } else if (sector === 'cex-futures') {
      // For now, show all derivatives data on the futures page
      return data;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching derivatives data:', error);
    console.log('Falling back to mock data due to error');
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
    queryKey: ['derivatives', 'cmc-api', sector], // Include sector in the key for proper caching
    queryFn: () => fetchDerivatives(sector),
    refetchInterval: 30000, // Refetch every 30 seconds
    select: (data) => {
      console.log('Received data from query:', data);
      console.log('Is mock data?', data === mockData ? 'YES - Using mock data' : 'NO - Using real data');
      return {
        data,
        stats: calculateDerivativesStats(data),
      };
    },
  });
}
