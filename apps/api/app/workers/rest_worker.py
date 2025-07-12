import logging
import asyncio
import httpx
from typing import Dict, Any, Optional, Union, List
import random

from app.utils.rate_limiter import rate_limiter

# Configure logging
logger = logging.getLogger(__name__)

class RESTWorker:
    """Base class for REST API workers with rate limiting and retry logic"""
    
    def __init__(self, service_name: str, base_url: str, headers: Optional[Dict[str, str]] = None):
        """
        Initialize the REST worker
        
        Args:
            service_name: Name of the service for rate limiting
            base_url: Base URL for API requests
            headers: Optional headers to include in all requests
        """
        self.service_name = service_name
        self.base_url = base_url
        self.headers = headers or {}
        self.client = httpx.AsyncClient(headers=self.headers, timeout=30.0)
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()
    
    @rate_limiter.with_retry("default")
    async def _request(
        self, 
        method: str, 
        endpoint: str, 
        params: Optional[Dict[str, Any]] = None,
        json_data: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None
    ) -> httpx.Response:
        """
        Make an HTTP request with rate limiting and retry logic
        
        Args:
            method: HTTP method (GET, POST, etc.)
            endpoint: API endpoint to call
            params: Optional query parameters
            json_data: Optional JSON data for request body
            headers: Optional additional headers
            
        Returns:
            httpx.Response object
        """
        url = f"{self.base_url}{endpoint}"
        
        # Merge headers
        request_headers = self.headers.copy()
        if headers:
            request_headers.update(headers)
        
        # Define retry status codes
        retry_status_codes = {429, 500, 502, 503, 504}
        max_retries = 5
        retry_count = 0
        
        while True:
            try:
                # Make the request
                response = await self.client.request(
                    method=method,
                    url=url,
                    params=params,
                    json=json_data,
                    headers=request_headers
                )
                
                # Check if we need to retry based on status code
                if response.status_code in retry_status_codes and retry_count < max_retries:
                    retry_count += 1
                    delay = self._calculate_backoff_delay(retry_count)
                    logger.warning(
                        f"{self.service_name} request to {url} returned status {response.status_code}, "
                        f"retrying in {delay:.2f}s (attempt {retry_count}/{max_retries})"
                    )
                    await asyncio.sleep(delay)
                    continue
                
                return response
                
            except httpx.RequestError as e:
                # Handle network-related errors
                if retry_count < max_retries:
                    retry_count += 1
                    delay = self._calculate_backoff_delay(retry_count)
                    logger.warning(
                        f"{self.service_name} request to {url} failed with {type(e).__name__}: {str(e)}, "
                        f"retrying in {delay:.2f}s (attempt {retry_count}/{max_retries})"
                    )
                    await asyncio.sleep(delay)
                else:
                    logger.error(
                        f"{self.service_name} request to {url} failed after {max_retries} retries: {str(e)}"
                    )
                    raise
    
    def _calculate_backoff_delay(self, attempt: int) -> float:
        """
        Calculate delay for retry attempt using exponential back-off with jitter
        
        Args:
            attempt: The current retry attempt number (1-based)
            
        Returns:
            Delay in seconds
        """
        # Base delay of 1 second
        base_delay = 1.0
        # Maximum delay of 60 seconds
        max_delay = 60.0
        # Jitter factor (25%)
        jitter = 0.25
        
        # Calculate exponential back-off
        delay = min(
            max_delay,
            base_delay * (2 ** (attempt - 1))
        )
        
        # Add random jitter
        jitter_amount = delay * jitter
        delay = delay + random.uniform(-jitter_amount, jitter_amount)
        
        # Ensure delay is positive
        return max(0.1, delay)
    
    @rate_limiter.with_retry("default")
    async def get(
        self, 
        endpoint: str, 
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Make a GET request
        
        Args:
            endpoint: API endpoint to call
            params: Optional query parameters
            headers: Optional additional headers
            
        Returns:
            Parsed JSON response
        """
        response = await self._request("GET", endpoint, params=params, headers=headers)
        response.raise_for_status()
        return response.json()
    
    @rate_limiter.with_retry("default")
    async def post(
        self, 
        endpoint: str, 
        json_data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Make a POST request
        
        Args:
            endpoint: API endpoint to call
            json_data: JSON data for request body
            params: Optional query parameters
            headers: Optional additional headers
            
        Returns:
            Parsed JSON response
        """
        response = await self._request(
            "POST", 
            endpoint, 
            params=params, 
            json_data=json_data, 
            headers=headers
        )
        response.raise_for_status()
        return response.json()

class CoinMarketCapRESTWorker(RESTWorker):
    """CoinMarketCap REST API worker with rate limiting"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the CoinMarketCap REST worker
        
        Args:
            api_key: CoinMarketCap API key (required)
        """
        headers = {"X-CMC_PRO_API_KEY": api_key} if api_key else {}
        
        super().__init__(
            service_name="coinmarketcap",
            base_url="https://pro-api.coinmarketcap.com/v1",
            headers=headers
        )
        
        if not api_key:
            logger.warning("No CoinMarketCap API key provided, requests will likely fail")
    
    @rate_limiter.with_retry("coinmarketcap")
    async def get_listings_latest(self, **params) -> Dict[str, Any]:
        """
        Get latest listings of all cryptocurrencies
        
        Args:
            **params: Additional parameters (start, limit, convert, etc.)
            
        Returns:
            Latest listings data
        """
        endpoint = "/cryptocurrency/listings/latest"
        return await self.get(endpoint, params=params)
    
    @rate_limiter.with_retry("coinmarketcap")
    async def get_quotes_latest(self, symbol: str, **params) -> Dict[str, Any]:
        """
        Get latest quotes for a specific cryptocurrency
        
        Args:
            symbol: Cryptocurrency symbol (e.g., BTC)
            **params: Additional parameters (convert, etc.)
            
        Returns:
            Latest quotes data
        """
        endpoint = "/cryptocurrency/quotes/latest"
        params = {
            "symbol": symbol,
            **params
        }
        return await self.get(endpoint, params=params)
    
    @rate_limiter.with_retry("coinmarketcap")
    async def get_global_metrics(self, **params) -> Dict[str, Any]:
        """
        Get global cryptocurrency market metrics
        
        Args:
            **params: Additional parameters (convert, etc.)
            
        Returns:
            Global metrics data
        """
        endpoint = "/global-metrics/quotes/latest"
        return await self.get(endpoint, params=params)
    
    @rate_limiter.with_retry("coinmarketcap")
    async def get_historical_quotes(self, symbol: str, **params) -> Dict[str, Any]:
        """
        Get historical quotes for a specific cryptocurrency
        
        Args:
            symbol: Cryptocurrency symbol (e.g., BTC)
            **params: Additional parameters (time_start, time_end, interval, etc.)
            
        Returns:
            Historical quotes data
        """
        endpoint = "/cryptocurrency/quotes/historical"
        params = {
            "symbol": symbol,
            **params
        }
        return await self.get(endpoint, params=params)

class HyperliquidRESTWorker(RESTWorker):
    """Hyperliquid REST API worker with rate limiting"""
    
    def __init__(self):
        """Initialize the Hyperliquid REST worker"""
        super().__init__(
            service_name="hyperliquid",
            base_url="https://api.hyperliquid.xyz/info",
            headers={"Content-Type": "application/json"}
        )
    
    @rate_limiter.with_retry("hyperliquid")
    async def get_all_mids(self) -> Dict[str, Any]:
        """
        Get all mid prices
        
        Returns:
            Dictionary of mid prices
        """
        return await self.post("/allMids", json_data={})
    
    @rate_limiter.with_retry("hyperliquid")
    async def get_meta(self) -> Dict[str, Any]:
        """
        Get metadata for all coins
        
        Returns:
            Metadata for all coins
        """
        return await self.post("/meta", json_data={})
    
    @rate_limiter.with_retry("hyperliquid")
    async def get_funding_history(self, coin: str) -> Dict[str, Any]:
        """
        Get funding rate history for a coin
        
        Args:
            coin: Coin symbol
            
        Returns:
            Funding rate history
        """
        return await self.post("/fundingHistory", json_data={"coin": coin})

class CoinbaseRESTWorker(RESTWorker):
    """Coinbase REST API worker with rate limiting"""
    
    def __init__(self):
        """Initialize the Coinbase REST worker"""
        super().__init__(
            service_name="coinbase",
            base_url="https://api.exchange.coinbase.com",
            headers={"Accept": "application/json"}
        )
    
    @rate_limiter.with_retry("coinbase")
    async def get_products(self) -> List[Dict[str, Any]]:
        """
        Get a list of available currency pairs for trading
        
        Returns:
            List of products
        """
        endpoint = "/products"
        return await self.get(endpoint)
    
    @rate_limiter.with_retry("coinbase")
    async def get_product_ticker(self, product_id: str) -> Dict[str, Any]:
        """
        Get snapshot information about the last trade (tick), best bid/ask and 24h volume
        
        Args:
            product_id: Product ID (e.g. BTC-USD)
            
        Returns:
            Product ticker data
        """
        endpoint = f"/products/{product_id}/ticker"
        return await self.get(endpoint)
    
    @rate_limiter.with_retry("coinbase")
    async def get_product_stats(self, product_id: str) -> Dict[str, Any]:
        """
        Get 24 hour stats for the product
        
        Args:
            product_id: Product ID (e.g. BTC-USD)
            
        Returns:
            Product stats
        """
        endpoint = f"/products/{product_id}/stats"
        return await self.get(endpoint)
