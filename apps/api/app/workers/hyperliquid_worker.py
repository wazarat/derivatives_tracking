import asyncio
import logging
import aiohttp
from typing import Dict, List, Any, Optional
from datetime import datetime
import time

from ..cache.memory_cache import InMemoryCache
from ..utils.rate_limiter import RateLimiter

# Configure logging
logger = logging.getLogger(__name__)

class HyperliquidWorker:
    """
    Worker for fetching market data from Hyperliquid via REST API
    
    Hyperliquid API documentation:
    https://hyperliquid.gitbook.io/hyperliquid-docs/
    """
    
    def __init__(self, cache: InMemoryCache):
        """
        Initialize the Hyperliquid worker
        
        Args:
            cache: Cache instance for storing fetched data
        """
        self.cache = cache
        self.base_url = "https://api.hyperliquid.xyz"
        self.session = None
        self.running = False
        self.rate_limiter = RateLimiter(max_calls=10, period=1)  # 10 calls per second
        
    async def setup(self):
        """Initialize the worker"""
        logger.info("Setting up Hyperliquid worker")
        self.session = aiohttp.ClientSession()
    
    async def fetch_markets(self) -> List[Dict[str, Any]]:
        """
        Fetch all available markets from Hyperliquid
        
        Returns:
            List of market data dictionaries
        """
        try:
            await self.rate_limiter.acquire()
            
            url = f"{self.base_url}/info"
            async with self.session.post(url, json={"type": "metaAndAssetCtxs"}) as response:
                if response.status != 200:
                    logger.error(f"Failed to fetch Hyperliquid markets: {response.status}")
                    return []
                
                data = await response.json()
                
                # Extract market data
                markets = []
                for coin in data.get("assetCtxs", []):
                    market = {
                        "symbol": coin.get("name"),
                        "base_currency": coin.get("name"),
                        "quote_currency": "USD",
                        "source": "hyperliquid",
                        "updated_at": datetime.utcnow().isoformat()
                    }
                    markets.append(market)
                
                return markets
        except Exception as e:
            logger.error(f"Error fetching Hyperliquid markets: {e}")
            return []
    
    async def fetch_market_data(self, symbol: str) -> Optional[Dict[str, Any]]:
        """
        Fetch market data for a specific symbol
        
        Args:
            symbol: Market symbol (e.g., "BTC")
            
        Returns:
            Market data dictionary or None if failed
        """
        try:
            await self.rate_limiter.acquire()
            
            url = f"{self.base_url}/info"
            async with self.session.post(url, json={"type": "allMids"}) as response:
                if response.status != 200:
                    logger.error(f"Failed to fetch Hyperliquid market data: {response.status}")
                    return None
                
                all_mids = await response.json()
                
                # Find the market data for the specified symbol
                for coin_data in all_mids:
                    if coin_data.get("coin") == symbol:
                        price = float(coin_data.get("mid", 0))
                        break
                else:
                    logger.warning(f"Symbol {symbol} not found in Hyperliquid market data")
                    return None
            
            # Fetch additional market data
            await self.rate_limiter.acquire()
            url = f"{self.base_url}/info"
            async with self.session.post(url, json={"type": "metaAndAssetCtxs"}) as response:
                if response.status != 200:
                    logger.error(f"Failed to fetch Hyperliquid asset contexts: {response.status}")
                    return None
                
                data = await response.json()
                
                # Find the asset context for the specified symbol
                asset_ctx = None
                for ctx in data.get("assetCtxs", []):
                    if ctx.get("name") == symbol:
                        asset_ctx = ctx
                        break
                
                if not asset_ctx:
                    logger.warning(f"Symbol {symbol} not found in Hyperliquid asset contexts")
                    return None
            
            # Fetch funding rate
            await self.rate_limiter.acquire()
            url = f"{self.base_url}/info"
            async with self.session.post(url, json={"type": "fundingHistory", "coin": symbol}) as response:
                if response.status != 200:
                    logger.error(f"Failed to fetch Hyperliquid funding rate: {response.status}")
                    funding_rate = 0
                else:
                    funding_data = await response.json()
                    funding_entries = funding_data.get("fundingHistory", [])
                    funding_rate = float(funding_entries[0].get("funding", 0)) if funding_entries else 0
            
            # Fetch open interest
            await self.rate_limiter.acquire()
            url = f"{self.base_url}/info"
            async with self.session.post(url, json={"type": "openInterest"}) as response:
                if response.status != 200:
                    logger.error(f"Failed to fetch Hyperliquid open interest: {response.status}")
                    open_interest = 0
                else:
                    oi_data = await response.json()
                    for oi_entry in oi_data:
                        if oi_entry.get("coin") == symbol:
                            open_interest = float(oi_entry.get("longOi", 0)) + float(oi_entry.get("shortOi", 0))
                            break
                    else:
                        open_interest = 0
            
            # Construct market data
            market_data = {
                "symbol": f"{symbol}-USD",
                "base_currency": symbol,
                "quote_currency": "USD",
                "price": price,
                "funding_rate": funding_rate,
                "open_interest": open_interest,
                "source": "hyperliquid",
                "updated_at": datetime.utcnow().isoformat()
            }
            
            return market_data
        except Exception as e:
            logger.error(f"Error fetching Hyperliquid market data for {symbol}: {e}")
            return None
    
    async def fetch_and_cache_all_markets(self):
        """Fetch and cache data for all available markets"""
        try:
            markets = await self.fetch_markets()
            if not markets:
                logger.warning("No markets found from Hyperliquid")
                return
            
            # Cache the list of markets
            self.cache.set("hyperliquid:markets", markets, ttl=3600)  # 1 hour TTL
            
            # Fetch detailed data for each market
            all_market_data = []
            for market in markets:
                symbol = market.get("symbol")
                if not symbol:
                    continue
                
                market_data = await self.fetch_market_data(symbol)
                if market_data:
                    all_market_data.append(market_data)
                    
                    # Cache individual market data
                    cache_key = f"hyperliquid:market:{symbol}"
                    self.cache.set(cache_key, market_data, ttl=300)  # 5 minutes TTL
                
                # Avoid rate limiting
                await asyncio.sleep(0.2)
            
            # Cache all market data
            self.cache.set("hyperliquid:all_markets", all_market_data, ttl=300)  # 5 minutes TTL
            
            logger.info(f"Cached data for {len(all_market_data)} Hyperliquid markets")
        except Exception as e:
            logger.error(f"Error in fetch_and_cache_all_markets: {e}")
    
    async def run_periodic_update(self, interval_seconds: int = 60):
        """
        Run periodic updates to fetch and cache market data
        
        Args:
            interval_seconds: Interval between updates in seconds
        """
        while self.running:
            try:
                await self.fetch_and_cache_all_markets()
            except Exception as e:
                logger.error(f"Error in periodic update: {e}")
            
            await asyncio.sleep(interval_seconds)
    
    async def start(self, interval_seconds: int = 60):
        """
        Start the worker
        
        Args:
            interval_seconds: Interval between updates in seconds
        """
        if self.running:
            logger.warning("Hyperliquid worker is already running")
            return
        
        self.running = True
        
        if not self.session:
            await self.setup()
        
        # Start periodic updates in background
        asyncio.create_task(self.run_periodic_update(interval_seconds))
        logger.info(f"Hyperliquid worker started with update interval of {interval_seconds} seconds")
    
    async def stop(self):
        """Stop the worker"""
        self.running = False
        
        if self.session:
            await self.session.close()
            self.session = None
        
        logger.info("Hyperliquid worker stopped")
