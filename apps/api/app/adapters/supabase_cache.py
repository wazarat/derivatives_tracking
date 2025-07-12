import json
import logging
import time
from typing import Any, Dict, List, Optional, Union
from datetime import datetime, timedelta

from supabase import create_client, Client
import os

logger = logging.getLogger(__name__)

class SupabaseCache:
    """
    Cache adapter using Supabase key-value store for caching cryptocurrency data
    """
    
    def __init__(self, url: Optional[str] = None, key: Optional[str] = None):
        """
        Initialize the Supabase cache adapter
        
        Args:
            url: Supabase URL
            key: Supabase API key
        """
        self.url = url or os.getenv("SUPABASE_URL", "https://gxgmcrqcxfgmhvuborpa.supabase.co")
        self.key = key or os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4Z21jcnFjeGZnbWh2dWJvcnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NzExMjQsImV4cCI6MjA2NzA0NzEyNH0.-LoPXC3qe3-BfzlATE3TDpvDZ0nyDX98hYkwzugzFVs")
        
        if not self.url or not self.key:
            raise ValueError("Supabase URL and key must be provided")
        
        # Use the create_client function which is compatible with supabase v1.2.0
        from supabase import create_client
        self.client = create_client(self.url, self.key)
        logger.info("Supabase client initialized with create_client")
            
        self.table_name = "cache"
        
        # Ensure the cache table exists
        self._ensure_cache_table()
    
    def _ensure_cache_table(self):
        """Ensure the cache table exists in Supabase"""
        try:
            # Check if table exists by trying to select from it
            self.client.table(self.table_name).select("key").limit(1).execute()
            logger.info(f"Cache table '{self.table_name}' exists")
        except Exception as e:
            logger.warning(f"Cache table check failed: {e}. Attempting to create table.")
            try:
                # Since we can't directly create tables via the REST API without custom RPC functions,
                # we'll need to handle this differently:
                # 1. Log the error and provide instructions
                # 2. Continue without caching
                logger.error(f"""
                Cannot automatically create cache table in Supabase.
                Please create the table manually in the Supabase dashboard with the following SQL:
                
                CREATE TABLE IF NOT EXISTS {self.table_name} (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL,
                    expiry TIMESTAMP WITH TIME ZONE,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_{self.table_name}_expiry ON {self.table_name}(expiry);
                """)
                
                # For now, we'll try to continue without caching
                # The application will still work, but performance may be affected
                logger.warning("Continuing without cache table - API will work but performance may be affected")
            except Exception as create_error:
                logger.error(f"Failed to handle cache table creation: {create_error}")
                # Continue without caching if table creation fails
    
    async def get(self, key: str) -> Optional[Any]:
        """
        Get a value from the cache
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found
        """
        try:
            response = self.client.table(self.table_name) \
                .select("value, expiry") \
                .eq("key", key) \
                .execute()
            
            if not response.data:
                return None
            
            item = response.data[0]
            
            # Check if expired
            expiry = item.get("expiry")
            if expiry and datetime.fromisoformat(expiry) < datetime.utcnow():
                # Expired, delete and return None
                await self.delete(key)
                return None
            
            # Return the value
            value_str = item.get("value")
            if value_str:
                return json.loads(value_str)
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting cache value for key '{key}': {e}")
            return None
    
    async def set(self, key: str, value: Any, expiry_seconds: Optional[int] = None) -> bool:
        """
        Set a value in the cache
        
        Args:
            key: Cache key
            value: Value to cache (must be JSON serializable)
            expiry_seconds: Optional expiration time in seconds
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Convert value to JSON string
            value_str = json.dumps(value)
            
            # Calculate expiry timestamp if provided
            expiry = None
            if expiry_seconds is not None:
                expiry = (datetime.utcnow() + timedelta(seconds=expiry_seconds)).isoformat()
            
            # Upsert the value
            self.client.table(self.table_name).upsert({
                "key": key,
                "value": value_str,
                "expiry": expiry,
                "updated_at": datetime.utcnow().isoformat()
            }).execute()
            
            return True
            
        except Exception as e:
            logger.error(f"Error setting cache value for key '{key}': {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """
        Delete a value from the cache
        
        Args:
            key: Cache key
            
        Returns:
            True if successful, False otherwise
        """
        try:
            self.client.table(self.table_name).delete().eq("key", key).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting cache value for key '{key}': {e}")
            return False
    
    async def exists(self, key: str) -> bool:
        """
        Check if a key exists in the cache
        
        Args:
            key: Cache key
            
        Returns:
            True if the key exists, False otherwise
        """
        try:
            response = self.client.table(self.table_name) \
                .select("key") \
                .eq("key", key) \
                .execute()
            
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error checking if key '{key}' exists in cache: {e}")
            return False
    
    async def ttl(self, key: str) -> Optional[int]:
        """
        Get the remaining time to live for a key in seconds
        
        Args:
            key: Cache key
            
        Returns:
            Remaining TTL in seconds or None if key doesn't exist or has no expiry
        """
        try:
            response = self.client.table(self.table_name) \
                .select("expiry") \
                .eq("key", key) \
                .execute()
            
            if not response.data:
                return None
            
            expiry = response.data[0].get("expiry")
            if not expiry:
                return None
            
            # Calculate remaining time
            expiry_dt = datetime.fromisoformat(expiry)
            now = datetime.utcnow()
            
            if expiry_dt <= now:
                # Already expired
                return 0
            
            # Return remaining seconds
            return int((expiry_dt - now).total_seconds())
            
        except Exception as e:
            logger.error(f"Error getting TTL for key '{key}': {e}")
            return None
    
    async def clear(self) -> bool:
        """
        Clear all cache entries
        
        Returns:
            True if successful, False otherwise
        """
        try:
            # Delete all rows
            self.client.table(self.table_name).delete().neq("key", "impossible_key").execute()
            return True
        except Exception as e:
            logger.error(f"Error clearing cache: {e}")
            return False
    
    async def close(self):
        """Close the Supabase client"""
        # Nothing to do for Supabase client
        pass
    
    # Specialized methods for CoinMarketCap data
    
    def _get_listings_latest_cache_key(self, convert: str, limit: int) -> str:
        """Get cache key for listings latest data"""
        return f"coinmarketcap:listings:{convert}:{limit}"
    
    def _get_quotes_latest_cache_key(self, symbol: str, convert: str) -> str:
        """Get cache key for quotes latest data"""
        return f"coinmarketcap:quotes:{symbol}:{convert}"
    
    def _get_historical_quotes_cache_key(self, symbol: str, time_period: str, convert: str) -> str:
        """Get cache key for historical quotes data"""
        return f"coinmarketcap:historical:{symbol}:{time_period}:{convert}"
    
    def _get_global_metrics_cache_key(self, convert: str) -> str:
        """Get cache key for global metrics data"""
        return f"coinmarketcap:global:{convert}"
    
    def _get_coin_details_cache_key(self, symbol: str, convert: str) -> str:
        """Get cache key for coin details data"""
        return f"coinmarketcap:details:{symbol}:{convert}"
    
    async def get_listings_latest(self, convert: str, limit: int) -> Optional[Dict]:
        """Get cached listings latest data"""
        key = self._get_listings_latest_cache_key(convert, limit)
        return await self.get(key)
    
    async def set_listings_latest(self, data: Dict, convert: str, limit: int, expiry_seconds: int = 300) -> bool:
        """Cache listings latest data"""
        key = self._get_listings_latest_cache_key(convert, limit)
        return await self.set(key, data, expiry_seconds)
    
    async def get_quotes_latest(self, symbol: str, convert: str) -> Optional[Dict]:
        """Get cached quotes latest data"""
        key = self._get_quotes_latest_cache_key(symbol, convert)
        return await self.get(key)
    
    async def set_quotes_latest(self, data: Dict, symbol: str, convert: str, expiry_seconds: int = 300) -> bool:
        """Cache quotes latest data"""
        key = self._get_quotes_latest_cache_key(symbol, convert)
        return await self.set(key, data, expiry_seconds)
    
    async def get_historical_quotes(self, symbol: str, time_period: str, convert: str) -> Optional[Dict]:
        """Get cached historical quotes data"""
        key = self._get_historical_quotes_cache_key(symbol, time_period, convert)
        return await self.get(key)
    
    async def set_historical_quotes(self, data: Dict, symbol: str, time_period: str, convert: str, expiry_seconds: int = 3600) -> bool:
        """Cache historical quotes data"""
        key = self._get_historical_quotes_cache_key(symbol, time_period, convert)
        return await self.set(key, data, expiry_seconds)
    
    async def get_global_metrics(self, convert: str) -> Optional[Dict]:
        """Get cached global metrics data"""
        key = self._get_global_metrics_cache_key(convert)
        return await self.get(key)
    
    async def set_global_metrics(self, data: Dict, convert: str, expiry_seconds: int = 900) -> bool:
        """Cache global metrics data"""
        key = self._get_global_metrics_cache_key(convert)
        return await self.set(key, data, expiry_seconds)
    
    async def get_coin_details(self, symbol: str, convert: str) -> Optional[Dict]:
        """Get cached coin details data"""
        key = self._get_coin_details_cache_key(symbol, convert)
        return await self.get(key)
    
    async def set_coin_details(self, data: Dict, symbol: str, convert: str, expiry_seconds: int = 3600) -> bool:
        """Cache coin details data"""
        key = self._get_coin_details_cache_key(symbol, convert)
        return await self.set(key, data, expiry_seconds)
