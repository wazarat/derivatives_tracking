-- Create user_watchlist table for tracking user's watchlist items
CREATE TABLE IF NOT EXISTS user_watchlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  exchange TEXT NOT NULL,
  symbol TEXT NOT NULL,
  contract_type TEXT NOT NULL,
  starred BOOLEAN DEFAULT FALSE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique combination of user_id, exchange, symbol, and contract_type
  UNIQUE(user_id, exchange, symbol, contract_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_watchlist_user_id ON user_watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_user_watchlist_exchange ON user_watchlist(exchange);
CREATE INDEX IF NOT EXISTS idx_user_watchlist_symbol ON user_watchlist(symbol);
CREATE INDEX IF NOT EXISTS idx_user_watchlist_starred ON user_watchlist(starred);
CREATE INDEX IF NOT EXISTS idx_user_watchlist_added_at ON user_watchlist(added_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_watchlist_updated_at 
  BEFORE UPDATE ON user_watchlist 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE user_watchlist ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own watchlist items
CREATE POLICY "Users can view own watchlist items" ON user_watchlist
  FOR SELECT USING (auth.uid()::text = user_id);

-- Users can insert their own watchlist items
CREATE POLICY "Users can insert own watchlist items" ON user_watchlist
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own watchlist items
CREATE POLICY "Users can update own watchlist items" ON user_watchlist
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Users can delete their own watchlist items
CREATE POLICY "Users can delete own watchlist items" ON user_watchlist
  FOR DELETE USING (auth.uid()::text = user_id);

-- Add comments for documentation
COMMENT ON TABLE user_watchlist IS 'Stores user watchlist items for derivatives tracking';
COMMENT ON COLUMN user_watchlist.id IS 'Primary key UUID';
COMMENT ON COLUMN user_watchlist.user_id IS 'Clerk user ID (text format)';
COMMENT ON COLUMN user_watchlist.exchange IS 'Exchange name (e.g., binance, okx, bybit)';
COMMENT ON COLUMN user_watchlist.symbol IS 'Trading symbol (e.g., BTCUSDT)';
COMMENT ON COLUMN user_watchlist.contract_type IS 'Contract type (perpetual, futures, derivatives)';
COMMENT ON COLUMN user_watchlist.starred IS 'Whether the item is starred/favorited';
COMMENT ON COLUMN user_watchlist.added_at IS 'When the item was added to watchlist';
COMMENT ON COLUMN user_watchlist.updated_at IS 'When the item was last updated';
