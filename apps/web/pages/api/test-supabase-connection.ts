import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('[SUPABASE-TEST] Testing Supabase connection');
  
  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        error: 'Missing environment variables',
        supabaseUrl: !!supabaseUrl,
        supabaseKey: !!supabaseKey
      });
    }
    
    console.log('[SUPABASE-TEST] Environment variables found');
    console.log('[SUPABASE-TEST] Supabase URL:', supabaseUrl);
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[SUPABASE-TEST] Supabase client created');
    
    // Test simple query - just check if we can connect
    console.log('[SUPABASE-TEST] Attempting to query Supabase...');
    const { data, error } = await supabase
      .from('dex_derivatives_instruments')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.error('[SUPABASE-TEST] Supabase query error:', error);
      return res.status(500).json({
        error: 'Supabase query failed',
        details: error,
        message: error.message,
        code: error.code
      });
    }
    
    console.log('[SUPABASE-TEST] Supabase query successful');
    
    return res.status(200).json({
      success: true,
      message: 'Supabase connection successful',
      timestamp: new Date().toISOString(),
      supabaseUrl: supabaseUrl,
      count: data
    });
    
  } catch (error: any) {
    console.error('[SUPABASE-TEST] Unexpected error:', error);
    return res.status(500).json({
      error: 'Unexpected error',
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  }
}
