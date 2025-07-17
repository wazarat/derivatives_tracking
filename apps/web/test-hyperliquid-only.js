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

async function testHyperliquidWithAbortController() {
  console.log('\nTesting Hyperliquid API with AbortController...');
  
  try {
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    console.log('Making request to Hyperliquid API...');
    const res = await fetch('https://api.hyperliquid.xyz/info', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'metaAndAssetCtxs' }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`Hyperliquid API error: ${res.status} ${res.statusText}`);
    }
    
    console.log('Response received, parsing JSON...');
    const data = await res.json();
    
    console.log('Response structure:', {
      isArray: Array.isArray(data),
      length: data?.length,
      firstElementKeys: data?.[0] ? Object.keys(data[0]) : 'N/A'
    });
    
    if (Array.isArray(data) && data.length >= 2) {
      const [meta, ctxs] = data;
      
      console.log('Meta structure:', {
        hasUniverse: !!meta.universe,
        universeLength: meta.universe?.length || 0
      });
      
      console.log('Contexts structure:', {
        isArray: Array.isArray(ctxs),
        length: ctxs?.length || 0
      });
      
      if (meta.universe && Array.isArray(ctxs)) {
        // Process like the worker does
        const processed = meta.universe.slice(0, 5).map((asset, i) => ({
          ts: new Date().toISOString(),
          exchange: 'Hyperliquid',
          symbol: `${asset.name}-USD`,
          contract_type: 'perpetual',
          oi: +(ctxs[i]?.openInterest || 0),
          vol24h: +(ctxs[i]?.dayNtlVlm || 0),
          funding_rate: +(ctxs[i]?.funding || 0),
          price: +(ctxs[i]?.markPx || 0)
        }));
        
        console.log('Sample processed data (first 5):');
        processed.forEach((record, i) => {
          console.log(`${i+1}. ${record.symbol}: vol24h=$${record.vol24h.toLocaleString()}, oi=$${record.oi.toLocaleString()}, price=$${record.price}, funding=${record.funding_rate}`);
        });
        
        // Filter for non-zero values
        const nonZeroData = processed.filter(record => 
          record.oi > 0 || record.vol24h > 0 || record.funding_rate !== 0 || record.price > 0
        );
        
        console.log(`\nFound ${nonZeroData.length} records with non-zero values out of ${processed.length} total`);
        
        if (nonZeroData.length > 0) {
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
        } else {
          console.log('No non-zero data to insert');
        }
        
        return true;
      }
    }
    
    return false;
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Hyperliquid API request timed out after 10 seconds');
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
}

testHyperliquidWithAbortController().then(success => {
  console.log(success ? '\n✅ Test completed successfully' : '\n❌ Test failed');
  process.exit(success ? 0 : 1);
});
