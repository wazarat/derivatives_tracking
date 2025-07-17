const fetch = require('node-fetch');

async function testHyperliquid() {
  console.log('Testing Hyperliquid API...');
  try {
    const res = await fetch('https://api.hyperliquid.xyz/info', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'metaAndAssetCtxs' }),
      timeout: 10000
    });
    
    if (!res.ok) {
      throw new Error(`Hyperliquid API error: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('Hyperliquid response structure:', {
      isArray: Array.isArray(data),
      length: data?.length,
      firstElementKeys: data?.[0] ? Object.keys(data[0]) : 'N/A',
      secondElementLength: data?.[1]?.length || 'N/A'
    });
    
    if (Array.isArray(data) && data.length >= 2) {
      const [meta, ctxs] = data;
      console.log('Sample universe items:', meta.universe?.slice(0, 3));
      console.log('Sample context items:', ctxs?.slice(0, 3));
      
      // Process like the worker does
      const processed = meta.universe?.slice(0, 3).map((asset, i) => ({
        symbol: `${asset.name}-USD`,
        oi: +ctxs[i]?.openInterest || 0,
        vol24h: +ctxs[i]?.dayNtlVlm || 0,
        funding_rate: +ctxs[i]?.funding || 0,
        price: +ctxs[i]?.markPx || 0
      }));
      
      console.log('Processed Hyperliquid data:', processed);
    }
    
    return true;
  } catch (error) {
    console.error('Hyperliquid API error:', error.message);
    return false;
  }
}

async function testDyDx() {
  console.log('\nTesting dYdX API...');
  try {
    const res = await fetch('https://indexer.dydx.trade/v4/perpetualMarkets', {
      timeout: 10000
    });
    
    if (!res.ok) {
      throw new Error(`dYdX API error: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('dYdX response structure:', {
      hasMarkets: !!data.markets,
      marketsCount: data.markets ? Object.keys(data.markets).length : 'N/A',
      isDirectObject: !data.markets && typeof data === 'object'
    });
    
    const markets = data.markets || data;
    const marketEntries = Object.entries(markets).slice(0, 3);
    
    console.log('Sample market keys:', marketEntries.map(([key]) => key));
    
    // Process like the worker does
    const processed = marketEntries.map(([key, m]) => ({
      symbol: m.ticker,
      oi: +m.openInterestUsd || 0,
      vol24h: +m.volume24hUsd || 0,
      funding_rate: +m.currentFundingRate || 0,
      price: +m.indexPrice || 0
    }));
    
    console.log('Processed dYdX data:', processed);
    
    return true;
  } catch (error) {
    console.error('dYdX API error:', error.message);
    return false;
  }
}

async function main() {
  console.log('=== DEX API Debug Test ===\n');
  
  const hyperliquidOk = await testHyperliquid();
  const dydxOk = await testDyDx();
  
  console.log('\n=== Summary ===');
  console.log('Hyperliquid API:', hyperliquidOk ? '✅ Working' : '❌ Failed');
  console.log('dYdX API:', dydxOk ? '✅ Working' : '❌ Failed');
  
  if (hyperliquidOk && dydxOk) {
    console.log('\nBoth APIs are working. The issue might be in the worker implementation.');
  } else {
    console.log('\nOne or both APIs are failing. This explains the zero values in the database.');
  }
}

main().catch(console.error);
