import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('Testing DEX perpetuals API endpoint...');
console.log('Supabase URL exists:', !!supabaseUrl);
console.log('Supabase key exists:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables for Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Test function to verify the dex_derivatives_instruments table has data
 */
async function testDexDerivativesTable() {
  console.log('Testing dex_derivatives_instruments table...');
  
  try {
    // Check if the table exists and has data
    const { data: latestTimestampData, error: latestTimestampError } = await supabase
      .from('dex_derivatives_instruments')
      .select('ts')
      .order('ts', { ascending: false })
      .limit(1);
    
    if (latestTimestampError) {
      console.error('Error fetching latest timestamp:', latestTimestampError);
      return false;
    }
    
    if (!latestTimestampData || latestTimestampData.length === 0) {
      console.log('No data found in dex_derivatives_instruments table');
      return false;
    }
    
    const latestTimestamp = latestTimestampData[0].ts;
    console.log('Latest timestamp for DEX derivatives:', latestTimestamp);
    
    // Fetch a sample of data from the latest timestamp
    const { data, error } = await supabase
      .from('dex_derivatives_instruments')
      .select('*')
      .eq('ts', latestTimestamp)
      .limit(5);
    
    if (error) {
      console.error('Error fetching DEX derivatives data:', error);
      return false;
    }
    
    console.log(`Found ${data.length} records for timestamp ${latestTimestamp}`);
    console.log('Sample data:');
    console.log(JSON.stringify(data, null, 2));
    
    return data.length > 0;
  } catch (error) {
    console.error('Unexpected error testing DEX derivatives table:', error);
    return false;
  }
}

// Run the test
testDexDerivativesTable()
  .then(hasData => {
    console.log(`\nTest result: ${hasData ? 'PASS' : 'FAIL'} - Table ${hasData ? 'has' : 'does not have'} data`);
    
    if (!hasData) {
      console.log('\nCannot test API endpoint because the dex_derivatives_instruments table has no data');
      console.log('Please run the DEX derivatives worker to populate the table first:');
      console.log('npx ts-node apps/api/app/workers/dexDerivativesWorker.ts');
      process.exit(1);
    }
    
    console.log('\nTest completed successfully!');
    console.log('\nTo test the API endpoint in a browser, start your Next.js server and navigate to:');
    console.log('http://localhost:3000/api/crypto/dex-perps');
    console.log('\nOr use curl:');
    console.log('curl http://localhost:3000/api/crypto/dex-perps');
  })
  .catch(error => {
    console.error('Test failed with error:', error);
    process.exit(1);
  });
