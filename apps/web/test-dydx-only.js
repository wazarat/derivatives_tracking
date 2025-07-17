const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });

console.log('Environment check:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDyDxOnly() {
  console.log('Testing dYdX API and database insertion...');
  
  try {
    // Fetch dYdX data
    console.log('Fetching dYdX data...');
    const res = await fetch('https://indexer.dydx.trade/v4/perpetualMarkets');
    
    if (!res.ok) {
      throw new Error(`dYdX API error: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    const markets = data.markets || data;
    
    // Process the data
    const processedData = Object.values(markets).map((m) => ({
      ts: new Date().toISOString(),
      exchange: 'dYdX',
      symbol: m.ticker,
      contract_type: 'perpetual',
      oi: +(m.openInterestUsd || 0),
      vol24h: +(m.volume24hUsd || 0),
      funding_rate: +(m.currentFundingRate || 0),
      price: +(m.indexPrice || 0)
    }));
    
    console.log(`Processed ${processedData.length} dYdX contracts`);
    
    // Filter for non-zero values
    const nonZeroData = processedData.filter(record => 
      record.oi > 0 || record.vol24h > 0 || record.funding_rate !== 0 || record.price > 0
    );
    
    console.log(`Found ${nonZeroData.length} records with non-zero values`);
    
    // Show top 5 by volume
    const topByVolume = nonZeroData
      .sort((a, b) => b.vol24h - a.vol24h)
      .slice(0, 5);
      
    console.log('Top 5 by volume:');
    topByVolume.forEach((record, i) => {
      console.log(`${i+1}. ${record.symbol}: vol24h=$${record.vol24h.toLocaleString()}, oi=$${record.oi.toLocaleString()}, price=$${record.price}`);
    });
    
    // Insert into Supabase
    console.log('Inserting into Supabase...');
    const { error, count } = await supabase
      .from('dex_derivatives_instruments')
      .upsert(nonZeroData, { 
        onConflict: 'exchange,symbol,ts',
        ignoreDuplicates: false
      });
    
    if (error) {
      console.error('Supabase error:', error);
      return false;
    }
    
    console.log(`Successfully inserted ${count} records into Supabase`);
    return true;
    
  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
}

testDyDxOnly().then(success => {
  console.log(success ? '✅ Test completed successfully' : '❌ Test failed');
  process.exit(success ? 0 : 1);
});
