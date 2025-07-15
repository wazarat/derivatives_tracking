import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = 'force-dynamic'; // No caching

export async function GET() {
  try {
    // Get the latest timestamp from the cex_derivatives_instruments table
    const { data: latestTimestampData, error: latestTimestampError } = await supabase
      .from('cex_derivatives_instruments')
      .select('ts')
      .order('ts', { ascending: false })
      .limit(1);

    if (latestTimestampError) {
      console.error('Error fetching latest timestamp:', latestTimestampError);
      return NextResponse.json({ error: 'Failed to fetch latest timestamp' }, { status: 500 });
    }

    if (!latestTimestampData || latestTimestampData.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const latestTimestamp = latestTimestampData[0].ts;

    // Fetch all derivatives data from the latest timestamp
    const { data, error } = await supabase
      .from('cex_derivatives_instruments')
      .select('*')
      .eq('ts', latestTimestamp);

    if (error) {
      console.error('Error fetching derivatives data:', error);
      return NextResponse.json({ error: 'Failed to fetch derivatives data' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
