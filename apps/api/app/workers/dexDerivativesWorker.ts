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

// API endpoint
const HYPERLIQUID_API = 'https://api.hyperliquid.xyz';

/**
 * Fetch all perpetual contracts from Hyperliquid with proper timeout handling
 */
async function fetchHyperliquid() {
  console.log('Fetching Hyperliquid perpetuals data...');
  
  try {
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    // First get the meta and asset contexts
    const metaRes = await fetch(`${HYPERLIQUID_API}/info`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'metaAndAssetCtxs' }),
      signal: controller.signal
    });
    
    if (!metaRes.ok) {
      throw new Error(`Hyperliquid meta API error: ${metaRes.status} ${metaRes.statusText}`);
    }
    
    const metaData = await metaRes.json() as [any, any[]];
    const [meta, ctxs] = metaData;
    
    if (!meta?.universe || !Array.isArray(ctxs)) {
      throw new Error('Invalid Hyperliquid meta API response structure');
    }
    
    // Get current prices
    const priceRes = await fetch(`${HYPERLIQUID_API}/info`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'allMids' }),
      signal: controller.signal
    });
    
    if (!priceRes.ok) {
      throw new Error(`Hyperliquid price API error: ${priceRes.status} ${priceRes.statusText}`);
    }
    
    const priceData = await priceRes.json() as Record<string, string>;
    
    clearTimeout(timeoutId);
    
    interface DerivativeRecord {
      ts: string;
      exchange: string;
      symbol: string;
      contract_type: string;
      oi: number;
      vol24h: number;
      funding_rate: number;
      price: number;
    }
    
    const results: DerivativeRecord[] = meta.universe.map((asset: any, i: number) => {
      const symbol = asset.name;
      const price = priceData[symbol] ? parseFloat(priceData[symbol]) : 0;
      
      return {
        ts: new Date().toISOString(),
        exchange: 'Hyperliquid',
        symbol: `${symbol}-USD`,
        contract_type: 'perpetual',
        oi: +(ctxs[i]?.openInterest || 0),
        vol24h: +(ctxs[i]?.dayNtlVlm || 0),
        funding_rate: +(ctxs[i]?.funding || 0),
        price: price
      };
    });
    
    console.log(`Successfully fetched ${results.length} Hyperliquid contracts`);
    console.log('Sample data:', results.slice(0, 3));
    return results;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Hyperliquid API request timed out after 10 seconds');
    } else {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error fetching Hyperliquid data:', errorMessage);
    }
    throw error; // Re-throw since this is now the primary data source
  }
}

/**
 * Write data to Supabase
 */
async function writeToSupabase(data: any[]) {
  try {
    console.log(`Attempting to upsert ${data.length} rows to dex_derivatives_instruments table`);
    
    // Log a few sample records for debugging
    console.log('Sample records to be upserted:');
    console.log(JSON.stringify(data.slice(0, 3), null, 2));
    
    const { error, count } = await supabase
      .from('dex_derivatives_instruments')
      .upsert(data, { 
        onConflict: 'exchange,symbol,ts',
        ignoreDuplicates: false
      });
    
    if (error) {
      console.error('Error upserting data to Supabase:', error);
      throw new Error(`Upsert failed: ${JSON.stringify(error)}`);
    }
    
    console.log(`Successfully wrote ${count} rows to Supabase`);
    return count;
  } catch (error) {
    console.error('Error in Supabase operation:', error);
    throw error;
  }
}

/**
 * Main worker function - focuses on Hyperliquid only
 */
export async function runDexDerivativesWorker(isDryRun = false) {
  console.log('Starting DEX derivatives worker (Hyperliquid only)...');
  
  if (isDryRun) {
    console.log('Dry run mode - will fetch data but not write to Supabase');
  }
  
  try {
    // Fetch data from Hyperliquid
    const hyperliquidData = await fetchHyperliquid();
    
    if (hyperliquidData.length === 0) {
      console.log('No data fetched from Hyperliquid');
      return;
    }
    
    console.log(`Total records to process: ${hyperliquidData.length}`);
    
    // Filter for records with meaningful data
    const meaningfulData = hyperliquidData.filter((record: any) => 
      record.oi > 0 || record.vol24h > 0 || record.funding_rate !== 0 || record.price > 0
    );
    
    console.log(`Records with non-zero values: ${meaningfulData.length}`);
    
    if (isDryRun) {
      console.log('Dry run - skipping database write');
      console.log('Sample meaningful data:', meaningfulData.slice(0, 5));
      return;
    }
    
    if (meaningfulData.length === 0) {
      console.log('No meaningful data to write to database');
      return;
    }
    
    // Write to Supabase
    await writeToSupabase(meaningfulData);
    
    console.log('DEX derivatives worker completed successfully');
  } catch (error) {
    console.error('DEX derivatives worker failed:', error);
    throw error;
  }
}

/**
 * Legacy run function for compatibility
 */
export async function run() {
  return runDexDerivativesWorker(false);
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
    
    runDexDerivativesWorker(true)
      .then(() => {
        console.log('Dry run completed successfully');
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
