import logging
import time
from typing import Any, Dict, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class MemoryCache:
    """
    Simple in-memory cache implementation
    
    Stores data in memory with TTL support
    """
    
    def __init__(self):
        """
        Initialize the memory cache
        """
        self.cache = {}
        self.is_initialized = False
    
    async def setup(self):
        """
        Set up the memory cache
        """
        if not self.is_initialized:
            logger.info("Setting up memory cache")
            self.cache = {}
            self.is_initialized = True
            logger.info("Memory cache setup complete")
    
    async def get(self, key: str) -> Any:
        """
        Get a value from the cache
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found or expired
        """
        if not self.is_initialized:
            await self.setup()
        
        try:
            # Check if key exists
            if key not in self.cache:
                return None
            
            # Get cache item
            cache_item = self.cache[key]
            value = cache_item.get("value")
            expires_at = cache_item.get("expires_at")
            
            # Check if expired
            if expires_at and expires_at < datetime.utcnow():
                logger.debug(f"Cache key '{key}' has expired")
                await self.delete(key)
                return None
            
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
        if not self.is_initialized:
            await self.setup()
        
        try:
            # Calculate expiration time
            expires_at = None
            if ttl:
                expires_at = datetime.utcnow() + timedelta(seconds=ttl)
            
            # Store in cache
            self.cache[key] = {
                "value": value,
                "expires_at": expires_at
            }
            
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
        if not self.is_initialized:
            await self.setup()
        
        try:
            # Delete from cache if exists
            if key in self.cache:
                del self.cache[key]
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
        if not self.is_initialized:
            await self.setup()
        
        try:
            # Clear cache
            self.cache = {}
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
        if not self.is_initialized:
            await self.setup()
        
        try:
            # Find expired keys
            now = datetime.utcnow()
            expired_keys = [
                key for key, item in self.cache.items()
                if item.get("expires_at") and item["expires_at"] < now
            ]
            
            # Delete expired keys
            for key in expired_keys:
                del self.cache[key]
            
            deleted_count = len(expired_keys)
            logger.debug(f"Cleaned up {deleted_count} expired cache entries")
            return deleted_count
            
        except Exception as e:
            logger.error(f"Error cleaning up expired cache entries: {e}")
            return 0
