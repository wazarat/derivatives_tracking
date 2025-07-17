-- Create user_portfolio table for tracking derivatives trades
CREATE TABLE IF NOT EXISTS user_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  
  -- Instrument details
  exchange TEXT NOT NULL,
  symbol TEXT NOT NULL,
  contract_type TEXT NOT NULL DEFAULT 'derivatives',
  
  -- Trade details
  position_side TEXT NOT NULL CHECK (position_side IN ('long', 'short')),
  position_size DECIMAL(20, 8) NOT NULL,
  entry_price DECIMAL(20, 8) NOT NULL,
  
  -- Risk management
  stop_loss DECIMAL(20, 8),
  take_profit DECIMAL(20, 8),
  leverage DECIMAL(10, 2) DEFAULT 1.0,
  
  -- Trade metadata
  trade_created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'partially_closed')),
  closed_at TIMESTAMP WITH TIME ZONE,
  exit_price DECIMAL(20, 8),
  realized_pnl DECIMAL(20, 8),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_portfolio_user_id ON user_portfolio(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_exchange_symbol ON user_portfolio(exchange, symbol);
CREATE INDEX IF NOT EXISTS idx_portfolio_status ON user_portfolio(status);
CREATE INDEX IF NOT EXISTS idx_portfolio_trade_created_at ON user_portfolio(trade_created_at);

-- Add function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_portfolio_updated_at 
    BEFORE UPDATE ON user_portfolio 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add row-level security policies
ALTER TABLE user_portfolio ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own portfolio items
CREATE POLICY "Users can view their own portfolio"
  ON user_portfolio
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own portfolio items
CREATE POLICY "Users can add to their own portfolio"
  ON user_portfolio
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own portfolio items
CREATE POLICY "Users can update their own portfolio"
  ON user_portfolio
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own portfolio items
CREATE POLICY "Users can delete from their own portfolio"
  ON user_portfolio
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add comments for better documentation
COMMENT ON TABLE user_portfolio IS 'Stores user portfolio entries for derivatives trading positions';
COMMENT ON COLUMN user_portfolio.id IS 'Unique identifier for the portfolio entry';
COMMENT ON COLUMN user_portfolio.user_id IS 'ID of the user who owns this portfolio entry';
COMMENT ON COLUMN user_portfolio.exchange IS 'Exchange where the instrument is traded (e.g., binance, okx)';
COMMENT ON COLUMN user_portfolio.symbol IS 'Trading symbol of the instrument';
COMMENT ON COLUMN user_portfolio.contract_type IS 'Type of contract (derivatives)';
COMMENT ON COLUMN user_portfolio.position_side IS 'Whether the position is long or short';
COMMENT ON COLUMN user_portfolio.position_size IS 'Size of the position';
COMMENT ON COLUMN user_portfolio.entry_price IS 'Price at which the position was entered';
COMMENT ON COLUMN user_portfolio.stop_loss IS 'Stop loss price for risk management';
COMMENT ON COLUMN user_portfolio.take_profit IS 'Take profit price for profit taking';
COMMENT ON COLUMN user_portfolio.leverage IS 'Leverage used for the position';
COMMENT ON COLUMN user_portfolio.trade_created_at IS 'Timestamp when the trade was originally created/entered';
COMMENT ON COLUMN user_portfolio.notes IS 'User notes about the trade';
COMMENT ON COLUMN user_portfolio.status IS 'Current status of the position (open, closed, partially_closed)';
COMMENT ON COLUMN user_portfolio.closed_at IS 'Timestamp when the position was closed';
COMMENT ON COLUMN user_portfolio.exit_price IS 'Price at which the position was exited';
COMMENT ON COLUMN user_portfolio.realized_pnl IS 'Realized profit/loss when position is closed';
COMMENT ON COLUMN user_portfolio.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN user_portfolio.updated_at IS 'Timestamp when the record was last updated';
