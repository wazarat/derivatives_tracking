import logging
import os
import json
import time
from typing import Any, Dict, Optional, Union
from datetime import datetime, timedelta

from supabase import create_client

logger = logging.getLogger(__name__)

class SupabaseCache:
    """
    Cache adapter using Supabase
    
    Stores data in a Supabase table with TTL support
    """
    
    CACHE_TABLE = "cryptocurrency_cache"
    
    def __init__(self, url: Optional[str] = None, key: Optional[str] = None):
        """
        Initialize the Supabase cache adapter
        
        Args:
            url: Supabase URL
            key: Supabase API key
        """
        self.url = url or os.environ.get("SUPABASE_URL")
        self.key = key or os.environ.get("SUPABASE_API_KEY")
        self.client = None
        
        if not self.url or not self.key:
            logger.warning("Supabase URL or API key not provided")
    
    async def setup(self):
        """
        Set up the Supabase client and ensure cache table exists
        """
        if not self.client and self.url and self.key:
            try:
                logger.info("Setting up Supabase cache")
                
                # Create Supabase client with no options to avoid proxy error
                self.client = create_client(self.url, self.key)
                
                # Ensure cache table exists
                await self._ensure_cache_table()
                
                logger.info("Supabase cache setup complete")
            except Exception as e:
                logger.error(f"Error setting up Supabase cache: {e}")
                
                # If client creation fails, create a memory-only mock client for development
                self._setup_mock_client()
    
    def _setup_mock_client(self):
        """
        Set up a mock client for development when Supabase is not available
        This allows the application to continue functioning without Supabase
        """
        try:
            logger.warning("Setting up mock cache client for development")
            
            # Create an in-memory cache
            self._memory_cache = {}
            
            # Create a minimal mock client with the required methods
            class MockTable:
                def __init__(self, cache, table_name):
                    self.cache = cache
                    self.table_name = table_name
                    self._filters = []
                
                def select(self, *args):
                    return self
                
                def eq(self, field, value):
                    self._filters.append((field, value))
                    return self
                
                def neq(self, field, value):
                    # For clear() operation
                    return self
                
                def lt(self, field, value):
                    # For cleanup_expired()
                    return self
                
                def limit(self, n):
                    return self
                
                def upsert(self, data):
                    key = data.get("key")
                    if key:
                        self.cache[key] = data
                    return self
                
                def delete(self):
                    return self
                
                def execute(self):
                    if not self._filters:
                        return MockResponse([])
                    
                    field, value = self._filters[0]
                    if field == "key" and value in self.cache:
                        return MockResponse([self.cache[value]])
                    return MockResponse([])
            
            class MockRPC:
                def __init__(self, cache):
                    self.cache = cache
                
                def execute(self):
                    # Just return success for table creation
                    return MockResponse({"success": True})
            
            class MockResponse:
                def __init__(self, data):
                    self.data = data
            
            class MockClient:
                def __init__(self, cache):
                    self._cache = cache
                
                def table(self, name):
                    return MockTable(self._cache, name)
                
                def rpc(self, func_name, params=None):
                    return MockRPC(self._cache)
            
            self.client = MockClient(self._memory_cache)
            logger.info("Mock cache client setup complete")
            
        except Exception as mock_error:
            logger.error(f"Error setting up mock client: {mock_error}")
            self.client = None
    
    async def _ensure_cache_table(self):
        """
        Ensure the cache table exists
        """
        if not self.client:
            return
        
        try:
            # Check if table exists by querying it
            self.client.table(self.CACHE_TABLE).select("key").limit(1).execute()
            logger.debug(f"Cache table '{self.CACHE_TABLE}' exists")
        except Exception as e:
            logger.warning(f"Error checking cache table: {e}")
            logger.info(f"Creating cache table '{self.CACHE_TABLE}'")
            
            try:
                # Create table using SQL
                sql = f"""
                CREATE TABLE IF NOT EXISTS {self.CACHE_TABLE} (
                    key TEXT PRIMARY KEY,
                    value JSONB NOT NULL,
                    expires_at TIMESTAMP WITH TIME ZONE
                );
                CREATE INDEX IF NOT EXISTS idx_cache_expires_at ON {self.CACHE_TABLE} (expires_at);
                """
                self.client.rpc("exec_sql", {"sql": sql}).execute()
                logger.info(f"Cache table '{self.CACHE_TABLE}' created")
            except Exception as create_error:
                logger.error(f"Error creating cache table: {create_error}")
    
    async def get(self, key: str) -> Any:
        """
        Get a value from the cache
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found or expired
        """
        if not self.client:
            await self.setup()
            if not self.client:
                logger.error("Supabase client not available")
                return None
        
        try:
            # Get value from cache
            response = self.client.table(self.CACHE_TABLE) \
                .select("value, expires_at") \
                .eq("key", key) \
                .execute()
            
            # Check if value exists
            if not response.data or len(response.data) == 0:
                return None
            
            # Check if value has expired
            cache_item = response.data[0]
            expires_at = cache_item.get("expires_at")
            
            if expires_at:
                expires_at = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
                if expires_at < datetime.utcnow():
                    logger.debug(f"Cache key '{key}' has expired")
                    await self.delete(key)
                    return None
            
            # Return value
            value = cache_item.get("value")
            logger.debug(f"Cache hit for key '{key}'")
            return value
            
        except Exception as e:
            logger.error(f"Error getting cache value for key '{key}': {e}")
            return None
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """
        Set a value in the cache
        
        Args:
            key: Cache key
            value: Value to cache
            ttl: Time to live in seconds
            
        Returns:
            True if successful, False otherwise
        """
        if not self.client:
            await self.setup()
            if not self.client:
                logger.error("Supabase client not available")
                return False
        
        try:
            # Calculate expiration time
            expires_at = None
            if ttl:
                expires_at = (datetime.utcnow() + timedelta(seconds=ttl)).isoformat()
            
            # Prepare data
            data = {
                "key": key,
                "value": value,
                "expires_at": expires_at
            }
            
            # Upsert value in cache
            self.client.table(self.CACHE_TABLE) \
                .upsert(data) \
                .execute()
            
            logger.debug(f"Cache set for key '{key}' with TTL {ttl}")
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
        if not self.client:
            await self.setup()
            if not self.client:
                logger.error("Supabase client not available")
                return False
        
        try:
            # Delete value from cache
            self.client.table(self.CACHE_TABLE) \
                .delete() \
                .eq("key", key) \
                .execute()
            
            logger.debug(f"Cache deleted for key '{key}'")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting cache value for key '{key}': {e}")
            return False
    
    async def clear(self) -> bool:
        """
        Clear all values from the cache
        
        Returns:
            True if successful, False otherwise
        """
        if not self.client:
            await self.setup()
            if not self.client:
                logger.error("Supabase client not available")
                return False
        
        try:
            # Delete all values from cache
            self.client.table(self.CACHE_TABLE) \
                .delete() \
                .neq("key", "dummy_condition_to_delete_all") \
                .execute()
            
            logger.debug("Cache cleared")
            return True
            
        except Exception as e:
            logger.error(f"Error clearing cache: {e}")
            return False
    
    async def cleanup_expired(self) -> int:
        """
        Clean up expired cache entries
        
        Returns:
            Number of entries deleted
        """
        if not self.client:
            await self.setup()
            if not self.client:
                logger.error("Supabase client not available")
                return 0
        
        try:
            # Delete expired values from cache
            now = datetime.utcnow().isoformat()
            response = self.client.table(self.CACHE_TABLE) \
                .delete() \
                .lt("expires_at", now) \
                .execute()
            
            deleted_count = len(response.data) if hasattr(response, "data") else 0
            logger.debug(f"Cleaned up {deleted_count} expired cache entries")
            return deleted_count
            
        except Exception as e:
            logger.error(f"Error cleaning up expired cache entries: {e}")
            return 0
