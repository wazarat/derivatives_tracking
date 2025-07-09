import aiohttp
import asyncio
import logging
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
import time
import json
from urllib.parse import urlencode

logger = logging.getLogger(__name__)

class CoinGeckoAdapter:
    """
    Adapter for interacting with the CoinGecko API
    """
    FREE_BASE_URL = "https://api.coingecko.com/api/v3"
    PRO_BASE_URL = "https://pro-api.coingecko.com/api/v3"
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the CoinGecko adapter
        
        Args:
            api_key: Optional API key for CoinGecko Pro (increases rate limits)
        """
        self.api_key = api_key or "CG-PH1JM3XpxRdGwmyCr66814mF"
        self.session = None
        self.rate_limit_remaining = 50  # Default rate limit for free tier
        self.rate_limit_reset_at = 0
        # Use Pro API URL since we're using a Pro API key (starting with CG-)
        self.BASE_URL = self.PRO_BASE_URL
        
    async def _ensure_session(self):
        """Ensure aiohttp session exists"""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(
                headers={
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "X-CG-Pro-API-Key": self.api_key
                }
            )
    
    async def close(self):
        """Close the aiohttp session"""
        if self.session and not self.session.closed:
            await self.session.close()
            self.session = None
    
    async def _handle_rate_limit(self):
        """Handle rate limiting by waiting if necessary"""
        now = time.time()
        if self.rate_limit_remaining <= 1 and now < self.rate_limit_reset_at:
            wait_time = self.rate_limit_reset_at - now + 1  # Add 1 second buffer
            logger.info(f"Rate limit reached, waiting for {wait_time:.2f} seconds")
            await asyncio.sleep(wait_time)
    
    async def _make_request(self, endpoint: str, params: Optional[Dict] = None) -> Dict:
        """
        Make a request to the CoinGecko API with rate limit handling and exponential backoff
        
        Args:
            endpoint: API endpoint (without base URL)
            params: Query parameters
            
        Returns:
            API response as dictionary
        """
        await self._ensure_session()
        await self._handle_rate_limit()
        
        url = f"{self.BASE_URL}/{endpoint}"
        if params:
            url = f"{url}?{urlencode(params)}"
        
        max_retries = 5
        retry_delay = 1
        
        for attempt in range(max_retries):
            try:
                async with self.session.get(url) as response:
                    # Update rate limit info from headers
                    if "x-ratelimit-remaining" in response.headers:
                        self.rate_limit_remaining = int(response.headers["x-ratelimit-remaining"])
                    if "x-ratelimit-reset" in response.headers:
                        self.rate_limit_reset_at = int(response.headers["x-ratelimit-reset"])
                    
                    if response.status == 429:  # Too Many Requests
                        retry_after = int(response.headers.get("retry-after", retry_delay))
                        logger.warning(f"Rate limited by CoinGecko, retrying after {retry_after} seconds")
                        await asyncio.sleep(retry_after)
                        continue
                        
                    if response.status == 200:
                        return await response.json()
                    
                    # Handle other errors
                    error_text = await response.text()
                    logger.error(f"CoinGecko API error: {response.status} - {error_text}")
                    response.raise_for_status()
                    
            except aiohttp.ClientError as e:
                if attempt < max_retries - 1:
                    wait = retry_delay * (2 ** attempt)  # Exponential backoff
                    logger.warning(f"Request failed: {e}. Retrying in {wait} seconds...")
                    await asyncio.sleep(wait)
                else:
                    logger.error(f"Failed after {max_retries} attempts: {e}")
                    raise
        
        raise Exception(f"Failed to get response from CoinGecko after {max_retries} attempts")
    
    async def get_ping(self) -> Dict:
        """Check API server status"""
        return await self._make_request("ping")
    
    async def get_coins_list(self) -> List[Dict]:
        """Get list of all supported coins with id, name, and symbol"""
        return await self._make_request("coins/list")
    
    async def get_coins_markets(
        self,
        vs_currency: str = "usd",
        ids: Optional[List[str]] = None,
        category: Optional[str] = None,
        order: str = "market_cap_desc",
        per_page: int = 100,
        page: int = 1,
        sparkline: bool = False,
        price_change_percentage: Optional[str] = None
    ) -> List[Dict]:
        """
        Get list of coins with market data
        
        Args:
            vs_currency: The target currency (e.g., usd, eur)
            ids: List of coin ids to filter by
            category: Filter by coin category
            order: Sort by field (market_cap_desc, volume_desc, etc.)
            per_page: Number of results per page (1-250)
            page: Page number
            sparkline: Include sparkline 7d data
            price_change_percentage: Include price change percentage for intervals (1h, 24h, 7d, etc.)
            
        Returns:
            List of coins with market data
        """
        params = {
            "vs_currency": vs_currency,
            "order": order,
            "per_page": per_page,
            "page": page,
            "sparkline": sparkline,
        }
        
        if ids:
            params["ids"] = ",".join(ids)
        if category:
            params["category"] = category
        if price_change_percentage:
            params["price_change_percentage"] = price_change_percentage
            
        return await self._make_request("coins/markets", params)
    
    async def get_coin_by_id(
        self,
        id: str,
        localization: bool = False,
        tickers: bool = True,
        market_data: bool = True,
        community_data: bool = False,
        developer_data: bool = False,
        sparkline: bool = False
    ) -> Dict:
        """
        Get current data for a coin by id
        
        Args:
            id: Coin id (e.g., bitcoin, ethereum)
            localization: Include localized data
            tickers: Include ticker data
            market_data: Include market data
            community_data: Include community data
            developer_data: Include developer data
            sparkline: Include sparkline 7d data
            
        Returns:
            Detailed coin data
        """
        params = {
            "localization": str(localization).lower(),
            "tickers": str(tickers).lower(),
            "market_data": str(market_data).lower(),
            "community_data": str(community_data).lower(),
            "developer_data": str(developer_data).lower(),
            "sparkline": str(sparkline).lower(),
        }
        
        return await self._make_request(f"coins/{id}", params)
    
    async def get_coin_market_chart(
        self,
        id: str,
        vs_currency: str = "usd",
        days: Union[int, str] = 1,
        interval: Optional[str] = None
    ) -> Dict:
        """
        Get historical market data for a coin
        
        Args:
            id: Coin id (e.g., bitcoin, ethereum)
            vs_currency: The target currency (e.g., usd, eur)
            days: Data up to number of days ago (1, 7, 14, 30, 90, 180, 365, max)
            interval: Data interval (daily, hourly, minutely)
            
        Returns:
            Historical market data (prices, market_caps, total_volumes)
        """
        params = {
            "vs_currency": vs_currency,
            "days": days,
        }
        
        if interval:
            params["interval"] = interval
            
        return await self._make_request(f"coins/{id}/market_chart", params)
    
    async def get_coin_ohlc(
        self,
        id: str,
        vs_currency: str = "usd",
        days: Union[int, str] = 1
    ) -> List[List[float]]:
        """
        Get coin OHLC data (Open, High, Low, Close)
        
        Args:
            id: Coin id (e.g., bitcoin, ethereum)
            vs_currency: The target currency (e.g., usd, eur)
            days: Data up to number of days ago (1, 7, 14, 30, 90, 180, 365)
            
        Returns:
            OHLC data as list of [timestamp, open, high, low, close]
        """
        params = {
            "vs_currency": vs_currency,
            "days": days,
        }
        
        return await self._make_request(f"coins/{id}/ohlc", params)
    
    async def get_global_data(self) -> Dict:
        """Get cryptocurrency global data"""
        result = await self._make_request("global")
        return result.get("data", {})
    
    async def map_coingecko_to_assets(self, coins_data: List[Dict]) -> List[Dict]:
        """
        Map CoinGecko coin data to our asset model format
        
        Args:
            coins_data: List of coin data from CoinGecko
            
        Returns:
            List of assets in our model format
        """
        assets = []
        
        for coin in coins_data:
            # Map sector based on CoinGecko categories
            # This is a simplified mapping - in production you'd want a more sophisticated approach
            sector = "native_crypto"  # Default
            if coin.get("categories"):
                categories = coin.get("categories", [])
                if any(c for c in categories if "stablecoin" in c.lower()):
                    sector = "stablecoins"
                elif any(c for c in categories if "defi" in c.lower()):
                    sector = "yield_protocols"
                # Add more mappings as needed
            
            # Map risk tier based on market cap and other factors
            # Again, this is simplified
            market_cap = coin.get("market_cap", 0)
            if market_cap > 50_000_000_000:  # $50B+
                risk_tier = 1  # CASH_CORE
            elif market_cap > 10_000_000_000:  # $10B+
                risk_tier = 2  # YIELD_PLUS
            elif market_cap > 1_000_000_000:  # $1B+
                risk_tier = 3  # MARKET_BETA
            elif market_cap > 100_000_000:  # $100M+
                risk_tier = 4  # TACTICAL_EDGE
            else:
                risk_tier = 5  # MOON_SHOT
                
            asset = {
                "id": coin.get("id"),
                "ticker": coin.get("symbol", "").upper(),
                "name": coin.get("name", ""),
                "sector": sector,
                "risk_tier": risk_tier,
                "logo_url": coin.get("image"),
                "website": coin.get("links", {}).get("homepage", [""])[0] if coin.get("links") else "",
                "description": coin.get("description", {}).get("en", "") if coin.get("description") else "",
                "is_active": True,
                "market_data": {
                    "price_usd": coin.get("current_price"),
                    "market_cap": coin.get("market_cap"),
                    "volume_24h": coin.get("total_volume"),
                    "price_change_24h": coin.get("price_change_percentage_24h"),
                    "price_change_7d": coin.get("price_change_percentage_7d_in_currency", {}).get("usd") if coin.get("price_change_percentage_7d_in_currency") else None,
                    "ath": coin.get("ath"),
                    "ath_date": coin.get("ath_date"),
                    "atl": coin.get("atl"),
                    "atl_date": coin.get("atl_date"),
                }
            }
            
            assets.append(asset)
            
        return assets
