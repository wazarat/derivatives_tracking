import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Add debug logging
console.log('API route initialized with:');
console.log('- Supabase URL exists:', !!supabaseUrl);
console.log('- Supabase key exists:', !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = 'force-dynamic'; // No caching
export const revalidate = 0; // Disable cache completely

export async function GET() {
  console.log('GET request received at /api/derivatives/all');
  
  try {
    // Get the latest timestamp from the cex_derivatives_instruments table
    console.log('Fetching latest timestamp...');
    const { data: latestTimestampData, error: latestTimestampError } = await supabase
      .from('cex_derivatives_instruments')
      .select('ts')
      .order('ts', { ascending: false })
      .limit(1);

    if (latestTimestampError) {
      console.error('Error fetching latest timestamp:', latestTimestampError);
      return NextResponse.json(
        { error: 'Failed to fetch latest timestamp' }, 
        { 
          status: 500,
          headers: {
            'Cache-Control': 'no-store, max-age=0',
            'Surrogate-Control': 'no-store',
          }
        }
      );
    }

    if (!latestTimestampData || latestTimestampData.length === 0) {
      console.log('No timestamp data found, returning empty array');
      return NextResponse.json(
        [], 
        { 
          status: 200,
          headers: {
            'Cache-Control': 'no-store, max-age=0',
            'Surrogate-Control': 'no-store',
          }
        }
      );
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
      return NextResponse.json(
        { error: 'Failed to fetch derivatives data' }, 
        { 
          status: 500,
          headers: {
            'Cache-Control': 'no-store, max-age=0',
            'Surrogate-Control': 'no-store',
          }
        }
      );
    }

    console.log(`Successfully fetched ${data?.length || 0} derivatives records`);
    return NextResponse.json(
      data, 
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'Surrogate-Control': 'no-store',
        }
      }
    );
  } catch (error) {
    console.error('Unexpected error in API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'Surrogate-Control': 'no-store',
        }
      }
    );
  }
}
