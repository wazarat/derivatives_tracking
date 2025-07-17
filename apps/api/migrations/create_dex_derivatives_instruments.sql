-- Create table for DEX derivatives instruments (perpetuals)
CREATE TABLE IF NOT EXISTS dex_derivatives_instruments (
  id SERIAL PRIMARY KEY,
  ts TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  exchange TEXT NOT NULL,
  symbol TEXT NOT NULL,
  contract_type TEXT NOT NULL,
  oi NUMERIC(24, 8),
  funding_rate NUMERIC(24, 8),
  vol24h NUMERIC(24, 8),
  price NUMERIC(24, 8),
  
  -- Create a unique constraint on exchange, symbol, and timestamp
  -- This prevents duplicate entries for the same instrument at the same time
  UNIQUE(exchange, symbol, ts)
);

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS dex_derivatives_instruments_exchange_idx ON dex_derivatives_instruments(exchange);
CREATE INDEX IF NOT EXISTS dex_derivatives_instruments_symbol_idx ON dex_derivatives_instruments(symbol);
CREATE INDEX IF NOT EXISTS dex_derivatives_instruments_ts_idx ON dex_derivatives_instruments(ts);
CREATE INDEX IF NOT EXISTS dex_derivatives_instruments_contract_type_idx ON dex_derivatives_instruments(contract_type);

-- Add a comment to the table
COMMENT ON TABLE dex_derivatives_instruments IS 'Stores DEX derivatives instruments data (perpetuals) from Hyperliquid and dYdX';
