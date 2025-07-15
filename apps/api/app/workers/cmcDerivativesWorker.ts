import axios from 'axios';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CMC = 'https://pro-api.coinmarketcap.com';
// Use COINMARKETCAP_API_KEY with fallback to CMC_KEY for backward compatibility
const apiKey = process.env.COINMARKETCAP_API_KEY || process.env.CMC_KEY;
const hdr = { 'X-CMC_PRO_API_KEY': apiKey! };

/**
 * Fetch derivatives data for a specific category (futures or perpetual)
 */
async function fetchSector(category: 'futures' | 'perpetual') {
  console.log(`Fetching ${category} data from CoinMarketCap...`);
  const url = `${CMC}/v1/derivatives/exchanges?category=${category}&limit=1000`;
  
  try {
    const res = await fetch(url, { headers: hdr });
    
    if (!res.ok) {
      throw new Error(`CoinMarketCap API error: ${res.status} ${res.statusText}`);
    }
    
    const response = await res.json() as { data: any[] };
    const data = response.data;
    
    // Flatten each contract row
    return data.flatMap((ex: any) =>
      ex.contracts.map((c: any) => ({
        exchange: ex.name,
        symbol: c.symbol,
        contract_type: category,
        oi_usd: c.open_interest_usd || 0,
        funding_rate: c.funding_rate || 0,
        volume_24h: c.volume_24h || 0,
        index_price: c.index_price || 0,
      }))
    );
  } catch (error) {
    console.error(`Error fetching ${category} data:`, error);
    throw error;
  }
}

/**
 * Main worker function to fetch and store derivatives data
 */
export async function run() {
  console.log('Starting CMC derivatives worker...');
  
  try {
    // Fetch both perpetual and futures data in parallel
    const [perps, futures] = await Promise.all([
      fetchSector('perpetual'),
      fetchSector('futures')
    ]);
    
    // Combine data and add timestamp
    const rows = [...perps, ...futures].map(r => ({ ...r, ts: new Date() }));
    
    // Insert data into Supabase
    const { error } = await supabase
      .from('derivatives_snapshots')
      .insert(rows);
    
    if (error) {
      throw error;
    }
    
    console.log(`CMC worker wrote ${rows.length} rows`);
    return rows.length;
  } catch (error) {
    console.error('Error in CMC derivatives worker:', error);
    throw error;
  }
}

// Run the worker if this file is executed directly
if (require.main === module) {
  run()
    .then(() => {
      console.log('CMC derivatives worker completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('CMC derivatives worker failed:', error);
      process.exit(1);
    });
}
