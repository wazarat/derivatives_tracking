const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDexTable() {
  console.log('Testing dex_derivatives_instruments table...');
  
  try {
    // Try to query the table
    const { data, error } = await supabase
      .from('dex_derivatives_instruments')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Table does not exist or query failed:', error);
      return false;
    }
    
    console.log('Table exists! Row count:', data?.length || 0);
    if (data && data.length > 0) {
      console.log('Sample data:', data[0]);
    }
    return true;
  } catch (error) {
    console.error('Error testing table:', error);
    return false;
  }
}

testDexTable().then(exists => {
  if (exists) {
    console.log('✅ dex_derivatives_instruments table exists and is accessible');
  } else {
    console.log('❌ dex_derivatives_instruments table does not exist - need to create it');
  }
  process.exit(0);
});
