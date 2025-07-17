-- Create user_watchlist table
CREATE TABLE IF NOT EXISTS user_watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  exchange TEXT NOT NULL,
  symbol TEXT NOT NULL,
  contract_type TEXT NOT NULL,
  starred BOOLEAN NOT NULL DEFAULT false,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Add a composite unique constraint to prevent duplicates
  CONSTRAINT unique_user_instrument UNIQUE (user_id, exchange, symbol, contract_type)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON user_watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_exchange_symbol ON user_watchlist(exchange, symbol);

-- Add row-level security policies
ALTER TABLE user_watchlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own watchlist items
CREATE POLICY "Users can view their own watchlist"
  ON user_watchlist
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own watchlist items
CREATE POLICY "Users can add to their own watchlist"
  ON user_watchlist
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own watchlist items
CREATE POLICY "Users can update their own watchlist"
  ON user_watchlist
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own watchlist items
CREATE POLICY "Users can delete from their own watchlist"
  ON user_watchlist
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add comments for better documentation
COMMENT ON TABLE user_watchlist IS 'Stores user watchlist entries for derivatives instruments';
COMMENT ON COLUMN user_watchlist.id IS 'Unique identifier for the watchlist entry';
COMMENT ON COLUMN user_watchlist.user_id IS 'ID of the user who owns this watchlist entry';
COMMENT ON COLUMN user_watchlist.exchange IS 'Exchange where the instrument is traded (e.g., binance, okx)';
COMMENT ON COLUMN user_watchlist.symbol IS 'Trading symbol of the instrument';
COMMENT ON COLUMN user_watchlist.contract_type IS 'Type of contract (derivatives)';
COMMENT ON COLUMN user_watchlist.starred IS 'Whether the entry is marked as favorite/starred';
COMMENT ON COLUMN user_watchlist.added_at IS 'Timestamp when the entry was added to watchlist';
