import logging
import asyncio
import time
import random
from typing import Dict, List, Any, Optional, Union
import aiohttp
from aiohttp.client_exceptions import ClientError

logger = logging.getLogger(__name__)

class CoinMarketCapAdapter:
    """
    Adapter for CoinMarketCap API
    
    Handles API requests, rate limiting, and error handling
    """
    
    BASE_URL = "https://pro-api.coinmarketcap.com/v1"
    
    # Rate limits for free tier: 30 calls/minute
    RATE_LIMIT = 30
    RATE_LIMIT_WINDOW = 60  # seconds
    
    def __init__(self, api_key: str):
        """
        Initialize the CoinMarketCap adapter
        
        Args:
            api_key: CoinMarketCap API key
        """
        self.api_key = api_key
        self.session = None
        self.request_timestamps = []
        self.last_request_time = 0
    
    async def setup(self):
        """
        Set up the adapter
        """
        if not self.session:
            logger.info("Setting up CoinMarketCap adapter")
            self.session = aiohttp.ClientSession(
                headers={
                    "X-CMC_PRO_API_KEY": self.api_key,
                    "Accept": "application/json"
                }
            )
    
    async def close(self):
        """
        Close the adapter
        """
        if self.session:
            logger.info("Closing CoinMarketCap adapter")
            await self.session.close()
            self.session = None
    
    async def _wait_for_rate_limit(self):
        """
        Wait if necessary to comply with rate limits
        """
        # Remove timestamps older than the rate limit window
        current_time = time.time()
        self.request_timestamps = [ts for ts in self.request_timestamps 
                                  if current_time - ts < self.RATE_LIMIT_WINDOW]
        
        # If we've reached the rate limit, wait until we can make another request
        if len(self.request_timestamps) >= self.RATE_LIMIT:
            oldest_timestamp = min(self.request_timestamps)
            sleep_time = self.RATE_LIMIT_WINDOW - (current_time - oldest_timestamp) + 1
            
            if sleep_time > 0:
                logger.warning(f"Rate limit reached, waiting {sleep_time:.2f} seconds")
                await asyncio.sleep(sleep_time)
        
        # Add a small delay between requests to avoid bursts
        elapsed_since_last = current_time - self.last_request_time
        if elapsed_since_last < 0.5 and self.last_request_time > 0:
            await asyncio.sleep(0.5 - elapsed_since_last)
    
    async def _request(self, method: str, endpoint: str, params: Optional[Dict] = None, 
                      retries: int = 3, backoff_factor: float = 1.5) -> Dict:
        """
        Make a request to the CoinMarketCap API with retry and backoff
        
        Args:
            method: HTTP method
            endpoint: API endpoint
            params: Query parameters
            retries: Number of retries
            backoff_factor: Backoff factor for retries
            
        Returns:
            API response
            
        Raises:
            Exception: If request fails after all retries
        """
        if not self.session:
            await self.setup()
        
        url = f"{self.BASE_URL}{endpoint}"
        
        for attempt in range(retries + 1):
            try:
                # Wait for rate limit if necessary
                await self._wait_for_rate_limit()
                
                # Record request timestamp
                current_time = time.time()
                self.request_timestamps.append(current_time)
                self.last_request_time = current_time
                
                # Make request
                logger.debug(f"Making {method} request to {endpoint}")
                
                if method.upper() == "GET":
                    async with self.session.get(url, params=params) as response:
                        response.raise_for_status()
                        data = await response.json()
                elif method.upper() == "POST":
                    async with self.session.post(url, json=params) as response:
                        response.raise_for_status()
                        data = await response.json()
                else:
                    raise ValueError(f"Unsupported HTTP method: {method}")
                
                # Check for API errors
                if "status" in data and data["status"].get("error_code") != 0:
                    error_message = data["status"].get("error_message", "Unknown API error")
                    error_code = data["status"].get("error_code", -1)
                    logger.error(f"API error {error_code}: {error_message}")
                    raise Exception(f"API error {error_code}: {error_message}")
                
                return data
                
            except (ClientError, asyncio.TimeoutError, Exception) as e:
                if attempt < retries:
                    # Calculate backoff time with jitter
                    backoff_time = backoff_factor ** attempt * (0.5 + random.random())
                    logger.warning(f"Request failed: {e}. Retrying in {backoff_time:.2f}s ({attempt+1}/{retries})")
                    await asyncio.sleep(backoff_time)
                else:
                    logger.error(f"Request failed after {retries} retries: {e}")
                    raise
    
    async def get_listings_latest(self, limit: int = 100, 
                                 convert: str = "USD") -> Dict:
        """
        Get latest cryptocurrency listings
        
        Args:
            limit: Number of cryptocurrencies to return
            convert: Currency to convert prices to
            
        Returns:
            Latest cryptocurrency listings
        """
        params = {
            "limit": limit,
            "convert": convert
        }
        
        return await self._request("GET", "/cryptocurrency/listings/latest", params)
    
    async def get_quotes_latest(self, symbol_list: List[str], 
                               convert: str = "USD") -> Dict:
        """
        Get latest quotes for specific cryptocurrencies
        
        Args:
            symbol_list: List of cryptocurrency symbols
            convert: Currency to convert prices to
            
        Returns:
            Latest cryptocurrency quotes
        """
        params = {
            "symbol": ",".join(symbol_list),
            "convert": convert
        }
        
        return await self._request("GET", "/cryptocurrency/quotes/latest", params)
    
    async def get_metadata(self, symbol_list: List[str]) -> Dict:
        """
        Get cryptocurrency metadata
        
        Args:
            symbol_list: List of cryptocurrency symbols
            
        Returns:
            Cryptocurrency metadata
        """
        params = {
            "symbol": ",".join(symbol_list)
        }
        
        return await self._request("GET", "/cryptocurrency/info", params)
    
    async def get_global_metrics(self, convert: str = "USD") -> Dict:
        """
        Get global cryptocurrency market metrics
        
        Args:
            convert: Currency to convert prices to
            
        Returns:
            Global cryptocurrency market metrics
        """
        params = {
            "convert": convert
        }
        
        return await self._request("GET", "/global-metrics/quotes/latest", params)
    
    async def get_derivatives_exchanges(self, limit: int = 100, convert: str = "USD") -> Dict:
        """
        Get derivatives exchanges data
        
        Args:
            limit: Number of exchanges to return
            convert: Currency to convert values to
            
        Returns:
            Derivatives exchanges data
        """
        params = {
            "limit": limit,
            "convert": convert
        }
        
        return await self._request("GET", "/derivatives/exchanges", params)
    
    async def get_historical_quotes(self, symbol: str, time_period: str = "24h", 
                                  interval: str = "1h", convert: str = "USD") -> Dict:
        """
        Get historical quotes for a specific cryptocurrency
        
        Args:
            symbol: Cryptocurrency symbol
            time_period: Time period (e.g., 24h, 7d, 30d, 90d, 365d)
            interval: Data interval (e.g., 1h, 1d)
            convert: Currency to convert prices to
            
        Returns:
            Historical quotes data
        """
        # Map time periods to count and interval
        time_map = {
            "24h": {"count": 24, "interval": "1h"},
            "7d": {"count": 7, "interval": "1d"},
            "30d": {"count": 30, "interval": "1d"},
            "90d": {"count": 90, "interval": "1d"},
            "365d": {"count": 365, "interval": "1d"}
        }
        
        # Override interval if specified in time_map
        if time_period in time_map:
            count = time_map[time_period]["count"]
            if not interval:
                interval = time_map[time_period]["interval"]
        else:
            # Default to 30 days if time_period not recognized
            count = 30
            interval = "1d"
        
        params = {
            "symbol": symbol,
            "count": count,
            "interval": interval,
            "convert": convert
        }
        
        return await self._request("GET", "/cryptocurrency/quotes/historical", params)
    
    async def get_historical_ohlcv(self, symbol: str, time_period: str = "24h", 
                                 interval: str = "1h", convert: str = "USD") -> Dict:
        """
        Get historical OHLCV (Open, High, Low, Close, Volume) data for a specific cryptocurrency
        
        Args:
            symbol: Cryptocurrency symbol
            time_period: Time period (e.g., 24h, 7d, 30d, 90d, 365d)
            interval: Data interval (e.g., 1h, 1d)
            convert: Currency to convert prices to
            
        Returns:
            Historical OHLCV data
        """
        # Map time periods to count and interval
        time_map = {
            "24h": {"count": 24, "interval": "1h"},
            "7d": {"count": 7, "interval": "1d"},
            "30d": {"count": 30, "interval": "1d"},
            "90d": {"count": 90, "interval": "1d"},
            "365d": {"count": 365, "interval": "1d"}
        }
        
        # Override interval if specified in time_map
        if time_period in time_map:
            count = time_map[time_period]["count"]
            if not interval:
                interval = time_map[time_period]["interval"]
        else:
            # Default to 30 days if time_period not recognized
            count = 30
            interval = "1d"
        
        params = {
            "symbol": symbol,
            "count": count,
            "interval": interval,
            "convert": convert
        }
        
        return await self._request("GET", "/cryptocurrency/ohlcv/historical", params)
    
    async def get_coin_details(self, symbol: str, convert: str = "USD") -> Dict:
        """
        Get detailed information for a specific cryptocurrency
        
        This combines data from quotes/latest and info endpoints to provide
        comprehensive metrics for a cryptocurrency
        
        Args:
            symbol: Cryptocurrency symbol
            convert: Currency to convert prices to
            
        Returns:
            Detailed cryptocurrency data
        """
        # Get quotes data
        quotes_data = await self.get_quotes_latest([symbol], convert)
        
        # Get metadata
        metadata = await self.get_metadata([symbol])
        
        # Combine the data
        result = {
            "quotes": quotes_data.get("data", {}),
            "metadata": metadata.get("data", {})
        }
        
        return result
