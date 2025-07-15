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

// Hyperliquid API endpoints
const HYPERLIQUID_API = 'https://api.hyperliquid.xyz';

/**
 * Fetch all perpetual contracts from Hyperliquid
 */
async function fetchHyperliquidPerpetuals() {
  console.log('Fetching Hyperliquid perpetuals data...');
  
  try {
    // Get all markets
    const marketsResponse = await fetch(`${HYPERLIQUID_API}/info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'allMids' }),
    });
    
    if (!marketsResponse.ok) {
      throw new Error(`Hyperliquid API error: ${marketsResponse.status} ${marketsResponse.statusText}`);
    }
    
    const marketsData = await marketsResponse.json() as { mids: number[] };
    
    // Get open interest and funding rates
    const statsResponse = await fetch(`${HYPERLIQUID_API}/info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'metaAndAssetCtxs' }),
    });
    
    if (!statsResponse.ok) {
      throw new Error(`Hyperliquid API error: ${statsResponse.status} ${statsResponse.statusText}`);
    }
    
    const statsData = await statsResponse.json() as { 
      assetCtxs: Array<{
        name: string;
        openInterest: string;
        funding: { fundingRate: string };
        dayNtlVlm: string;
      }> 
    };
    
    // Process and combine the data
    const contracts = statsData.assetCtxs.map((asset, index) => {
      const symbol = asset.name;
      const indexPrice = marketsData.mids[index] || 0;
      const openInterestUsd = parseFloat(String(asset.openInterest || 0)) * indexPrice;
      const fundingRate = parseFloat(String(asset.funding.fundingRate || 0)) / 1000000; // Convert to percentage
      
      return {
        exchange: 'Hyperliquid',
        symbol: `${symbol}-PERP`,
        contract_type: 'perpetual',
        oi_usd: openInterestUsd,
        funding_rate: fundingRate,
        volume_24h: parseFloat(String(asset.dayNtlVlm || 0)),
        index_price: indexPrice,
      };
    });
    
    return contracts;
  } catch (error) {
    console.error('Error fetching Hyperliquid data:', error);
    throw error;
  }
}

/**
 * Main worker function to fetch and store Hyperliquid derivatives data
 */
export async function run() {
  console.log('Starting Hyperliquid derivatives worker...');
  
  try {
    // Fetch Hyperliquid perpetuals data
    const contracts = await fetchHyperliquidPerpetuals();
    
    // Add timestamp
    const rows = contracts.map((r) => ({ ...r, ts: new Date() }));
    
    // Insert data into Supabase
    const { error } = await supabase
      .from('derivatives_snapshots')
      .insert(rows);
    
    if (error) {
      throw error;
    }
    
    console.log(`Hyperliquid worker wrote ${rows.length} rows`);
    return rows.length;
  } catch (error) {
    console.error('Error in Hyperliquid derivatives worker:', error);
    throw error;
  }
}

// Create a retryable version of the worker
const retryableWorker = createRetryableWorker(run);

// Run the worker if this file is executed directly
if (require.main === module) {
  retryableWorker()
    .then(() => {
      console.log('Hyperliquid derivatives worker completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Hyperliquid derivatives worker failed:', error);
      process.exit(1);
    });
}
