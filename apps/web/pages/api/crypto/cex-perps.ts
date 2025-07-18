import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

// Add debug logging for environment variables
console.log('[CEX-PERPS API] Initializing with env vars:');
console.log('- NEXT_PUBLIC_SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('- SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

// Initialize Supabase client
let supabase: any = null;
try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    console.log('[CEX-PERPS API] Supabase client initialized successfully');
  } else {
    console.error('[CEX-PERPS API] Missing Supabase environment variables');
  }
} catch (error) {
  console.error('[CEX-PERPS API] Error initializing Supabase client:', error);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('[CEX-PERPS API] Fetching CEX perpetuals data');
  console.log('[CEX-PERPS API] Environment check:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('- SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  try {
    // Check if Supabase client is initialized
    if (!supabase) {
      console.error('[CEX-PERPS API] Supabase client not initialized');
      console.error('[CEX-PERPS API] Environment variables:');
      console.error('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING');
      console.error('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');
      
      return res.status(500).json({ 
        error: 'Server configuration error: Supabase client not initialized',
        message: 'The server is not properly configured to connect to the database',
        envCheck: {
          supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          supabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        }
      });
    }

    // Fetch all data from last 24 hours directly (simpler approach)
    console.log('[CEX-PERPS API] Fetching all CEX derivatives data from last 24 hours');
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: allData, error } = await supabase
      .from('cex_derivatives_instruments')
      .select('*')
      .gte('ts', oneDayAgo)
      .order('vol24h', { ascending: false })
      .limit(2000);

    if (error) {
      console.error('[CEX-PERPS API] Error fetching CEX derivatives data:', error);
      return res.status(500).json({ 
        error: 'Database error when fetching records', 
        details: error 
      });
    }

    console.log(`[CEX-PERPS API] Fetched ${allData?.length || 0} total records from recent timestamps`);
    
    // Debug: Log sample records to understand data structure
    if (allData && allData.length > 0) {
      console.log('[CEX-PERPS API] Sample records from database:');
      allData.slice(0, 3).forEach((record, i) => {
        console.log(`${i+1}. exchange: ${record.exchange}, symbol: ${record.symbol}, oi: ${record.oi}, vol24h: ${record.vol24h}, funding_rate: ${record.funding_rate}, price: ${record.price}`);
      });
    }
    
    // Filter for non-zero values and deduplicate by symbol (keep highest volume)
    const symbolMap = new Map();
    const nonZeroData = (allData || []).filter(record => {
      const hasNonZeroValues = record.oi > 0 || record.vol24h > 0 || record.funding_rate !== 0 || record.price > 0;
      if (!hasNonZeroValues) {
        console.log(`[CEX-PERPS API] Filtering out zero-value record: ${record.exchange} ${record.symbol} (oi: ${record.oi}, vol24h: ${record.vol24h}, funding_rate: ${record.funding_rate}, price: ${record.price})`);
      }
      return hasNonZeroValues;
    });
    
    console.log(`[CEX-PERPS API] Found ${nonZeroData.length} records with non-zero values`);
    
    // Deduplicate by symbol, keeping the record with highest volume
    nonZeroData.forEach(record => {
      const existing = symbolMap.get(record.symbol);
      if (!existing || record.vol24h > existing.vol24h) {
        symbolMap.set(record.symbol, record);
      }
    });
    
    const data = Array.from(symbolMap.values())
      .sort((a, b) => b.vol24h - a.vol24h)
      .slice(0, 500);
      
    console.log(`[CEX-PERPS API] Final deduplicated data: ${data.length} records`);

    // Log exchange distribution in final data
    const exchangeCounts = data.reduce((acc, record) => {
      acc[record.exchange] = (acc[record.exchange] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('[CEX-PERPS API] Exchange distribution in final data:', exchangeCounts);

    console.log(`[CEX-PERPS API] Successfully fetched ${data?.length || 0} records`);
    
    // Ensure we always return the expected structure
    if (!data) {
      console.warn('[CEX-PERPS API] No data returned from Supabase query');
      return res.status(200).json({ 
        data: [],
        message: 'No data available',
        timestamp: new Date().toISOString()
      });
    }
    
    // Set cache headers
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
    
    // Return the data in the expected format
    return res.status(200).json({ 
      data,
      count: data.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[CEX-PERPS API] Unexpected error in CEX perpetuals API:', error);
    // Log the full error object for better debugging
    console.error('[CEX-PERPS API] Full error:', JSON.stringify(error, null, 2));
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
