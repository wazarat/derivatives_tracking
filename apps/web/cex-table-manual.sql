-- Run this SQL in your Supabase SQL Editor
-- Dashboard: https://supabase.com/dashboard/project/jmwcmthgtazgzxfqtrpn

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

-- Create indexes for performance
CREATE INDEX idx_cex_derivatives_ts ON cex_derivatives_instruments(ts DESC);
CREATE INDEX idx_cex_derivatives_exchange ON cex_derivatives_instruments(exchange);
CREATE INDEX idx_cex_derivatives_symbol ON cex_derivatives_instruments(symbol);
CREATE INDEX idx_cex_derivatives_vol24h ON cex_derivatives_instruments(vol24h DESC);

-- Create unique constraint to prevent duplicates
CREATE UNIQUE INDEX idx_cex_derivatives_unique 
ON cex_derivatives_instruments(exchange, symbol, ts);
