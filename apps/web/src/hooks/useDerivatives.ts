'use client';

import React, { useState, useEffect } from 'react';
import * as ReactQuery from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

// Define types based on actual Supabase table structure
interface DerivativesLatest {
  id: string;
  ts: string;
  exchange: string;
  symbol: string;
  contract_type: string;
  oi: number; // open interest 
  vol24h: number; // 24h volume
  funding_rate: number;
  price: number; // index price
}

interface DerivativesStats {
  totalContracts: number;
  totalVolume: number;
  totalVolume24h: number;
  totalOpenInterest: number;
  exchanges: number;
  contractCount: number;
  averageFundingRate: number | null;
}

export type DerivativesSector = 'cex-perps' | 'cex-futures' | 'dex-perps';

// Mock data for fallback - updated to match real table structure
const mockData: DerivativesLatest[] = [
  {
    id: '1',
    ts: '2025-07-17T00:00:00.000Z',
    exchange: 'Hyperliquid',
    symbol: 'ETH-USD',
    contract_type: 'perpetual',
    oi: 767808.37,
    vol24h: 4980378298.67,
    funding_rate: 0.0000125,
    price: 3356.7,
  },
];

/**
 * Fetch derivatives data from API with fallback to Supabase
 */
async function fetchDerivatives(sector: DerivativesSector): Promise<DerivativesLatest[]> {
  console.log(`[fetchDerivatives] Fetching data for sector: ${sector}`);
  
  try {
    // Try primary API endpoint first
    const primaryUrl = `/api/crypto/${sector}`;
    console.log(`[fetchDerivatives] Trying primary endpoint: ${primaryUrl}`);
    
    const response = await fetch(primaryUrl);
    
    if (response.ok) {
      const responseData = await response.json();
      console.log(`[fetchDerivatives] Primary API success:`, responseData);
      
      // Handle wrapped response structure (e.g., { data: [...], count: 100 })
      const data = responseData.data || responseData;
      console.log(`[fetchDerivatives] Extracted data:`, data?.length || 0, 'items');
      return Array.isArray(data) ? data : [];
    }
    
    console.log(`[fetchDerivatives] Primary API failed with status: ${response.status}`);
    throw new Error(`Primary API failed: ${response.status}`);
    
  } catch (primaryError) {
    console.log(`[fetchDerivatives] Primary API error:`, primaryError);
    
    // Fallback to Supabase REST API
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('[fetchDerivatives] Missing Supabase credentials');
        return mockData;
      }
      
      const tableName = sector === 'dex-perps' ? 'dex_derivatives_instruments' : 'cex_derivatives_instruments';
      const fallbackUrl = `${supabaseUrl}/rest/v1/${tableName}?select=id,ts,exchange,symbol,contract_type,oi,vol24h,funding_rate,price&order=ts.desc&limit=100`;
      
      console.log(`[fetchDerivatives] Trying Supabase fallback: ${fallbackUrl}`);
      
      const fallbackResponse = await fetch(fallbackUrl, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!fallbackResponse.ok) {
        const errorText = await fallbackResponse.text();
        console.error(`[fetchDerivatives] Supabase fallback failed:`, {
          status: fallbackResponse.status,
          statusText: fallbackResponse.statusText,
          errorText,
          url: fallbackUrl
        });
        throw new Error(`Supabase API error: ${fallbackResponse.status} ${fallbackResponse.statusText}`);
      }
      
      const fallbackData = await fallbackResponse.json();
      console.log(`[fetchDerivatives] Supabase fallback success:`, {
        recordCount: fallbackData?.length || 0,
        firstRecord: fallbackData?.[0],
        sampleData: fallbackData?.slice(0, 3),
        firstRecordFields: fallbackData?.[0] ? {
          oi: fallbackData[0].oi,
          vol24h: fallbackData[0].vol24h,
          funding_rate: fallbackData[0].funding_rate,
          price: fallbackData[0].price,
          oiType: typeof fallbackData[0].oi,
          vol24hType: typeof fallbackData[0].vol24h,
          fundingRateType: typeof fallbackData[0].funding_rate,
          priceType: typeof fallbackData[0].price
        } : null
      });
      
      return fallbackData || [];
      
    } catch (fallbackError) {
      console.error(`[fetchDerivatives] All endpoints failed, using mock data:`, fallbackError);
      return mockData;
    }
  }
}

/**
 * Calculate statistics from derivatives data
 */
function calculateDerivativesStats(data: any[]): DerivativesStats {
  if (!data || data.length === 0) {
    return {
      totalContracts: 0,
      totalVolume: 0,
      totalVolume24h: 0,
      totalOpenInterest: 0,
      exchanges: 0,
      contractCount: 0,
      averageFundingRate: null,
    };
  }

  // Ensure all numeric values are properly parsed
  const totalVolume24h = data.reduce((sum, item) => {
    // Use the mapped volume_24h field from the transformed data
    const vol = typeof item.volume_24h === 'string' ? parseFloat(item.volume_24h) : (item.volume_24h || 0);
    return sum + (isNaN(vol) ? 0 : vol);
  }, 0);
  
  const totalOpenInterest = data.reduce((sum, item) => {
    const oi = typeof item.oi === 'string' ? parseFloat(item.oi) : (item.oi || 0);
    return sum + (isNaN(oi) ? 0 : oi);
  }, 0);
  
  const uniqueExchanges = new Set(data.map(item => item.exchange)).size;
  
  // Calculate average funding rate (only for items that have valid funding_rate)
  const itemsWithFundingRate = data.filter(item => {
    const rate = typeof item.funding_rate === 'string' ? parseFloat(item.funding_rate) : item.funding_rate;
    return rate !== null && rate !== undefined && !isNaN(rate);
  });
  
  const averageFundingRate = itemsWithFundingRate.length > 0 
    ? itemsWithFundingRate.reduce((sum, item) => {
        const rate = typeof item.funding_rate === 'string' ? parseFloat(item.funding_rate) : item.funding_rate;
        return sum + (rate || 0);
      }, 0) / itemsWithFundingRate.length
    : null;

  console.log(`[calculateDerivativesStats] Processed ${data.length} records:`, {
    totalVolume24h,
    totalOpenInterest,
    uniqueExchanges,
    averageFundingRate,
    sampleRecord: data[0]
  });

  return {
    totalContracts: data.length,
    totalVolume: totalVolume24h,
    totalVolume24h,
    totalOpenInterest,
    exchanges: uniqueExchanges,
    contractCount: data.length,
    averageFundingRate,
  };
}

/**
 * React Query hook for fetching derivatives data
 * @param sector The derivatives sector to fetch (cex-perps, cex-futures, dex-perps)
 * @returns Query result with derivatives data and stats
 */
export function useDerivatives(sector: DerivativesSector) {
  console.log(`[useDerivatives] Hook called with sector: ${sector}`);
  
  // Prevent hydration issues by only running on client
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const query = ReactQuery.useQuery({
    queryKey: ['derivatives', sector],
    queryFn: () => fetchDerivatives(sector),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isClient, // Only run query on client side
  });
  
  // Transform the data with proper error handling
  const transformedData = React.useMemo(() => {
    if (!query.data) {
      return { 
        data: [], 
        stats: { 
          totalContracts: 0, 
          totalVolume: 0, 
          totalVolume24h: 0, 
          totalOpenInterest: 0, 
          exchanges: 0, 
          contractCount: 0, 
          averageFundingRate: null 
        } 
      };
    }
    
    // Map API response fields to frontend interface fields
    // Ensure query.data is an array before mapping
    const rawData = Array.isArray(query.data) ? query.data : [];
    const processedData = rawData.map((item: any) => ({
      ...item,
      // Map API fields to expected frontend fields
      volume_24h: item.vol24h || 0,
      index_price: item.price || 0,
      contract_type: 'derivatives' as const
    }));
    
    return {
      data: processedData,
      stats: calculateDerivativesStats(processedData)
    };
  }, [query.data]);
  
  return {
    ...query,
    data: transformedData
  };
}
