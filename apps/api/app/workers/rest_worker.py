import logging
import asyncio
import httpx
from typing import Dict, Any, Optional, Union, List

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
        
        # Make the request
        response = await self.client.request(
            method=method,
            url=url,
            params=params,
            json=json_data,
            headers=request_headers
        )
        
        return response
    
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

class CoinGeckoRESTWorker(RESTWorker):
    """CoinGecko REST API worker with rate limiting"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the CoinGecko REST worker
        
        Args:
            api_key: Optional CoinGecko API key
        """
        headers = {}
        if api_key:
            headers["X-CoinGecko-Api-Key"] = api_key
            
        super().__init__(
            service_name="coingecko",
            base_url="https://api.coingecko.com/api/v3",
            headers=headers
        )
    
    @rate_limiter.with_retry("coingecko")
    async def get_coins_markets(self, vs_currency: str = "usd", **params) -> List[Dict[str, Any]]:
        """
        Get cryptocurrency prices, market cap, volume, and market related data
        
        Args:
            vs_currency: The target currency of market data (usd, eur, jpy, etc.)
            **params: Additional parameters
            
        Returns:
            List of coin market data
        """
        endpoint = "/coins/markets"
        params = {
            "vs_currency": vs_currency,
            **params
        }
        
        return await self.get(endpoint, params=params)
    
    @rate_limiter.with_retry("coingecko")
    async def get_coin_by_id(self, coin_id: str, **params) -> Dict[str, Any]:
        """
        Get current data for a coin
        
        Args:
            coin_id: Pass the coin id (e.g. bitcoin)
            **params: Additional parameters
            
        Returns:
            Coin data
        """
        endpoint = f"/coins/{coin_id}"
        return await self.get(endpoint, params=params)
    
    @rate_limiter.with_retry("coingecko")
    async def get_trending(self) -> Dict[str, Any]:
        """
        Get trending search coins (top-7) on CoinGecko in the last 24 hours
        
        Returns:
            Trending coins data
        """
        endpoint = "/search/trending"
        return await self.get(endpoint)

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
