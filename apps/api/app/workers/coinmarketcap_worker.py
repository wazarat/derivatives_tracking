import logging
import os
import aiohttp
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime

from app.cache.memory_cache import InMemoryCache

logger = logging.getLogger(__name__)

class CoinMarketCapWorker:
    """
    Worker for fetching cryptocurrency data from CoinMarketCap API
    """
    
    def __init__(self):
        """
        Initialize the CoinMarketCap worker
        """
        self.api_key = os.environ.get("COINMARKETCAP_API_KEY", "")
        self.base_url = "https://pro-api.coinmarketcap.com/v1"
        self.cache = InMemoryCache()
        self.is_initialized = False
        
        # Cache keys
        self.LATEST_LISTINGS_KEY = "cmc:latest_listings"
        self.GLOBAL_METRICS_KEY = "cmc:global_metrics"
        self.METADATA_KEY_PREFIX = "cmc:metadata:"
        
        # Default TTL values (in seconds)
        self.DEFAULT_TTL = 300  # 5 minutes
        self.METADATA_TTL = 86400  # 24 hours
    
    async def setup(self):
        """
        Set up the worker
        """
        if self.is_initialized:
            return
        
        if not self.api_key:
            logger.warning("CoinMarketCap API key not provided")
        
        await self.cache.setup()
        self.is_initialized = True
    
    async def fetch_latest_listings(self, limit: int = 100) -> Dict[str, Any]:
        """
        Fetch latest cryptocurrency listings from CoinMarketCap
        
        Args:
            limit: Number of cryptocurrencies to fetch
            
        Returns:
            Dictionary containing the latest listings data
        """
        await self.setup()
        
        # Try to get from cache first
        cached_data = await self.cache.get(self.LATEST_LISTINGS_KEY)
        if cached_data:
            logger.debug("Using cached latest listings data")
            return cached_data
        
        # Not in cache, fetch from API
        endpoint = f"{self.base_url}/cryptocurrency/listings/latest"
        params = {
            "limit": limit,
            "convert": "USD"
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "X-CMC_PRO_API_KEY": self.api_key,
                    "Accept": "application/json"
                }
                
                async with session.get(endpoint, params=params, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        # Cache the data
                        await self.cache.set(self.LATEST_LISTINGS_KEY, data, self.DEFAULT_TTL)
                        
                        logger.info(f"Successfully fetched latest listings data for {limit} cryptocurrencies")
                        return data
                    else:
                        error_text = await response.text()
                        logger.error(f"Failed to fetch latest listings: {response.status} - {error_text}")
                        return {}
        except Exception as e:
            logger.error(f"Error fetching latest listings: {e}")
            return {}
    
    async def fetch_global_metrics(self) -> Dict[str, Any]:
        """
        Fetch global cryptocurrency market metrics from CoinMarketCap
        
        Returns:
            Dictionary containing the global metrics data
        """
        await self.setup()
        
        # Try to get from cache first
        cached_data = await self.cache.get(self.GLOBAL_METRICS_KEY)
        if cached_data:
            logger.debug("Using cached global metrics data")
            return cached_data
        
        # Not in cache, fetch from API
        endpoint = f"{self.base_url}/global-metrics/quotes/latest"
        
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "X-CMC_PRO_API_KEY": self.api_key,
                    "Accept": "application/json"
                }
                
                async with session.get(endpoint, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        # Cache the data
                        await self.cache.set(self.GLOBAL_METRICS_KEY, data, self.DEFAULT_TTL)
                        
                        logger.info("Successfully fetched global metrics data")
                        return data
                    else:
                        error_text = await response.text()
                        logger.error(f"Failed to fetch global metrics: {response.status} - {error_text}")
                        return {}
        except Exception as e:
            logger.error(f"Error fetching global metrics: {e}")
            return {}
    
    async def fetch_metadata(self, symbol_or_id: str) -> Dict[str, Any]:
        """
        Fetch metadata for a specific cryptocurrency
        
        Args:
            symbol_or_id: Symbol or ID of the cryptocurrency
            
        Returns:
            Dictionary containing the metadata
        """
        await self.setup()
        
        # Try to get from cache first
        cache_key = f"{self.METADATA_KEY_PREFIX}{symbol_or_id}"
        cached_data = await self.cache.get(cache_key)
        if cached_data:
            logger.debug(f"Using cached metadata for {symbol_or_id}")
            return cached_data
        
        # Not in cache, fetch from API
        endpoint = f"{self.base_url}/cryptocurrency/info"
        
        # Determine if symbol_or_id is a symbol or ID
        params = {}
        if symbol_or_id.isdigit():
            params["id"] = symbol_or_id
        else:
            params["symbol"] = symbol_or_id
        
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "X-CMC_PRO_API_KEY": self.api_key,
                    "Accept": "application/json"
                }
                
                async with session.get(endpoint, params=params, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        # Cache the data
                        await self.cache.set(cache_key, data, self.METADATA_TTL)
                        
                        logger.info(f"Successfully fetched metadata for {symbol_or_id}")
                        return data
                    else:
                        error_text = await response.text()
                        logger.error(f"Failed to fetch metadata for {symbol_or_id}: {response.status} - {error_text}")
                        return {}
        except Exception as e:
            logger.error(f"Error fetching metadata for {symbol_or_id}: {e}")
            return {}
    
    async def fetch_and_update(self):
        """
        Fetch and update all cryptocurrency data
        """
        await self.setup()
        
        logger.info("Starting CoinMarketCap data fetch and update")
        
        try:
            # Fetch latest listings
            listings_data = await self.fetch_latest_listings()
            
            # Fetch global metrics
            global_metrics = await self.fetch_global_metrics()
            
            # Log success
            if listings_data and global_metrics:
                logger.info("Successfully fetched and updated all CoinMarketCap data")
                return True
            else:
                logger.warning("Partially failed to fetch and update CoinMarketCap data")
                return False
        except Exception as e:
            logger.error(f"Error in fetch_and_update: {e}")
            return False
    
    async def get_top_cryptocurrencies(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get the top cryptocurrencies by market cap
        
        Args:
            limit: Number of cryptocurrencies to return
            
        Returns:
            List of cryptocurrency data
        """
        await self.setup()
        
        try:
            # Get latest listings
            listings_data = await self.fetch_latest_listings(limit)
            
            if not listings_data or "data" not in listings_data:
                logger.error("Failed to get top cryptocurrencies: No data available")
                return []
            
            # Extract and format the data
            cryptocurrencies = []
            for crypto in listings_data["data"]:
                quote = crypto.get("quote", {}).get("USD", {})
                
                cryptocurrencies.append({
                    "id": crypto.get("id"),
                    "name": crypto.get("name"),
                    "symbol": crypto.get("symbol"),
                    "price": quote.get("price"),
                    "percent_change_24h": quote.get("percent_change_24h"),
                    "volume_24h": quote.get("volume_24h"),
                    "market_cap": quote.get("market_cap"),
                    "last_updated": quote.get("last_updated")
                })
            
            return cryptocurrencies
        except Exception as e:
            logger.error(f"Error getting top cryptocurrencies: {e}")
            return []
    
    async def get_market_overview(self) -> Dict[str, Any]:
        """
        Get market overview data
        
        Returns:
            Dictionary containing market overview data
        """
        await self.setup()
        
        try:
            # Get global metrics
            global_metrics = await self.fetch_global_metrics()
            
            if not global_metrics or "data" not in global_metrics:
                logger.error("Failed to get market overview: No data available")
                return {}
            
            # Extract and format the data
            data = global_metrics["data"]
            quote = data.get("quote", {}).get("USD", {})
            
            overview = {
                "total_market_cap": quote.get("total_market_cap"),
                "total_volume_24h": quote.get("total_volume_24h"),
                "btc_dominance": data.get("btc_dominance"),
                "eth_dominance": data.get("eth_dominance"),
                "active_cryptocurrencies": data.get("active_cryptocurrencies"),
                "last_updated": data.get("last_updated")
            }
            
            return overview
        except Exception as e:
            logger.error(f"Error getting market overview: {e}")
            return {}

    async def get_crypto_metrics(self, symbol: str) -> Dict[str, Any]:
        """
        Get detailed metrics for a specific cryptocurrency
        
        Args:
            symbol: Symbol of the cryptocurrency (e.g., BTC, ETH)
            
        Returns:
            Dictionary containing detailed metrics
        """
        await self.setup()
        
        try:
            # Initialize CoinMarketCap adapter
            from ..adapters.coinmarketcap import CoinMarketCapAdapter
            adapter = CoinMarketCapAdapter(self.api_key)
            await adapter.setup()
            
            # Get detailed coin data
            coin_data = await adapter.get_coin_details(symbol)
            
            if not coin_data or not coin_data.get("quotes") or not coin_data.get("metadata"):
                logger.error(f"Failed to get metrics for {symbol}: No data available")
                return {}
            
            # Extract quotes data
            quotes = coin_data["quotes"].get(symbol, {})
            quote = quotes.get("quote", {}).get("USD", {})
            
            # Extract metadata
            metadata = coin_data["metadata"].get(symbol, {})
            
            # Format the metrics
            metrics = {
                "symbol": symbol,
                "name": quotes.get("name") or metadata.get("name", ""),
                "price": quote.get("price"),
                "price_change_24h": quote.get("percent_change_24h"),
                "market_cap": quote.get("market_cap"),
                "market_cap_rank": quotes.get("cmc_rank"),
                "total_volume": quote.get("volume_24h"),
                "high_24h": None,  # Not directly available from CMC API
                "low_24h": None,   # Not directly available from CMC API
                "circulating_supply": quotes.get("circulating_supply"),
                "total_supply": quotes.get("total_supply"),
                "max_supply": quotes.get("max_supply"),
                "ath": None,  # Not directly available from CMC API
                "ath_change_percentage": None,  # Not directly available from CMC API
                "ath_date": None,  # Not directly available from CMC API
                "atl": None,  # Not directly available from CMC API
                "atl_change_percentage": None,  # Not directly available from CMC API
                "atl_date": None,  # Not directly available from CMC API
                "last_updated": quote.get("last_updated"),
                "price_change_percentage_1h": quote.get("percent_change_1h"),
                "price_change_percentage_7d": quote.get("percent_change_7d"),
                "price_change_percentage_14d": None,  # Not directly available from CMC API
                "price_change_percentage_30d": quote.get("percent_change_30d"),
                "price_change_percentage_200d": None,  # Not directly available from CMC API
                "price_change_percentage_1y": None,  # Not directly available from CMC API
                "market_cap_change_24h": None,  # Not directly available from CMC API
                "market_cap_change_percentage_24h": quote.get("market_cap_change_24h")
            }
            
            # Add additional metadata
            metrics["description"] = metadata.get("description")
            metrics["logo"] = metadata.get("logo")
            metrics["website"] = metadata.get("urls", {}).get("website", [None])[0]
            metrics["twitter"] = metadata.get("urls", {}).get("twitter", [None])[0]
            metrics["reddit"] = metadata.get("urls", {}).get("reddit", [None])[0]
            metrics["github"] = metadata.get("urls", {}).get("source_code", [None])[0]
            
            await adapter.close()
            return metrics
            
        except Exception as e:
            logger.error(f"Error getting metrics for {symbol}: {e}")
            return {}
    
    async def get_crypto_history(self, symbol: str, days: int = 30, interval: str = None) -> Dict[str, Any]:
        """
        Get historical data for a specific cryptocurrency
        
        Args:
            symbol: Symbol of the cryptocurrency (e.g., BTC, ETH)
            days: Number of days of history to return (1-365)
            interval: Data interval (e.g., 1h, 1d)
            
        Returns:
            Dictionary containing historical data
        """
        await self.setup()
        
        try:
            # Map days to time_period
            time_period = "30d"  # Default
            if days <= 1:
                time_period = "24h"
            elif days <= 7:
                time_period = "7d"
            elif days <= 30:
                time_period = "30d"
            elif days <= 90:
                time_period = "90d"
            else:
                time_period = "365d"
            
            # Map interval
            cmc_interval = "1d"  # Default
            if interval == "hourly":
                cmc_interval = "1h"
            elif interval == "daily":
                cmc_interval = "1d"
            
            # Initialize CoinMarketCap adapter
            from ..adapters.coinmarketcap import CoinMarketCapAdapter
            adapter = CoinMarketCapAdapter(self.api_key)
            await adapter.setup()
            
            # Get historical OHLCV data
            historical_data = await adapter.get_historical_ohlcv(
                symbol=symbol,
                time_period=time_period,
                interval=cmc_interval
            )
            
            if not historical_data or "data" not in historical_data:
                logger.error(f"Failed to get history for {symbol}: No data available")
                return {}
            
            # Process the data
            quotes = historical_data.get("data", {}).get("quotes", [])
            
            price_history = []
            volume_history = []
            market_cap_history = []
            
            for quote in quotes:
                timestamp = int(datetime.fromisoformat(quote.get("timestamp").replace("Z", "+00:00")).timestamp())
                quote_data = quote.get("quote", {}).get("USD", {})
                
                price_history.append({
                    "timestamp": timestamp,
                    "value": quote_data.get("close")
                })
                
                volume_history.append({
                    "timestamp": timestamp,
                    "value": quote_data.get("volume")
                })
                
                # Market cap might not be directly available
                if "market_cap" in quote_data:
                    market_cap_history.append({
                        "timestamp": timestamp,
                        "value": quote_data.get("market_cap")
                    })
            
            # Get metadata for name
            metadata = await adapter.get_metadata([symbol])
            name = metadata.get("data", {}).get(symbol, {}).get("name", symbol)
            
            result = {
                "symbol": symbol,
                "name": name,
                "interval": interval or "auto",
                "days": days,
                "price_history": price_history,
                "volume_history": volume_history,
                "market_cap_history": market_cap_history,
                "last_updated": datetime.utcnow().isoformat()
            }
            
            await adapter.close()
            return result
            
        except Exception as e:
            logger.error(f"Error getting history for {symbol}: {e}")
            return {}
