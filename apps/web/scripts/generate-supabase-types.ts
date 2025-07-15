import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Check for required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function generateTypes() {
  try {
    console.log('Fetching schema from Supabase...');
    
    // Fetch derivatives_snapshots table schema
    const { data: snapshotsSchema, error: snapshotsError } = await supabase
      .from('derivatives_snapshots')
      .select('*')
      .limit(1);
      
    if (snapshotsError) {
      throw new Error(`Failed to fetch derivatives_snapshots schema: ${snapshotsError.message}`);
    }
    
    // Generate TypeScript interfaces
    const typesContent = `/**
 * This file contains TypeScript types for Supabase database tables and views.
 * These types are generated from the Supabase schema.
 */

export interface DerivativesSnapshot {
  id: number;
  ts: string;
  exchange: string;
  symbol: string;
  contract_type: 'perpetual' | 'futures';
  oi_usd: number;
  funding_rate: number | null;
  volume_24h: number;
  index_price: number;
}

export interface DerivativesLatest extends DerivativesSnapshot {}

export interface DerivativesStats {
  totalOpenInterest: number;
  totalVolume24h: number;
  averageFundingRate: number | null;
  contractCount: number;
}
`;

    // Ensure directory exists
    const typesDir = path.resolve(process.cwd(), 'src/types');
    if (!fs.existsSync(typesDir)) {
      fs.mkdirSync(typesDir, { recursive: true });
    }
    
    // Write types file
    const typesPath = path.resolve(typesDir, 'supabase.ts');
    fs.writeFileSync(typesPath, typesContent);
    
    console.log(`Types generated successfully at ${typesPath}`);
  } catch (error) {
    console.error('Error generating types:', error);
    process.exit(1);
  }
}

// Run the generator
generateTypes();
