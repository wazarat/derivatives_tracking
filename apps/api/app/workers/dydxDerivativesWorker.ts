import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { createRetryableWorker } from './rest_worker';
import fetch from 'node-fetch';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// dYdX v4 API endpoints
const DYDX_API = 'https://indexer.v4.dydx.exchange/v4';

/**
 * Fetch all perpetual contracts from dYdX v4
 */
async function fetchDydxPerpetuals() {
  console.log('Fetching dYdX v4 perpetuals data...');
  
  try {
    // Get all markets
    const marketsResponse = await fetch(`${DYDX_API}/perpetualMarkets`);
    
    if (!marketsResponse.ok) {
      throw new Error(`dYdX API error: ${marketsResponse.status} ${marketsResponse.statusText}`);
    }
    
    const marketsData = await marketsResponse.json() as { markets: Record<string, any> };
    
    // Process the data
    const contracts = Object.values(marketsData.markets).map((market: any) => {
      const symbol = market.ticker;
      const indexPrice = parseFloat(market.oraclePrice || 0);
      const openInterestUsd = parseFloat(market.openInterest || 0) * indexPrice;
      const fundingRate = parseFloat(market.nextFundingRate || 0);
      
      return {
        exchange: 'dYdX v4',
        symbol: symbol,
        contract_type: 'perpetual',
        oi_usd: openInterestUsd,
        funding_rate: fundingRate,
        volume_24h: parseFloat(market.volume24H || 0),
        index_price: indexPrice,
      };
    });
    
    return contracts;
  } catch (error) {
    console.error('Error fetching dYdX data:', error);
    throw error;
  }
}

/**
 * Main worker function to fetch and store dYdX derivatives data
 */
export async function run() {
  console.log('Starting dYdX derivatives worker...');
  
  try {
    // Fetch dYdX perpetuals data
    const contracts = await fetchDydxPerpetuals();
    
    // Add timestamp
    const rows = contracts.map(r => ({ ...r, ts: new Date() }));
    
    // Insert data into Supabase
    const { error } = await supabase
      .from('derivatives_snapshots')
      .insert(rows);
    
    if (error) {
      throw error;
    }
    
    console.log(`dYdX worker wrote ${rows.length} rows`);
    return rows.length;
  } catch (error) {
    console.error('Error in dYdX derivatives worker:', error);
    throw error;
  }
}

// Create a retryable version of the worker
const retryableWorker = createRetryableWorker(run);

// Run the worker if this file is executed directly
if (require.main === module) {
  retryableWorker()
    .then(() => {
      console.log('dYdX derivatives worker completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('dYdX derivatives worker failed:', error);
      process.exit(1);
    });
}
