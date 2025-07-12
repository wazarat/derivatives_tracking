import redis.asyncio as redis
import json
import logging
from typing import Dict, List, Optional, Any, Union
import os
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class RedisCache:
    """
    Redis cache service for storing and retrieving cryptocurrency data
    """
    
    def __init__(self, url: Optional[str] = None, expiration_seconds: int = 300):
        """
        Initialize the Redis cache service
        
        Args:
            url: Redis connection URL (redis://user:password@host:port/db)
            expiration_seconds: Default cache expiration time in seconds
        """
        self.url = url or os.getenv("REDIS_URL", "redis://localhost:6379/0")
        self.expiration = expiration_seconds
        self._redis = None
        
    async def _get_redis(self) -> redis.Redis:
        """Get Redis connection"""
        if self._redis is None:
            try:
                self._redis = await redis.from_url(
                    self.url,
                    encoding="utf-8",
                    decode_responses=True
                )
                # Test connection
                await self._redis.ping()
                logger.info("Redis connection established")
            except Exception as e:
                logger.error(f"Failed to connect to Redis: {e}")
                raise
        return self._redis
    
    async def close(self):
        """Close Redis connection"""
        if self._redis:
            await self._redis.close()
            self._redis = None
    
    async def set(self, key: str, value: Any, expiration: Optional[int] = None) -> bool:
        """
        Set a value in the cache
        
        Args:
            key: Cache key
            value: Value to store (will be JSON serialized)
            expiration: Expiration time in seconds (None for default)
            
        Returns:
            True if successful
        """
        try:
            redis_client = await self._get_redis()
            json_value = json.dumps(value)
            exp = expiration if expiration is not None else self.expiration
            await redis_client.set(key, json_value, ex=exp)
            return True
        except Exception as e:
            logger.error(f"Failed to set cache key {key}: {e}")
            return False
    
    async def get(self, key: str) -> Optional[Any]:
        """
        Get a value from the cache
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found
        """
        try:
            redis_client = await self._get_redis()
            value = await redis_client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Failed to get cache key {key}: {e}")
            return None
    
    async def delete(self, key: str) -> bool:
        """
        Delete a value from the cache
        
        Args:
            key: Cache key
            
        Returns:
            True if successful
        """
        try:
            redis_client = await self._get_redis()
            await redis_client.delete(key)
            return True
        except Exception as e:
            logger.error(f"Failed to delete cache key {key}: {e}")
            return False
    
    async def set_many(self, items: Dict[str, Any], expiration: Optional[int] = None) -> bool:
        """
        Set multiple values in the cache
        
        Args:
            items: Dictionary of key-value pairs
            expiration: Expiration time in seconds (None for default)
            
        Returns:
            True if successful
        """
        try:
            redis_client = await self._get_redis()
            pipeline = redis_client.pipeline()
            exp = expiration if expiration is not None else self.expiration
            
            for key, value in items.items():
                json_value = json.dumps(value)
                pipeline.set(key, json_value, ex=exp)
                
            await pipeline.execute()
            return True
        except Exception as e:
            logger.error(f"Failed to set multiple cache keys: {e}")
            return False
    
    async def get_many(self, keys: List[str]) -> Dict[str, Any]:
        """
        Get multiple values from the cache
        
        Args:
            keys: List of cache keys
            
        Returns:
            Dictionary of key-value pairs (only for keys that exist)
        """
        result = {}
        try:
            redis_client = await self._get_redis()
            values = await redis_client.mget(keys)
            
            for key, value in zip(keys, values):
                if value:
                    result[key] = json.loads(value)
                    
            return result
        except Exception as e:
            logger.error(f"Failed to get multiple cache keys: {e}")
            return result
    
    async def exists(self, key: str) -> bool:
        """
        Check if a key exists in the cache
        
        Args:
            key: Cache key
            
        Returns:
            True if key exists
        """
        try:
            redis_client = await self._get_redis()
            return await redis_client.exists(key) > 0
        except Exception as e:
            logger.error(f"Failed to check if key {key} exists: {e}")
            return False
    
    async def get_ttl(self, key: str) -> Optional[int]:
        """
        Get the remaining TTL for a key
        
        Args:
            key: Cache key
            
        Returns:
            TTL in seconds or None if key doesn't exist
        """
        try:
            redis_client = await self._get_redis()
            ttl = await redis_client.ttl(key)
            return ttl if ttl > 0 else None
        except Exception as e:
            logger.error(f"Failed to get TTL for key {key}: {e}")
            return None
    
    # Cryptocurrency specific methods
    
    async def get_listings_latest(self, convert: str = "USD", limit: int = 100) -> Optional[Dict]:
        """
        Get cached listings latest data
        
        Args:
            convert: The target currency (e.g., USD, EUR)
            limit: Number of results to return
            
        Returns:
            Cached listings data or None
        """
        key = f"coinmarketcap:listings:{convert}:{limit}"
        return await self.get(key)
    
    async def set_listings_latest(self, data: Dict, convert: str = "USD", limit: int = 100) -> bool:
        """
        Cache listings latest data
        
        Args:
            data: Listings data
            convert: The target currency (e.g., USD, EUR)
            limit: Number of results
            
        Returns:
            True if successful
        """
        key = f"coinmarketcap:listings:{convert}:{limit}"
        # Cache for 5 minutes (300 seconds)
        return await self.set(key, data, 300)
    
    async def get_quotes_latest(self, symbol: str, convert: str = "USD") -> Optional[Dict]:
        """
        Get cached quotes latest data
        
        Args:
            symbol: Cryptocurrency symbol (e.g., BTC)
            convert: The target currency (e.g., USD, EUR)
            
        Returns:
            Cached quotes data or None
        """
        key = f"coinmarketcap:quotes:{symbol}:{convert}"
        return await self.get(key)
    
    async def set_quotes_latest(self, data: Dict, symbol: str, convert: str = "USD") -> bool:
        """
        Cache quotes latest data
        
        Args:
            data: Quotes data
            symbol: Cryptocurrency symbol (e.g., BTC)
            convert: The target currency (e.g., USD, EUR)
            
        Returns:
            True if successful
        """
        key = f"coinmarketcap:quotes:{symbol}:{convert}"
        # Cache for 5 minutes (300 seconds)
        return await self.set(key, data, 300)
    
    async def get_historical_quotes(self, symbol: str, time_period: str, convert: str = "USD") -> Optional[Dict]:
        """
        Get cached historical quotes data
        
        Args:
            symbol: Cryptocurrency symbol (e.g., BTC)
            time_period: Time period (e.g., 1d, 7d, 30d)
            convert: The target currency (e.g., USD, EUR)
            
        Returns:
            Cached historical quotes data or None
        """
        key = f"coinmarketcap:historical:{symbol}:{time_period}:{convert}"
        return await self.get(key)
    
    async def set_historical_quotes(self, data: Dict, symbol: str, time_period: str, convert: str = "USD") -> bool:
        """
        Cache historical quotes data
        
        Args:
            data: Historical quotes data
            symbol: Cryptocurrency symbol (e.g., BTC)
            time_period: Time period (e.g., 1d, 7d, 30d)
            convert: The target currency (e.g., USD, EUR)
            
        Returns:
            True if successful
        """
        key = f"coinmarketcap:historical:{symbol}:{time_period}:{convert}"
        # Cache longer for historical data (1 hour = 3600 seconds)
        return await self.set(key, data, 3600)
    
    async def get_global_metrics(self, convert: str = "USD") -> Optional[Dict]:
        """
        Get cached global cryptocurrency metrics
        
        Args:
            convert: The target currency (e.g., USD, EUR)
            
        Returns:
            Cached global metrics or None
        """
        key = f"coinmarketcap:global:{convert}"
        return await self.get(key)
    
    async def set_global_metrics(self, data: Dict, convert: str = "USD") -> bool:
        """
        Cache global cryptocurrency metrics
        
        Args:
            data: Global cryptocurrency metrics
            convert: The target currency (e.g., USD, EUR)
            
        Returns:
            True if successful
        """
        key = f"coinmarketcap:global:{convert}"
        # Cache for 15 minutes (900 seconds)
        return await self.set(key, data, 900)
