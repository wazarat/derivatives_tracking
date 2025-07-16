import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Define types
interface ProcessedDerivative {
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set cache headers
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Surrogate-Control', 'no-store');
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Enhanced logging for environment variables
  console.log('🔍 [API] Environment check:');
  console.log('🔑 [API] - NEXT_PUBLIC_SUPABASE_URL exists:', !!supabaseUrl);
  console.log('🔑 [API] - SUPABASE_SERVICE_ROLE_KEY exists:', !!supabaseKey);
  
  if (supabaseUrl) {
    console.log('🔍 [API] - URL format check:', supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co') ? '✅ valid' : '❌ invalid');
  }
  
  // Check if Supabase credentials are available
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ [API] Missing required environment variables for Supabase');
    return res.status(503).json({ 
      error: 'Database connection not available',
      message: 'Missing required environment variables. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.',
      debug: {
        urlExists: !!supabaseUrl,
        keyExists: !!supabaseKey,
        environment: process.env.NODE_ENV || 'unknown'
      }
    });
  }
  
  try {
    console.log('🔄 [API] Fetching derivatives data from Supabase...');
    
    // Create Supabase client
    console.log('🔌 [API] Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Log Supabase client details
    console.log('ℹ️ [API] Supabase client details:');
    console.log('🌐 [API] - URL:', supabaseUrl);
    console.log('🔑 [API] - Key:', supabaseKey.substring(0, 10) + '...'); // Mask the key for security
    
    // Get the latest timestamp from the cex_derivatives_instruments table
    console.log('⏰ [API] Fetching latest timestamp...');
    const { data: latestTimestampData, error: latestTimestampError } = await supabase
      .from('cex_derivatives_instruments')
      .select('ts')
      .order('ts', { ascending: false })
      .limit(1);

    if (latestTimestampError) {
      console.error('❌ [API] Error fetching latest timestamp:', latestTimestampError);
      return res.status(500).json({ 
        error: 'Failed to fetch latest timestamp',
        details: latestTimestampError.message,
        code: latestTimestampError.code
      });
    }

    if (!latestTimestampData || latestTimestampData.length === 0) {
      console.log('⚠️ [API] No timestamp data found, returning empty array');
      return res.status(200).json({
        message: 'No data found in cex_derivatives_instruments table',
        data: []
      });
    }

    const latestTimestamp = latestTimestampData[0].ts;
    console.log('⏰ [API] Latest timestamp:', latestTimestamp);

    // Fetch all derivatives data from the latest timestamp
    console.log('🔄 [API] Fetching derivatives data for timestamp:', latestTimestamp);
    const { data, error } = await supabase
      .from('cex_derivatives_instruments')
      .select('*')
      .eq('ts', latestTimestamp);

    if (error) {
      console.error('❌ [API] Error fetching derivatives data:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch derivatives data',
        details: error.message,
        code: error.code
      });
    }

    console.log(`✅ [API] Successfully fetched ${data?.length || 0} derivatives records`);
    
    // Sort by volume_24h (descending) instead of oi_usd since oi_usd values are all 0
    const sortedData = data?.sort((a, b) => b.volume_24h - a.volume_24h) || [];
    
    // Limit to top 100 if needed
    const top100 = sortedData.slice(0, 100);
    
    // Log the first few records for debugging
    if (top100.length > 0) {
      console.log('📊 [API] First record sample:', JSON.stringify(top100[0]));
    }
    
    return res.status(200).json(top100);
  } catch (error) {
    console.error('❌ [API] Unexpected error in API route:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    });
  }
}
