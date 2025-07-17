const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jmwcmthgtazgzxfqtrpn.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imptd2NtdGhndGF6Z3p4ZnF0cnBuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjcxNTY4MSwiZXhwIjoyMDY4MjkxNjgxfQ.A84kIsXCuyUnjHFASiYYGoKTJq9_NOkbKCytG91Vx9c';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createCexTable() {
  console.log('Creating CEX derivatives instruments table...');
  
  // Create the table with a simpler approach
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS cex_derivatives_instruments (
          id BIGSERIAL PRIMARY KEY,
          ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          exchange TEXT NOT NULL,
          symbol TEXT NOT NULL,
          contract_type TEXT NOT NULL DEFAULT 'derivatives',
          oi NUMERIC DEFAULT 0,
          vol24h NUMERIC DEFAULT 0,
          funding_rate NUMERIC DEFAULT 0,
          price NUMERIC DEFAULT 0,
          symbol_base TEXT,
          symbol_quote TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_cex_derivatives_ts ON cex_derivatives_instruments(ts DESC);
      CREATE INDEX IF NOT EXISTS idx_cex_derivatives_exchange ON cex_derivatives_instruments(exchange);
      CREATE INDEX IF NOT EXISTS idx_cex_derivatives_symbol ON cex_derivatives_instruments(symbol);
      CREATE INDEX IF NOT EXISTS idx_cex_derivatives_vol24h ON cex_derivatives_instruments(vol24h DESC);
      
      CREATE UNIQUE INDEX IF NOT EXISTS idx_cex_derivatives_unique 
      ON cex_derivatives_instruments(exchange, symbol, ts);
    `
  });

  if (error) {
    console.error('Error creating CEX table:', error);
    
    // Try alternative approach - direct table creation
    console.log('Trying alternative approach...');
    
    const { data: tableData, error: tableError } = await supabase
      .from('cex_derivatives_instruments')
      .select('*')
      .limit(1);
    
    if (tableError && tableError.code === 'PGRST116') {
      console.log('Table does not exist, creating manually...');
      
      // Use raw SQL execution
      const createTableSQL = `
        CREATE TABLE cex_derivatives_instruments (
            id BIGSERIAL PRIMARY KEY,
            ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            exchange TEXT NOT NULL,
            symbol TEXT NOT NULL,
            contract_type TEXT NOT NULL DEFAULT 'derivatives',
            oi NUMERIC DEFAULT 0,
            vol24h NUMERIC DEFAULT 0,
            funding_rate NUMERIC DEFAULT 0,
            price NUMERIC DEFAULT 0,
            symbol_base TEXT,
            symbol_quote TEXT
        );
      `;
      
      console.log('Please create this table manually in Supabase SQL editor:');
      console.log(createTableSQL);
      return false;
    }
    
    return false;
  }

  console.log('CEX derivatives table created successfully!');
  
  // Test the table
  const { data: testData, error: testError } = await supabase
    .from('cex_derivatives_instruments')
    .select('*')
    .limit(1);
    
  if (testError) {
    console.error('Error testing CEX table:', testError);
    return false;
  }
  
  console.log('CEX table test successful!');
  return true;
}

createCexTable().then(success => {
  if (success) {
    console.log('✅ CEX derivatives table is ready!');
  } else {
    console.log('❌ CEX derivatives table creation failed');
  }
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
