import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

// Add debug logging for environment variables
console.log('[DEX-PERPS API] Initializing with env vars:');
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
    console.log('[DEX-PERPS API] Supabase client initialized successfully');
  } else {
    console.error('[DEX-PERPS API] Missing Supabase environment variables');
  }
} catch (error) {
  console.error('[DEX-PERPS API] Error initializing Supabase client:', error);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('[DEX-PERPS API] Fetching DEX perpetuals data');
  console.log('[DEX-PERPS API] Environment check:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('- SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  try {
    // Check if Supabase client is initialized
    if (!supabase) {
      console.error('[DEX-PERPS API] Supabase client not initialized');
      console.error('[DEX-PERPS API] Environment variables:');
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

    // Get recent timestamps (last 1 hour) to aggregate data from multiple sources
    console.log('[DEX-PERPS API] Fetching recent timestamps from dex_derivatives_instruments table');
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: recentTimestamps, error: timestampError } = await supabase
      .from('dex_derivatives_instruments')
      .select('ts')
      .gte('ts', oneHourAgo)
      .order('ts', { ascending: false })
      .limit(10);

    if (timestampError) {
      console.error('[DEX-PERPS API] Error fetching recent timestamps:', timestampError);
      return res.status(500).json({ 
        error: 'Database error when fetching timestamps', 
        details: timestampError 
      });
    }

    if (!recentTimestamps || recentTimestamps.length === 0) {
      console.warn('[DEX-PERPS API] No data found in dex_derivatives_instruments table');
      return res.status(404).json({ error: 'No DEX derivatives data found' });
    }

    const timestamps = recentTimestamps.map(t => t.ts);
    console.log(`[DEX-PERPS API] Found ${timestamps.length} recent timestamps`);

    // Fetch all records from recent timestamps
    console.log('[DEX-PERPS API] Fetching records from recent timestamps');
    const { data: allData, error } = await supabase
      .from('dex_derivatives_instruments')
      .select('*')
      .in('ts', timestamps)
      .order('vol24h', { ascending: false })
      .limit(500);

    if (error) {
      console.error('[DEX-PERPS API] Error fetching DEX derivatives data:', error);
      return res.status(500).json({ 
        error: 'Database error when fetching records', 
        details: error 
      });
    }

    console.log(`[DEX-PERPS API] Fetched ${allData?.length || 0} total records from recent timestamps`);
    
    // Debug: Log sample records to understand data structure
    if (allData && allData.length > 0) {
      console.log('[DEX-PERPS API] Sample records from database:');
      allData.slice(0, 3).forEach((record, i) => {
        console.log(`${i+1}. symbol: ${record.symbol}, oi: ${record.oi}, vol24h: ${record.vol24h}, funding_rate: ${record.funding_rate}, price: ${record.price}`);
      });
    }
    
    // Filter for non-zero values and deduplicate by symbol (keep highest volume)
    const symbolMap = new Map();
    const nonZeroData = (allData || []).filter(record => {
      const hasNonZeroValues = record.oi > 0 || record.vol24h > 0 || record.funding_rate !== 0 || record.price > 0;
      if (!hasNonZeroValues) {
        console.log(`[DEX-PERPS API] Filtering out zero-value record: ${record.symbol} (oi: ${record.oi}, vol24h: ${record.vol24h}, funding_rate: ${record.funding_rate}, price: ${record.price})`);
      }
      return hasNonZeroValues;
    });
    
    console.log(`[DEX-PERPS API] Found ${nonZeroData.length} records with non-zero values`);
    
    // Deduplicate by symbol, keeping the record with highest volume
    nonZeroData.forEach(record => {
      const existing = symbolMap.get(record.symbol);
      if (!existing || record.vol24h > existing.vol24h) {
        symbolMap.set(record.symbol, record);
      }
    });
    
    const data = Array.from(symbolMap.values())
      .sort((a, b) => b.vol24h - a.vol24h)
      .slice(0, 100);
      
    console.log(`[DEX-PERPS API] Final deduplicated data: ${data.length} records`);

    console.log(`[DEX-PERPS API] Successfully fetched ${data?.length || 0} records`);
    
    // Ensure we always return the expected structure
    if (!data) {
      console.warn('[DEX-PERPS API] No data returned from Supabase query');
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
    console.error('[DEX-PERPS API] Unexpected error in DEX perpetuals API:', error);
    // Log the full error object for better debugging
    console.error('[DEX-PERPS API] Full error:', JSON.stringify(error, null, 2));
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
