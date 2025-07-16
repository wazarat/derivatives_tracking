import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'; // No caching
export const revalidate = 0; // Disable cache completely

export async function GET() {
  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  
  // Check if environment variables exist
  const urlExists = !!supabaseUrl;
  const keyExists = !!supabaseKey;
  
  // Only create client if both URL and key exist
  let connectionTest = 'not_attempted';
  let tableExists = false;
  let recordCount = 0;
  
  if (urlExists && keyExists) {
    try {
      // Create Supabase client
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Test connection by checking if table exists
      const { data, error } = await supabase
        .from('cex_derivatives_instruments')
        .select('count')
        .limit(1);
      
      if (error) {
        connectionTest = 'failed';
        console.error('Supabase connection test failed:', error);
      } else {
        connectionTest = 'success';
        tableExists = true;
        
        // Get record count
        const { count, error: countError } = await supabase
          .from('cex_derivatives_instruments')
          .select('*', { count: 'exact', head: true });
        
        if (!countError) {
          recordCount = count || 0;
        }
      }
    } catch (error) {
      connectionTest = 'error';
      console.error('Error testing Supabase connection:', error);
    }
  }
  
  // Return diagnostic information without exposing sensitive values
  return NextResponse.json({
    environment: process.env.NODE_ENV || 'unknown',
    supabase: {
      urlExists,
      keyExists,
      urlFormat: urlExists ? (supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co') ? 'valid' : 'invalid') : 'missing',
      connectionTest,
      tableExists,
      recordCount
    }
  });
}
