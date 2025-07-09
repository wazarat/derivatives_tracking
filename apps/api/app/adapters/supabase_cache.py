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
            return json.loads(item["value"])
        except Exception as e:
            logger.error(f"Error getting cache key {key}: {e}")
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
            
            # Calculate expiry time
            expiry = None
            if expiry_seconds:
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
            logger.error(f"Error setting cache key {key}: {e}")
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
            self.client.table(self.table_name) \
                .delete() \
                .eq("key", key) \
                .execute()
            
            return True
        except Exception as e:
            logger.error(f"Error deleting cache key {key}: {e}")
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
            logger.error(f"Error checking if cache key {key} exists: {e}")
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
            
            expiry_str = response.data[0].get("expiry")
            if not expiry_str:
                return None
            
            expiry = datetime.fromisoformat(expiry_str)
            now = datetime.utcnow()
            
            if expiry <= now:
                return 0
            
            return int((expiry - now).total_seconds())
        except Exception as e:
            logger.error(f"Error getting TTL for cache key {key}: {e}")
            return None
    
    async def clear(self) -> bool:
        """
        Clear all cache entries
        
        Returns:
            True if successful, False otherwise
        """
        try:
            self.client.table(self.table_name).delete().neq("key", "dummy_key").execute()
            return True
        except Exception as e:
            logger.error(f"Error clearing cache: {e}")
            return False
    
    async def close(self):
        """Close the Supabase client"""
        # Supabase client doesn't need explicit closing
        pass
    
    # Specialized methods for CoinGecko data
    
    def _get_coins_markets_cache_key(self, vs_currency: str, page: int) -> str:
        """Get cache key for coins markets data"""
        return f"coingecko:markets:{vs_currency}:{page}"
    
    def _get_coin_cache_key(self, coin_id: str) -> str:
        """Get cache key for coin data"""
        return f"coingecko:coin:{coin_id}"
    
    def _get_coin_history_cache_key(self, coin_id: str, vs_currency: str, days: Union[int, str]) -> str:
        """Get cache key for coin history data"""
        return f"coingecko:history:{coin_id}:{vs_currency}:{days}"
    
    def _get_global_data_cache_key(self) -> str:
        """Get cache key for global data"""
        return "coingecko:global"
    
    async def get_coins_markets(self, vs_currency: str, page: int) -> Optional[List[Dict]]:
        """Get cached coins markets data"""
        key = self._get_coins_markets_cache_key(vs_currency, page)
        return await self.get(key)
    
    async def set_coins_markets(self, vs_currency: str, page: int, data: List[Dict], expiry_seconds: int = 300) -> bool:
        """Cache coins markets data"""
        key = self._get_coins_markets_cache_key(vs_currency, page)
        return await self.set(key, data, expiry_seconds)
    
    async def get_coin(self, coin_id: str) -> Optional[Dict]:
        """Get cached coin data"""
        key = self._get_coin_cache_key(coin_id)
        return await self.get(key)
    
    async def set_coin(self, coin_id: str, data: Dict, expiry_seconds: int = 300) -> bool:
        """Cache coin data"""
        key = self._get_coin_cache_key(coin_id)
        return await self.set(key, data, expiry_seconds)
    
    async def get_coin_history(self, coin_id: str, vs_currency: str, days: Union[int, str]) -> Optional[Dict]:
        """Get cached coin history data"""
        key = self._get_coin_history_cache_key(coin_id, vs_currency, days)
        return await self.get(key)
    
    async def set_coin_history(self, coin_id: str, vs_currency: str, days: Union[int, str], data: Dict, expiry_seconds: int = 3600) -> bool:
        """Cache coin history data"""
        key = self._get_coin_history_cache_key(coin_id, vs_currency, days)
        return await self.set(key, data, expiry_seconds)
    
    async def get_global_data(self) -> Optional[Dict]:
        """Get cached global data"""
        key = self._get_global_data_cache_key()
        return await self.get(key)
    
    async def set_global_data(self, data: Dict, expiry_seconds: int = 900) -> bool:
        """Cache global data"""
        key = self._get_global_data_cache_key()
        return await self.set(key, data, expiry_seconds)
