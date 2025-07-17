create table dex_derivatives_instruments (
  ts               timestamptz  not null,
  exchange         text         not null,   -- 'Hyperliquid' | 'dYdX'
  symbol           text         not null,   -- e.g. 'BTC-USD'
  contract_type    text         not null,   -- always 'perpetual' for now
  oi               numeric      not null,   -- open interest (base-units)
  vol24h           numeric      not null,   -- 24-h notional volume
  funding_rate     numeric      not null,   -- latest hourly / 8-h rate
  price            numeric      not null,   -- mark or index price
  primary key (exchange, symbol)
);

-- Add indexes for common query patterns
CREATE INDEX idx_dex_derivatives_ts ON dex_derivatives_instruments(ts DESC);
CREATE INDEX idx_dex_derivatives_exchange ON dex_derivatives_instruments(exchange);
CREATE INDEX idx_dex_derivatives_volume ON dex_derivatives_instruments(vol24h DESC);

-- Add comments for better documentation
COMMENT ON TABLE dex_derivatives_instruments IS 'DEX derivatives instruments data from Hyperliquid and dYdX';
COMMENT ON COLUMN dex_derivatives_instruments.ts IS 'Timestamp when the data was fetched';
COMMENT ON COLUMN dex_derivatives_instruments.exchange IS 'Exchange name (Hyperliquid or dYdX)';
COMMENT ON COLUMN dex_derivatives_instruments.symbol IS 'Trading pair symbol';
COMMENT ON COLUMN dex_derivatives_instruments.contract_type IS 'Type of contract (perpetual)';
COMMENT ON COLUMN dex_derivatives_instruments.oi IS 'Open interest in base units';
COMMENT ON COLUMN dex_derivatives_instruments.vol24h IS '24-hour notional volume';
COMMENT ON COLUMN dex_derivatives_instruments.funding_rate IS 'Current funding rate';
COMMENT ON COLUMN dex_derivatives_instruments.price IS 'Current mark or index price';
