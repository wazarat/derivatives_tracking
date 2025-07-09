import logging
import time
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)

class InMemoryCache:
    """
    Simple in-memory cache implementation
    """
    
    def __init__(self):
        """
        Initialize the in-memory cache
        """
        self.cache = {}
        self.is_initialized = True
        logger.info("In-memory cache initialized")
    
    async def setup(self):
        """
        Set up the cache (no-op for in-memory cache)
        """
        # Nothing to set up for in-memory cache
        pass
    
    async def get(self, key: str) -> Any:
        """
        Get a value from the cache
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found
        """
        try:
            if key in self.cache:
                item = self.cache[key]
                expires_at = item.get("expires_at")
                
                # Check if expired
                if expires_at and expires_at < time.time():
                    # Expired, delete from cache
                    del self.cache[key]
                    logger.debug(f"Cache key '{key}' expired, deleted from cache")
                    return None
                
                # Not expired, return value
                logger.debug(f"Cache hit for key '{key}'")
                return item.get("value")
            
            # Not found in cache
            logger.debug(f"Cache miss for key '{key}'")
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
        try:
            # Calculate expiration time
            expires_at = None
            if ttl is not None:
                expires_at = time.time() + ttl
            
            # Store in cache
            self.cache[key] = {
                "value": value,
                "expires_at": expires_at
            }
            
            logger.debug(f"Cache key '{key}' set")
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
        try:
            if key in self.cache:
                del self.cache[key]
                logger.debug(f"Cache key '{key}' deleted")
                return True
            
            logger.debug(f"Cache key '{key}' not found for deletion")
            return False
            
        except Exception as e:
            logger.error(f"Error in cache delete operation: {e}")
            return False
    
    async def clear(self) -> bool:
        """
        Clear all values from the cache
        
        Returns:
            True if successful, False otherwise
        """
        try:
            self.cache = {}
            logger.debug("Cache cleared")
            return True
            
        except Exception as e:
            logger.error(f"Error in cache clear operation: {e}")
            return False
