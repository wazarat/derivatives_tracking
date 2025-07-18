const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl ? 'defined' : 'undefined');
console.log('Supabase Key:', supabaseKey ? 'defined' : 'undefined');

if (!supabaseUrl || !supabaseKey) {
  console.log('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCexData() {
  console.log('Checking CEX derivatives data...');
  
  try {
    // First check if table exists and get total count
    const { count: totalCount, error: countError } = await supabase
      .from('cex_derivatives_instruments')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('Error getting total count:', countError);
      return;
    }
    
    console.log('Total records in CEX table:', totalCount);
    
    if (totalCount === 0) {
      console.log('❌ Table is empty! Worker needs to be run.');
      return;
    }
    
    // Get unique exchanges
    const { data: exchanges, error: exchangeError } = await supabase
      .from('cex_derivatives_instruments')
      .select('exchange')
      .limit(1000);
      
    if (exchangeError) {
      console.error('Error fetching exchanges:', exchangeError);
      return;
    }
    
    const uniqueExchanges = [...new Set(exchanges.map(e => e.exchange))];
    console.log('Unique exchanges in CEX table:', uniqueExchanges);
    
    // Get count by exchange
    for (const exchange of uniqueExchanges) {
      const { count, error } = await supabase
        .from('cex_derivatives_instruments')
        .select('*', { count: 'exact', head: true })
        .eq('exchange', exchange);
        
      if (!error) {
        console.log(`${exchange}: ${count} records`);
      }
    }
    
    // Get latest timestamp
    const { data: latest, error: latestError } = await supabase
      .from('cex_derivatives_instruments')
      .select('ts, exchange, symbol')
      .order('ts', { ascending: false })
      .limit(10);
      
    if (!latestError) {
      console.log('Latest records:');
      latest.forEach(record => {
        console.log(`- ${record.exchange}: ${record.symbol} at ${record.ts}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking CEX data:', error);
  }
}

checkCexData().catch(console.error);
