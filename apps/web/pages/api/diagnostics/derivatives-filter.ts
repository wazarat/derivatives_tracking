import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

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
    return res.status(503).json({ 
      error: 'Database connection not available',
      message: 'Missing required environment variables. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.',
      environmentCheck: {
        NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
        SUPABASE_SERVICE_ROLE_KEY: !!supabaseKey
      }
    });
  }

  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get the latest timestamp from the cex_derivatives_instruments table
    const { data: latestTimestampData, error: latestTimestampError } = await supabase
      .from('cex_derivatives_instruments')
      .select('ts')
      .order('ts', { ascending: false })
      .limit(1);

    if (latestTimestampError) {
      return res.status(500).json({ 
        error: 'Failed to fetch latest timestamp',
        details: latestTimestampError.message
      });
    }

    if (!latestTimestampData || latestTimestampData.length === 0) {
      return res.status(200).json({
        message: 'No data found in cex_derivatives_instruments table',
        data: []
      });
    }

    const latestTimestamp = latestTimestampData[0].ts;

    // Get contract type counts
    const { data: contractTypeData, error: contractTypeError } = await supabase
      .from('cex_derivatives_instruments')
      .select('contract_type')
      .eq('ts', latestTimestamp);

    if (contractTypeError) {
      return res.status(500).json({ 
        error: 'Failed to fetch contract types',
        details: contractTypeError.message
      });
    }

    // Count occurrences of each contract type
    const contractTypeCounts: Record<string, number> = {};
    contractTypeData.forEach(item => {
      const type = item.contract_type || 'undefined';
      contractTypeCounts[type] = (contractTypeCounts[type] || 0) + 1;
    });

    // Get exchange counts
    const { data: exchangeData, error: exchangeError } = await supabase
      .from('cex_derivatives_instruments')
      .select('exchange')
      .eq('ts', latestTimestamp);

    if (exchangeError) {
      return res.status(500).json({ 
        error: 'Failed to fetch exchanges',
        details: exchangeError.message
      });
    }

    // Count occurrences of each exchange
    const exchangeCounts: Record<string, number> = {};
    exchangeData.forEach(item => {
      const exchange = item.exchange || 'undefined';
      exchangeCounts[exchange] = (exchangeCounts[exchange] || 0) + 1;
    });

    // Get sample data for each contract type
    const contractTypes = Object.keys(contractTypeCounts);
    const sampleData: Record<string, any> = {};
    
    for (const type of contractTypes) {
      const { data: sample } = await supabase
        .from('cex_derivatives_instruments')
        .select('*')
        .eq('ts', latestTimestamp)
        .eq('contract_type', type)
        .limit(1);
      
      if (sample && sample.length > 0) {
        sampleData[type] = sample[0];
      }
    }

    // Return diagnostic information
    return res.status(200).json({
      timestamp: latestTimestamp,
      totalRecords: contractTypeData.length,
      contractTypeCounts,
      exchangeCounts,
      sampleData,
      filteringTest: {
        perpetualFilter: contractTypeCounts['perpetual'] ? 'available' : 'missing',
        futuresFilter: contractTypeCounts['futures'] ? 'available' : 'missing',
        otherTypes: Object.keys(contractTypeCounts).filter(type => !['perpetual', 'futures'].includes(type))
      }
    });
  } catch (error) {
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
