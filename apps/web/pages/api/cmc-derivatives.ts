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
  
  // Check if Supabase credentials are available
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing required environment variables for Supabase');
    return res.status(503).json({ 
      error: 'Database connection not available',
      message: 'Missing required environment variables. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    });
  }
  
  try {
    console.log('Fetching derivatives data from Supabase...');
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get the latest timestamp from the cex_derivatives_instruments table
    console.log('Fetching latest timestamp...');
    const { data: latestTimestampData, error: latestTimestampError } = await supabase
      .from('cex_derivatives_instruments')
      .select('ts')
      .order('ts', { ascending: false })
      .limit(1);

    if (latestTimestampError) {
      console.error('Error fetching latest timestamp:', latestTimestampError);
      return res.status(500).json({ error: 'Failed to fetch latest timestamp' });
    }

    if (!latestTimestampData || latestTimestampData.length === 0) {
      console.log('No timestamp data found, returning empty array');
      return res.status(200).json([]);
    }

    const latestTimestamp = latestTimestampData[0].ts;
    console.log('Latest timestamp:', latestTimestamp);

    // Fetch all derivatives data from the latest timestamp
    console.log('Fetching derivatives data for timestamp:', latestTimestamp);
    const { data, error } = await supabase
      .from('cex_derivatives_instruments')
      .select('*')
      .eq('ts', latestTimestamp);

    if (error) {
      console.error('Error fetching derivatives data:', error);
      return res.status(500).json({ error: 'Failed to fetch derivatives data' });
    }

    console.log(`Successfully fetched ${data?.length || 0} derivatives records`);
    
    // Sort by open interest (descending)
    const sortedData = data?.sort((a, b) => b.oi_usd - a.oi_usd) || [];
    
    // Limit to top 100 if needed
    const top100 = sortedData.slice(0, 100);
    
    return res.status(200).json(top100);
  } catch (error) {
    console.error('Unexpected error in API route:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
