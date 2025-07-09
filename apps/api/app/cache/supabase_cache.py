import logging
import json
import time
from typing import Any, Dict, Optional
import os
from supabase import create_client, Client
from supabase.lib.client_options import ClientOptions

logger = logging.getLogger(__name__)

class SupabaseCache:
    """
    Cache implementation using Supabase with fallback to in-memory cache
    """
    
    def __init__(self):
        """
        Initialize the Supabase cache
        """
        self.supabase_url = os.environ.get("SUPABASE_URL", "")
        self.supabase_key = os.environ.get("SUPABASE_KEY", "")
        self.supabase_client = None
        self.memory_cache = {}  # Fallback in-memory cache
        self.is_initialized = False
    
    async def setup(self):
        """
        Set up the Supabase client
        """
        if self.is_initialized:
            return
        
        try:
            if self.supabase_url and self.supabase_key:
                # Try to create Supabase client
                try:
                    # First try with standard client creation
                    self.supabase_client = create_client(
                        self.supabase_url,
                        self.supabase_key
                    )
                    logger.info("Supabase cache initialized successfully")
                except TypeError as e:
                    # If we get a TypeError about 'proxy' argument, try with explicit ClientOptions
                    if "got an unexpected keyword argument 'proxy'" in str(e):
                        logger.warning("Falling back to direct SyncClient creation due to proxy argument error")
                        from supabase.lib.client_options import ClientOptions
                        from supabase.client import SyncClient
                        
                        options = ClientOptions(
                            schema="public",
                            headers={},
                            auto_refresh_token=True,
                            persist_session=True,
                            postgrest_client_timeout=60
                        )
                        
                        self.supabase_client = SyncClient(
                            self.supabase_url,
                            self.supabase_key,
                            options
                        )
                        logger.info("Supabase cache initialized with direct SyncClient")
                    else:
                        raise
            else:
                logger.warning("Supabase URL or key not provided, using in-memory cache only")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            logger.warning("Falling back to in-memory cache")
            self.supabase_client = None
        
        self.is_initialized = True
    
    async def get(self, key: str) -> Any:
        """
        Get a value from the cache
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found
        """
        await self.setup()
        
        try:
            # Try to get from Supabase first
            if self.supabase_client:
                try:
                    response = self.supabase_client.table("cache").select("value", "expires_at").eq("key", key).execute()
                    
                    if response.data and len(response.data) > 0:
                        item = response.data[0]
                        expires_at = item.get("expires_at")
                        
                        # Check if expired
                        if expires_at and expires_at < time.time():
                            # Expired, delete from Supabase
                            self.supabase_client.table("cache").delete().eq("key", key).execute()
                            logger.debug(f"Cache key '{key}' expired, deleted from Supabase")
                            return None
                        
                        # Not expired, return value
                        value_str = item.get("value")
                        if value_str:
                            try:
                                return json.loads(value_str)
                            except json.JSONDecodeError:
                                logger.error(f"Failed to decode JSON for key '{key}'")
                                return None
                except Exception as e:
                    logger.error(f"Error getting from Supabase cache: {e}")
            
            # Fall back to memory cache
            if key in self.memory_cache:
                item = self.memory_cache[key]
                expires_at = item.get("expires_at")
                
                # Check if expired
                if expires_at and expires_at < time.time():
                    # Expired, delete from memory
                    del self.memory_cache[key]
                    logger.debug(f"Cache key '{key}' expired, deleted from memory cache")
                    return None
                
                # Not expired, return value
                return item.get("value")
            
            # Not found in either cache
            return None
            
        except Exception as e:
            logger.error(f"Error in cache get operation: {e}")
            return None
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """
        Set a value in the cache
        
        Args:
            key: Cache key
            value: Value to cache
            ttl: Time to live in seconds (None for no expiration)
            
        Returns:
            True if successful, False otherwise
        """
        await self.setup()
        
        try:
            # Calculate expiration time
            expires_at = None
            if ttl is not None:
                expires_at = time.time() + ttl
            
            # Try to set in Supabase first
            if self.supabase_client:
                try:
                    # Convert value to JSON string
                    value_str = json.dumps(value)
                    
                    # Upsert to Supabase
                    data = {
                        "key": key,
                        "value": value_str,
                        "expires_at": expires_at
                    }
                    
                    self.supabase_client.table("cache").upsert(data).execute()
                    logger.debug(f"Cache key '{key}' set in Supabase")
                    return True
                except Exception as e:
                    logger.error(f"Error setting in Supabase cache: {e}")
            
            # Fall back to memory cache
            self.memory_cache[key] = {
                "value": value,
                "expires_at": expires_at
            }
            
            logger.debug(f"Cache key '{key}' set in memory cache")
            return True
            
        except Exception as e:
            logger.error(f"Error in cache set operation: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """
        Delete a value from the cache
        
        Args:
            key: Cache key
            
        Returns:
            True if successful, False otherwise
        """
        await self.setup()
        
        try:
            success = False
            
            # Try to delete from Supabase first
            if self.supabase_client:
                try:
                    self.supabase_client.table("cache").delete().eq("key", key).execute()
                    success = True
                    logger.debug(f"Cache key '{key}' deleted from Supabase")
                except Exception as e:
                    logger.error(f"Error deleting from Supabase cache: {e}")
            
            # Delete from memory cache
            if key in self.memory_cache:
                del self.memory_cache[key]
                success = True
                logger.debug(f"Cache key '{key}' deleted from memory cache")
            
            return success
            
        except Exception as e:
            logger.error(f"Error in cache delete operation: {e}")
            return False
    
    async def clear(self) -> bool:
        """
        Clear all values from the cache
        
        Returns:
            True if successful, False otherwise
        """
        await self.setup()
        
        try:
            success = False
            
            # Try to clear Supabase first
            if self.supabase_client:
                try:
                    self.supabase_client.table("cache").delete().neq("key", "dummy_key_that_doesnt_exist").execute()
                    success = True
                    logger.debug("Supabase cache cleared")
                except Exception as e:
                    logger.error(f"Error clearing Supabase cache: {e}")
            
            # Clear memory cache
            self.memory_cache = {}
            success = True
            logger.debug("Memory cache cleared")
            
            return success
            
        except Exception as e:
            logger.error(f"Error in cache clear operation: {e}")
            return False

# Create a singleton instance
_supabase_cache = None

async def get_supabase_cache() -> SupabaseCache:
    """
    Dependency that provides a SupabaseCache instance
    """
    global _supabase_cache
    if _supabase_cache is None:
        _supabase_cache = SupabaseCache()
        await _supabase_cache.setup()
    return _supabase_cache
