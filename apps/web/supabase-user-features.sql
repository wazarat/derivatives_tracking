-- User Watchlist and Portfolio Tables for Derivatives Tracking
-- Run this in Supabase SQL Editor

-- User Watchlist Table
CREATE TABLE IF NOT EXISTS user_watchlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Clerk user ID
    exchange TEXT NOT NULL,
    symbol TEXT NOT NULL,
    contract_type TEXT NOT NULL, -- 'derivatives', 'futures', 'perpetual'
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    starred BOOLEAN DEFAULT FALSE,
    
    -- Ensure unique watchlist entries per user
    UNIQUE(user_id, exchange, symbol, contract_type)
);

-- User Portfolio Table
CREATE TABLE IF NOT EXISTS user_portfolio (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Clerk user ID
    exchange TEXT NOT NULL,
    symbol TEXT NOT NULL,
    contract_type TEXT NOT NULL,
    position_type TEXT NOT NULL CHECK (position_type IN ('long', 'short')),
    entry_price DECIMAL(20, 8) NOT NULL,
    position_size DECIMAL(20, 8) NOT NULL,
    entry_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Ensure unique active positions per user
    UNIQUE(user_id, exchange, symbol, contract_type, position_type, is_active)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_watchlist_user_id ON user_watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_user_watchlist_added_at ON user_watchlist(added_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_portfolio_user_id ON user_portfolio(user_id);
CREATE INDEX IF NOT EXISTS idx_user_portfolio_entry_date ON user_portfolio(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_portfolio_active ON user_portfolio(is_active) WHERE is_active = TRUE;

-- Row Level Security (RLS) - Users can only access their own data
ALTER TABLE user_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_portfolio ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Watchlist
CREATE POLICY "Users can view their own watchlist" ON user_watchlist
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own watchlist items" ON user_watchlist
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own watchlist items" ON user_watchlist
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own watchlist items" ON user_watchlist
    FOR DELETE USING (auth.uid()::text = user_id);

-- RLS Policies for Portfolio
CREATE POLICY "Users can view their own portfolio" ON user_portfolio
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own portfolio items" ON user_portfolio
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own portfolio items" ON user_portfolio
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own portfolio items" ON user_portfolio
    FOR DELETE USING (auth.uid()::text = user_id);

-- Comments for documentation
COMMENT ON TABLE user_watchlist IS 'User watchlist for derivatives tracking';
COMMENT ON TABLE user_portfolio IS 'User portfolio positions for derivatives tracking';
COMMENT ON COLUMN user_watchlist.user_id IS 'Clerk user ID from authentication';
COMMENT ON COLUMN user_portfolio.position_type IS 'Long or short position';
COMMENT ON COLUMN user_portfolio.entry_price IS 'Price at which position was entered';
COMMENT ON COLUMN user_portfolio.position_size IS 'Size of the position';
