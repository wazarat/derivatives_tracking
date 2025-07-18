const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTimestamps() {
  console.log('Checking timestamp distribution by exchange...');
  
  try {
    // Get latest timestamps for each exchange
    const { data: latestByExchange, error } = await supabase
      .from('cex_derivatives_instruments')
      .select('exchange, ts')
      .order('ts', { ascending: false })
      .limit(100);
      
    if (error) {
      console.error('Error fetching data:', error);
      return;
    }
    
    // Group by exchange and find latest timestamp for each
    const exchangeTimestamps = {};
    latestByExchange.forEach(record => {
      if (!exchangeTimestamps[record.exchange] || record.ts > exchangeTimestamps[record.exchange]) {
        exchangeTimestamps[record.exchange] = record.ts;
      }
    });
    
    console.log('Latest timestamp by exchange:');
    Object.entries(exchangeTimestamps).forEach(([exchange, timestamp]) => {
      const timeDiff = Date.now() - new Date(timestamp).getTime();
      const hoursAgo = Math.round(timeDiff / (1000 * 60 * 60));
      console.log(`- ${exchange}: ${timestamp} (${hoursAgo} hours ago)`);
    });
    
    // Check data within last 24 hours by exchange
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    console.log(`\nChecking data within last 24 hours (since ${oneDayAgo}):`);
    
    for (const exchange of ['binance', 'bybit']) {
      const { count, error: countError } = await supabase
        .from('cex_derivatives_instruments')
        .select('*', { count: 'exact', head: true })
        .eq('exchange', exchange)
        .gte('ts', oneDayAgo);
        
      if (!countError) {
        console.log(`- ${exchange}: ${count} records in last 24 hours`);
      }
    }
    
  } catch (error) {
    console.error('Error checking timestamps:', error);
  }
}

checkTimestamps().catch(console.error);
