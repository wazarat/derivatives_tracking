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
  // Log request details
  console.log(`🔄 [API] ${req.method} request to ${req.url} at ${new Date().toISOString()}`);
  console.log('🔍 [API] Query parameters:', req.query);
  console.log('🔍 [API] Headers:', {
    'user-agent': req.headers['user-agent'],
    'accept': req.headers['accept'],
    'cache-control': req.headers['cache-control'],
    'x-vercel-deployment-url': req.headers['x-vercel-deployment-url'],
    'x-forwarded-for': req.headers['x-forwarded-for'],
  });
  
  // Set cache headers
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Surrogate-Control', 'no-store');
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    console.error(`❌ [API] Method not allowed: ${req.method}`);
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Get the sector from the query parameters
  const sector = req.query.sector as string | undefined;
  console.log('🔍 [API] Requested sector:', sector || 'none specified');
  
  // Enhanced logging for environment variables
  console.log('🔍 [API] Environment check:');
  console.log('🔑 [API] - NEXT_PUBLIC_SUPABASE_URL exists:', !!supabaseUrl);
  console.log('🔑 [API] - SUPABASE_SERVICE_ROLE_KEY exists:', !!supabaseKey);
  console.log('🔍 [API] - NODE_ENV:', process.env.NODE_ENV);
  console.log('🔍 [API] - VERCEL_ENV:', process.env.VERCEL_ENV);
  
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
        environment: process.env.NODE_ENV || 'unknown',
        timestamp: new Date().toISOString()
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
    let query = supabase
      .from('cex_derivatives_instruments')
      .select('*')
      .eq('ts', latestTimestamp);
    
    // Apply filtering based on sector if provided
    if (sector === 'cex-perps') {
      console.log('🔍 [API] Filtering for perpetual contracts');
      query = query.eq('contract_type', 'perpetual');
    } else if (sector === 'cex-futures') {
      console.log('🔍 [API] Filtering for futures contracts');
      query = query.eq('contract_type', 'futures');
    } else {
      console.log('🔍 [API] No sector filter applied, returning all contract types');
    }
    
    // Execute the query
    console.log('🔄 [API] Executing Supabase query...');
    const { data, error, count } = await query;

    if (error) {
      console.error('❌ [API] Error fetching derivatives data:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch derivatives data',
        details: error.message,
        code: error.code
      });
    }

    // Log data statistics
    console.log(`✅ [API] Successfully fetched ${data?.length || 0} derivatives records`);
    
    if (data && data.length > 0) {
      // Count contract types for debugging
      const contractTypes = Array.from(new Set(data.map(item => item.contract_type)));
      console.log('📊 [API] Contract types in result:', contractTypes);
      
      const contractTypeCounts: Record<string, number> = {};
      contractTypes.forEach(type => {
        contractTypeCounts[type] = data.filter(item => item.contract_type === type).length;
      });
      console.log('📊 [API] Contract type counts:', contractTypeCounts);
      
      // Count exchanges for debugging
      const exchanges = Array.from(new Set(data.map(item => item.exchange)));
      console.log('📊 [API] Exchanges in result:', exchanges);
      
      const exchangeCounts: Record<string, number> = {};
      exchanges.forEach(exchange => {
        exchangeCounts[exchange] = data.filter(item => item.exchange === exchange).length;
      });
      console.log('📊 [API] Exchange counts:', exchangeCounts);
    }
    
    // Sort by volume_24h (descending) instead of oi_usd since oi_usd values are all 0
    console.log('🔄 [API] Sorting data by volume_24h...');
    const sortedData = data?.sort((a, b) => b.volume_24h - a.volume_24h) || [];
    
    // Limit to top 100 if needed
    const top100 = sortedData.slice(0, 100);
    console.log(`📊 [API] Returning top ${top100.length} records by volume`);
    
    // Log the first few records for debugging
    if (top100.length > 0) {
      console.log('📊 [API] First record sample:', JSON.stringify(top100[0]));
      console.log('📊 [API] Last record sample:', JSON.stringify(top100[top100.length - 1]));
    }
    
    // Add metadata to the response
    const responseData = {
      data: top100,
      meta: {
        timestamp: latestTimestamp,
        totalRecords: data?.length || 0,
        returnedRecords: top100.length,
        sector: sector || 'all',
        sortedBy: 'volume_24h',
        requestTime: new Date().toISOString()
      }
    };
    
    console.log('✅ [API] Request completed successfully');
    return res.status(200).json(responseData);
  } catch (error) {
    console.error('❌ [API] Unexpected error in API route:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined,
      timestamp: new Date().toISOString()
    });
  }
}
