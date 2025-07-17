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

    // Get the latest timestamp
    console.log('[DEX-PERPS API] Fetching latest timestamp from dex_derivatives_instruments table');
    const { data: latestTimestamp, error: timestampError } = await supabase
      .from('dex_derivatives_instruments')
      .select('ts')
      .order('ts', { ascending: false })
      .limit(1);

    if (timestampError) {
      console.error('[DEX-PERPS API] Error fetching latest timestamp:', timestampError);
      return res.status(500).json({ 
        error: 'Database error when fetching timestamp', 
        details: timestampError 
      });
    }

    if (!latestTimestamp || latestTimestamp.length === 0) {
      console.warn('[DEX-PERPS API] No data found in dex_derivatives_instruments table');
      return res.status(404).json({ error: 'No DEX derivatives data found' });
    }

    const latestTs = latestTimestamp[0].ts;
    console.log(`[DEX-PERPS API] Latest timestamp: ${latestTs}`);

    // Fetch all records from the latest timestamp
    console.log('[DEX-PERPS API] Fetching records for latest timestamp');
    const { data, error } = await supabase
      .from('dex_derivatives_instruments')
      .select('*')
      .eq('ts', latestTs)
      .order('vol24h', { ascending: false })
      .limit(100);

    if (error) {
      console.error('[DEX-PERPS API] Error fetching DEX derivatives data:', error);
      return res.status(500).json({ 
        error: 'Database error when fetching records', 
        details: error 
      });
    }

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
