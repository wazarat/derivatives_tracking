import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { createRetryableWorker } from './rest_worker';
import fetch from 'node-fetch';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Check required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error(`
ERROR: Missing required environment variables: ${missingEnvVars.join(', ')}

Please set these variables in your .env file or directly in your shell:

# In .env file:
${missingEnvVars.map(varName => `${varName}=your-value-here`).join('\n')}

# Or in your shell:
${missingEnvVars.map(varName => `export ${varName}=your-value-here`).join('\n')}
`);
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// API endpoints
const HYPERLIQUID_API = 'https://api.hyperliquid.xyz';
const DYDX_API = 'https://indexer.dydx.trade/v4';

/**
 * Fetch all perpetual contracts from Hyperliquid
 */
async function fetchHyperliquid() {
  console.log('Fetching Hyperliquid perpetuals data...');
  
  try {
    const res = await fetch(`${HYPERLIQUID_API}/info`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'metaAndAssetCtxs' })
    });
    
    if (!res.ok) {
      throw new Error(`Hyperliquid API error: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json() as [any, any[]];
    const [meta, ctxs] = data;
    
    return meta.universe.map((asset: any, i: number) => ({
      ts: new Date().toISOString(),
      exchange: 'Hyperliquid',
      symbol: `${asset.name}-USD`,
      contract_type: 'perpetual',
      oi: +ctxs[i].openInterest,
      vol24h: +ctxs[i].dayNtlVlm,
      funding_rate: +ctxs[i].funding,
      price: +ctxs[i].markPx
    }));
  } catch (error) {
    console.error('Error fetching Hyperliquid data:', error);
    throw error;
  }
}

/**
 * Fetch all perpetual contracts from dYdX v4
 */
async function fetchDyDx() {
  console.log('Fetching dYdX perpetuals data...');
  
  try {
    const res = await fetch(`${DYDX_API}/perpetualMarkets`);
    
    if (!res.ok) {
      throw new Error(`dYdX API error: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json() as { markets?: Record<string, any> };
    
    // Check if the response has markets property
    const markets = data.markets || data as Record<string, any>;
    
    return Object.values(markets).map((m: any) => ({
      ts: new Date().toISOString(),
      exchange: 'dYdX',
      symbol: m.ticker,                // e.g. 'ETH-USD'
      contract_type: 'perpetual',
      oi: +m.openInterestUsd || 0,
      vol24h: +m.volume24hUsd || 0,
      funding_rate: +m.currentFundingRate || 0,
      price: +m.indexPrice || 0
    }));
  } catch (error) {
    console.error('Error fetching dYdX data:', error);
    throw error;
  }
}

/**
 * Main worker function to fetch and store DEX derivatives data
 */
export async function run() {
  console.log('Starting DEX derivatives worker...');
  
  try {
    // Fetch data from both exchanges
    const [hyperliquidData, dydxData] = await Promise.all([
      fetchHyperliquid(),
      fetchDyDx()
    ]);
    
    // Combine data from both exchanges
    const allData = [...hyperliquidData, ...dydxData];
    
    console.log(`Fetched ${hyperliquidData.length} Hyperliquid contracts and ${dydxData.length} dYdX contracts`);
    
    // Log first 3 symbols from each exchange for debugging
    console.log('Sample Hyperliquid symbols:', hyperliquidData.slice(0, 3).map((item: any) => item.symbol));
    console.log('Sample dYdX symbols:', dydxData.slice(0, 3).map((item: any) => item.symbol));
    
    if (allData.length === 0) {
      console.warn('No data fetched from either exchange');
      return 0;
    }
    
    // Deduplicate data based on exchange and symbol to avoid upsert conflicts
    const uniqueData = Array.from(
      new Map(allData.map((item: { exchange: string, symbol: string, [key: string]: any }) => 
        [`${item.exchange}-${item.symbol}`, item])
      ).values()
    );
    
    try {
      console.log(`Attempting to upsert ${uniqueData.length} rows to dex_derivatives_instruments table`);
      
      // Skip table check and directly attempt upsert
      console.log('Proceeding with direct upsert');
      
      // Log a few sample records for debugging
      console.log('Sample records to be upserted:');
      console.log(JSON.stringify(uniqueData.slice(0, 3), null, 2));
      
      const { error, count, data } = await supabase
        .from('dex_derivatives_instruments')
        .upsert(uniqueData, { 
          onConflict: 'exchange,symbol,ts',
          ignoreDuplicates: false
        })
        .select();
      
      if (error) {
        console.error('Error upserting data to Supabase:', error);
        // Log more details about the error
        console.error('Error details:', JSON.stringify(error));
        throw new Error(`Upsert failed: ${JSON.stringify(error)}`);
      }
      
      console.log(`DEX derivatives worker wrote ${count} rows`);
      
      // Check if data was returned and log some results
      if (data && data.length > 0) {
        console.log(`Sample of upserted data (first 3 rows):`);
        console.log(JSON.stringify(data.slice(0, 3), null, 2));
      } else {
        console.log('No data returned from upsert operation');
        
        // Let's query the table to see if our data exists
        console.log('Querying table to verify data...');
        const { data: existingData, error: queryError } = await supabase
          .from('dex_derivatives_instruments')
          .select('*')
          .limit(5);
          
        if (queryError) {
          console.error('Error querying data:', queryError);
        } else if (existingData && existingData.length > 0) {
          console.log(`Found ${existingData.length} existing records in table:`);
          console.log(JSON.stringify(existingData, null, 2));
        } else {
          console.log('No existing data found in table');
        }
      }
      
      return count;
    } catch (error) {
      console.error('Error in Supabase operation:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in DEX derivatives worker:', error);
    // Log the full error object for better debugging
    console.error('Full error:', JSON.stringify(error, null, 2));
    throw error;
  }
}

// Create a retryable version of the worker
const retryableWorker = createRetryableWorker(run);

// Run the worker if this file is executed directly
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const debug = args.includes('--debug');
  
  if (debug) {
    console.log('Debug mode enabled - showing additional information');
  }
  
  if (dryRun) {
    console.log('Dry run mode - will fetch data but not write to Supabase');
    
    Promise.all([fetchHyperliquid(), fetchDyDx()])
      .then(([hyperliquidData, dydxData]) => {
        console.log(`Fetched ${hyperliquidData.length} Hyperliquid contracts and ${dydxData.length} dYdX contracts`);
        console.log('Sample Hyperliquid data:', hyperliquidData.slice(0, 2));
        console.log('Sample dYdX data:', dydxData.slice(0, 2));
        process.exit(0);
      })
      .catch(error => {
        console.error('Error in dry run:', error);
        process.exit(1);
      });
  } else {
    retryableWorker()
      .then(() => {
        console.log('DEX derivatives worker completed successfully');
        process.exit(0);
      })
      .catch((error) => {
        console.error('DEX derivatives worker failed:', error);
        process.exit(1);
      });
  }
}
