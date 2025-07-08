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
        try:
            redis_client = await self._get_redis()
            values = await redis_client.mget(keys)
            
            result = {}
            for key, value in zip(keys, values):
                if value:
                    result[key] = json.loads(value)
                    
            return result
        except Exception as e:
            logger.error(f"Failed to get multiple cache keys: {e}")
            return {}
    
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
            return bool(await redis_client.exists(key))
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
    
    async def get_coins_markets(self, vs_currency: str = "usd", page: int = 1) -> Optional[List[Dict]]:
        """
        Get cached coins market data
        
        Args:
            vs_currency: The target currency (e.g., usd, eur)
            page: Page number
            
        Returns:
            Cached coins market data or None
        """
        key = f"coingecko:markets:{vs_currency}:page:{page}"
        return await self.get(key)
    
    async def set_coins_markets(self, data: List[Dict], vs_currency: str = "usd", page: int = 1) -> bool:
        """
        Cache coins market data
        
        Args:
            data: Coins market data
            vs_currency: The target currency (e.g., usd, eur)
            page: Page number
            
        Returns:
            True if successful
        """
        key = f"coingecko:markets:{vs_currency}:page:{page}"
        # Cache for 5 minutes (300 seconds)
        return await self.set(key, data, 300)
    
    async def get_coin_data(self, coin_id: str) -> Optional[Dict]:
        """
        Get cached coin data
        
        Args:
            coin_id: Coin ID (e.g., bitcoin, ethereum)
            
        Returns:
            Cached coin data or None
        """
        key = f"coingecko:coin:{coin_id}"
        return await self.get(key)
    
    async def set_coin_data(self, coin_id: str, data: Dict) -> bool:
        """
        Cache coin data
        
        Args:
            coin_id: Coin ID (e.g., bitcoin, ethereum)
            data: Coin data
            
        Returns:
            True if successful
        """
        key = f"coingecko:coin:{coin_id}"
        # Cache for 5 minutes (300 seconds)
        return await self.set(key, data, 300)
    
    async def get_coin_history(self, coin_id: str, days: Union[int, str]) -> Optional[Dict]:
        """
        Get cached coin history data
        
        Args:
            coin_id: Coin ID (e.g., bitcoin, ethereum)
            days: Number of days (1, 7, 14, 30, 90, 180, 365, max)
            
        Returns:
            Cached coin history data or None
        """
        key = f"coingecko:history:{coin_id}:{days}"
        return await self.get(key)
    
    async def set_coin_history(self, coin_id: str, days: Union[int, str], data: Dict) -> bool:
        """
        Cache coin history data
        
        Args:
            coin_id: Coin ID (e.g., bitcoin, ethereum)
            days: Number of days (1, 7, 14, 30, 90, 180, 365, max)
            data: Coin history data
            
        Returns:
            True if successful
        """
        key = f"coingecko:history:{coin_id}:{days}"
        # Cache longer for historical data (1 hour = 3600 seconds)
        return await self.set(key, data, 3600)
    
    async def get_global_data(self) -> Optional[Dict]:
        """
        Get cached global cryptocurrency data
        
        Returns:
            Cached global data or None
        """
        key = "coingecko:global"
        return await self.get(key)
    
    async def set_global_data(self, data: Dict) -> bool:
        """
        Cache global cryptocurrency data
        
        Args:
            data: Global cryptocurrency data
            
        Returns:
            True if successful
        """
        key = "coingecko:global"
        # Cache for 15 minutes (900 seconds)
        return await self.set(key, data, 900)
