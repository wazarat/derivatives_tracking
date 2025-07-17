-- Create cex_derivatives_instruments table for CEX derivatives data
-- This table stores derivatives data from centralized exchanges like Binance, OKX, Bybit

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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cex_derivatives_ts ON cex_derivatives_instruments(ts DESC);
CREATE INDEX IF NOT EXISTS idx_cex_derivatives_exchange ON cex_derivatives_instruments(exchange);
CREATE INDEX IF NOT EXISTS idx_cex_derivatives_symbol ON cex_derivatives_instruments(symbol);
CREATE INDEX IF NOT EXISTS idx_cex_derivatives_vol24h ON cex_derivatives_instruments(vol24h DESC);
CREATE INDEX IF NOT EXISTS idx_cex_derivatives_contract_type ON cex_derivatives_instruments(contract_type);

-- Create unique constraint to prevent duplicate entries
CREATE UNIQUE INDEX IF NOT EXISTS idx_cex_derivatives_unique 
ON cex_derivatives_instruments(exchange, symbol, ts);

-- Add comments for documentation
COMMENT ON TABLE cex_derivatives_instruments IS 'CEX derivatives instruments data from exchanges like Binance, OKX, Bybit';
COMMENT ON COLUMN cex_derivatives_instruments.ts IS 'Timestamp when the data was recorded';
COMMENT ON COLUMN cex_derivatives_instruments.exchange IS 'Exchange name (e.g., Binance, OKX, Bybit)';
COMMENT ON COLUMN cex_derivatives_instruments.symbol IS 'Trading symbol (e.g., BTC-USDT)';
COMMENT ON COLUMN cex_derivatives_instruments.contract_type IS 'Contract type (derivatives, futures, perpetual)';
COMMENT ON COLUMN cex_derivatives_instruments.oi IS 'Open interest in USD';
COMMENT ON COLUMN cex_derivatives_instruments.vol24h IS '24-hour trading volume in USD';
COMMENT ON COLUMN cex_derivatives_instruments.funding_rate IS 'Funding rate (for perpetuals)';
COMMENT ON COLUMN cex_derivatives_instruments.price IS 'Index/mark price in USD';

-- Enable Row Level Security (RLS) for security
ALTER TABLE cex_derivatives_instruments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (for API endpoints)
CREATE POLICY "Allow public read access" ON cex_derivatives_instruments
    FOR SELECT USING (true);

-- Create policy to allow service role full access (for workers)
CREATE POLICY "Allow service role full access" ON cex_derivatives_instruments
    FOR ALL USING (auth.role() = 'service_role');
