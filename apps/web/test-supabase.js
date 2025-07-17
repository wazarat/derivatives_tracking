// Simple script to test Supabase connection
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Log environment variables (redacted for security)
console.log('NEXT_PUBLIC_SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

// Initialize Supabase client
try {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  console.log('Supabase client initialized successfully');

  // Test connection by fetching the latest timestamp
  async function testConnection() {
    try {
      console.log('Testing connection to dex_derivatives_instruments table...');
      const { data, error } = await supabase
        .from('dex_derivatives_instruments')
        .select('ts')
        .order('ts', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching from Supabase:', error);
      } else {
        console.log('Connection successful!');
        console.log('Latest timestamp:', data && data.length > 0 ? data[0].ts : 'No data found');
        
        // Try to fetch a few records
        const { data: records, error: recordsError } = await supabase
          .from('dex_derivatives_instruments')
          .select('*')
          .limit(3);
          
        if (recordsError) {
          console.error('Error fetching records:', recordsError);
        } else {
          console.log('Sample records:', records);
        }
      }
    } catch (err) {
      console.error('Unexpected error during test:', err);
    }
  }

  testConnection();
} catch (error) {
  console.error('Error initializing Supabase client:', error);
}
