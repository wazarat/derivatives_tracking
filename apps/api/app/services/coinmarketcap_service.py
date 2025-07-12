import logging
from typing import Dict, List, Optional, Any, Union
import uuid
from datetime import datetime, timedelta

from ..adapters.coinmarketcap import CoinMarketCapAdapter
from ..adapters.supabase_cache import SupabaseCache
from ..models import Asset, AssetMetric, Sector, RiskTier
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

logger = logging.getLogger(__name__)

class CoinMarketCapService:
    """
    Service for fetching cryptocurrency data from CoinMarketCap with Supabase caching
    """
    
    def __init__(self, db: AsyncSession, cache: Optional[SupabaseCache] = None, adapter: Optional[CoinMarketCapAdapter] = None):
        """
        Initialize the CoinMarketCap service
        
        Args:
            db: Database session
            cache: Supabase cache service (optional)
            adapter: CoinMarketCap adapter (optional)
        """
        self.db = db
        self.cache = cache or SupabaseCache()
        self.adapter = adapter or CoinMarketCapAdapter(api_key=None)  # API key should be set in the adapter
    
    async def close(self):
        """Close connections"""
        await self.adapter.close()
        await self.cache.close()
    
    async def get_listings_latest(
        self,
        limit: int = 100,
        convert: str = "USD",
        use_cache: bool = True
    ) -> List[Dict]:
        """
        Get latest cryptocurrency listings, using cache if available
        
        Args:
            limit: Number of cryptocurrencies to return (1-5000)
            convert: The target currency (e.g., USD, EUR)
            use_cache: Whether to use cached data if available
            
        Returns:
            List of cryptocurrencies with market data
        """
        # Try to get from cache first
        if use_cache:
            cached_data = await self.cache.get_listings_latest(convert, limit)
            if cached_data:
                logger.info(f"Using cached listings data for {convert} limit {limit}")
                return cached_data
        
        # Fetch from API
        logger.info(f"Fetching listings data from CoinMarketCap for {convert} limit {limit}")
        data = await self.adapter.get_listings_latest(
            limit=limit,
            convert=convert
        )
        
        # Cache the result
        await self.cache.set_listings_latest(data, convert, limit)
        
        return data.get("data", [])
    
    async def get_quotes_latest(
        self,
        symbol: str,
        convert: str = "USD",
        use_cache: bool = True
    ) -> Dict:
        """
        Get latest quotes for a specific cryptocurrency, using cache if available
        
        Args:
            symbol: Cryptocurrency symbol (e.g., BTC, ETH)
            convert: The target currency (e.g., USD, EUR)
            use_cache: Whether to use cached data if available
            
        Returns:
            Latest quotes data for the cryptocurrency
        """
        # Try to get from cache first
        if use_cache:
            cached_data = await self.cache.get_quotes_latest(symbol, convert)
            if cached_data:
                logger.info(f"Using cached quotes data for {symbol} in {convert}")
                return cached_data
        
        # Fetch from API
        logger.info(f"Fetching quotes data from CoinMarketCap for {symbol} in {convert}")
        data = await self.adapter.get_quotes_latest(
            symbol_list=[symbol],
            convert=convert
        )
        
        # Cache the result
        await self.cache.set_quotes_latest(data, symbol, convert)
        
        return data.get("data", {}).get(symbol, {})
    
    async def get_historical_quotes(
        self,
        symbol: str,
        time_period: str = "24h",
        interval: str = "1h",
        convert: str = "USD",
        use_cache: bool = True
    ) -> Dict:
        """
        Get historical quotes for a specific cryptocurrency, using cache if available
        
        Args:
            symbol: Cryptocurrency symbol (e.g., BTC, ETH)
            time_period: Time period (e.g., 24h, 7d, 30d, 90d, 365d)
            interval: Data interval (e.g., 1h, 1d)
            convert: The target currency (e.g., USD, EUR)
            use_cache: Whether to use cached data if available
            
        Returns:
            Historical quotes data for the cryptocurrency
        """
        # Try to get from cache first
        if use_cache:
            cached_data = await self.cache.get_historical_quotes(symbol, time_period, convert)
            if cached_data:
                logger.info(f"Using cached historical quotes for {symbol} ({time_period}) in {convert}")
                return cached_data
        
        # Fetch from API
        logger.info(f"Fetching historical quotes from CoinMarketCap for {symbol} ({time_period}) in {convert}")
        data = await self.adapter.get_historical_quotes(
            symbol=symbol,
            time_period=time_period,
            interval=interval,
            convert=convert
        )
        
        # Cache the result
        await self.cache.set_historical_quotes(data, symbol, time_period, convert)
        
        return data.get("data", {})
    
    async def get_global_metrics(
        self,
        convert: str = "USD",
        use_cache: bool = True
    ) -> Dict:
        """
        Get global cryptocurrency market metrics, using cache if available
        
        Args:
            convert: The target currency (e.g., USD, EUR)
            use_cache: Whether to use cached data if available
            
        Returns:
            Global cryptocurrency market metrics
        """
        # Try to get from cache first
        if use_cache:
            cached_data = await self.cache.get_global_metrics(convert)
            if cached_data:
                logger.info(f"Using cached global metrics in {convert}")
                return cached_data
        
        # Fetch from API
        logger.info(f"Fetching global metrics from CoinMarketCap in {convert}")
        data = await self.adapter.get_global_metrics(
            convert=convert
        )
        
        # Cache the result
        await self.cache.set_global_metrics(data, convert)
        
        return data.get("data", {})
    
    async def get_coin_details(
        self,
        symbol: str,
        convert: str = "USD",
        use_cache: bool = True
    ) -> Dict:
        """
        Get detailed information for a specific cryptocurrency, using cache if available
        
        Args:
            symbol: Cryptocurrency symbol (e.g., BTC, ETH)
            convert: The target currency (e.g., USD, EUR)
            use_cache: Whether to use cached data if available
            
        Returns:
            Detailed cryptocurrency data
        """
        # Try to get from cache first
        if use_cache:
            cached_data = await self.cache.get_coin_details(symbol, convert)
            if cached_data:
                logger.info(f"Using cached coin details for {symbol} in {convert}")
                return cached_data
        
        # Fetch from API
        logger.info(f"Fetching coin details from CoinMarketCap for {symbol} in {convert}")
        data = await self.adapter.get_coin_details(
            symbol=symbol,
            convert=convert
        )
        
        # Cache the result
        await self.cache.set_coin_details(data, symbol, convert)
        
        return data.get("data", {})
    
    async def get_quote(
        self,
        symbol: str,
        convert: str = "USD",
        use_cache: bool = True
    ) -> Dict:
        """
        Get latest quote for a specific cryptocurrency, using cache if available
        
        Args:
            symbol: Cryptocurrency symbol (e.g., BTC, ETH)
            convert: The target currency (e.g., USD, EUR)
            use_cache: Whether to use cached data if available
            
        Returns:
            Latest quote data for the cryptocurrency
        """
        # Try to get from cache first
        cache_key = f"quote:{symbol.lower()}:{convert.lower()}"
        if use_cache:
            cached_data = await self.cache.get(cache_key)
            if cached_data:
                logger.info(f"Using cached quote data for {symbol} in {convert}")
                return cached_data
        
        # Fetch from API
        logger.info(f"Fetching quote data from CoinMarketCap for {symbol} in {convert}")
        data = await self.adapter.get_quotes_latest(
            symbol_list=[symbol],
            convert=convert
        )
        
        # Cache the result
        await self.cache.set(cache_key, data.get("data", {}), ttl=300)  # Cache for 5 minutes
        
        return data.get("data", {})
    
    async def get_metadata(
        self,
        symbol: str,
        use_cache: bool = True
    ) -> Dict:
        """
        Get metadata for a specific cryptocurrency, using cache if available
        
        Args:
            symbol: Cryptocurrency symbol (e.g., BTC, ETH)
            use_cache: Whether to use cached data if available
            
        Returns:
            Metadata for the cryptocurrency
        """
        # Try to get from cache first
        cache_key = f"metadata:{symbol.lower()}"
        if use_cache:
            cached_data = await self.cache.get(cache_key)
            if cached_data:
                logger.info(f"Using cached metadata for {symbol}")
                return cached_data
        
        # Fetch from API
        logger.info(f"Fetching metadata from CoinMarketCap for {symbol}")
        data = await self.adapter.get_metadata(
            symbol_list=[symbol]
        )
        
        # Cache the result
        await self.cache.set(cache_key, data.get("data", {}), ttl=86400)  # Cache for 24 hours
        
        return data.get("data", {})
    
    async def get_trending_markets(
        self,
        limit: int = 10,
        convert: str = "USD",
        use_cache: bool = True
    ) -> List[Dict]:
        """
        Get trending markets based on 24h price change, using cache if available
        
        Args:
            limit: Number of trending markets to return
            convert: The target currency (e.g., USD, EUR)
            use_cache: Whether to use cached data if available
            
        Returns:
            List of trending markets
        """
        # Try to get from cache first
        cache_key = f"trending_markets:{limit}:{convert.lower()}"
        if use_cache:
            cached_data = await self.cache.get(cache_key)
            if cached_data:
                logger.info(f"Using cached trending markets data for {convert}")
                return cached_data
        
        # Fetch from API
        logger.info(f"Fetching trending markets data from CoinMarketCap")
        
        # Get latest listings with a higher limit to filter
        listings = await self.get_listings_latest(
            limit=100,  # Get more than needed to filter
            convert=convert,
            use_cache=use_cache
        )
        
        # Sort by 24h percent change (absolute value, to get both gainers and losers)
        sorted_listings = sorted(
            listings,
            key=lambda x: abs(x.get("quote", {}).get("USD", {}).get("percent_change_24h", 0) or 0),
            reverse=True
        )
        
        # Take the top N
        trending = sorted_listings[:limit]
        
        # Format the response
        trending_list = []
        for crypto in trending:
            quote = crypto.get("quote", {}).get("USD", {})
            
            trending_list.append({
                "id": str(crypto.get("id")),
                "ticker": crypto.get("symbol"),
                "name": crypto.get("name"),
                "logo_url": f"https://s2.coinmarketcap.com/static/img/coins/64x64/{crypto.get('id')}.png",
                "price_usd": quote.get("price"),
                "price_change_24h": quote.get("percent_change_24h"),
                "market_cap": quote.get("market_cap"),
                "volume_24h": quote.get("volume_24h"),
                "last_updated": quote.get("last_updated")
            })
        
        # Cache the result
        await self.cache.set(cache_key, trending_list, ttl=300)  # Cache for 5 minutes
        
        return trending_list
    
    async def sync_assets_to_db(self, limit: int = 250) -> int:
        """
        Sync top cryptocurrency assets from CoinMarketCap to the database
        
        Args:
            limit: Maximum number of assets to sync
            
        Returns:
            Number of assets synced
        """
        logger.info(f"Syncing top {limit} assets from CoinMarketCap to database")
        
        # Fetch top cryptocurrencies
        listings = await self.get_listings_latest(limit=limit, convert="USD", use_cache=False)
        
        if not listings:
            logger.warning("No cryptocurrency data received from CoinMarketCap")
            return 0
        
        # Map CoinMarketCap data to our asset model
        assets_data = []
        
        for coin in listings:
            # Extract quote data
            quote = coin.get("quote", {}).get("USD", {})
            
            # Map to our asset model
            asset_data = {
                "id": str(coin.get("id")),
                "ticker": coin.get("symbol"),
                "name": coin.get("name"),
                "sector": Sector.CRYPTOCURRENCY,  # Default sector
                "risk_tier": RiskTier.MEDIUM,     # Default risk tier
                "logo_url": f"https://s2.coinmarketcap.com/static/img/coins/64x64/{coin.get('id')}.png",
                "market_data": {
                    "price_usd": quote.get("price"),
                    "market_cap": quote.get("market_cap"),
                    "volume_24h": quote.get("volume_24h"),
                    "price_change_24h": quote.get("percent_change_24h")
                }
            }
            
            assets_data.append(asset_data)
        
        # Get existing asset IDs
        existing_query = select(Asset.id)
        existing_result = await self.db.execute(existing_query)
        existing_ids = {row[0] for row in existing_result.all()}
        
        # Prepare for bulk operations
        assets_to_update = []
        assets_to_create = []
        metrics_to_create = []
        
        for asset_data in assets_data:
            asset_id = asset_data["id"]
            
            # Extract market data for metrics
            market_data = asset_data.pop("market_data", {})
            
            # Create or update asset
            if asset_id in existing_ids:
                # Update existing asset
                query = select(Asset).where(Asset.id == asset_id)
                result = await self.db.execute(query)
                asset = result.scalars().first()
                
                # Update fields
                for key, value in asset_data.items():
                    setattr(asset, key, value)
                
                assets_to_update.append(asset)
            else:
                # Create new asset
                asset = Asset(
                    id=asset_id,
                    ticker=asset_data["ticker"],
                    name=asset_data["name"],
                    sector=asset_data["sector"],
                    risk_tier=asset_data["risk_tier"],
                    logo_url=asset_data.get("logo_url"),
                    website=asset_data.get("website"),
                    description=asset_data.get("description"),
                    is_active=True
                )
                assets_to_create.append(asset)
            
            # Create metrics
            timestamp = datetime.utcnow()
            
            # Price metric
            if "price_usd" in market_data and market_data["price_usd"] is not None:
                metrics_to_create.append(
                    AssetMetric(
                        id=str(uuid.uuid4()),
                        asset_id=asset_id,
                        metric_type="price_usd",
                        value=market_data["price_usd"],
                        timestamp=timestamp
                    )
                )
            
            # Market cap metric
            if "market_cap" in market_data and market_data["market_cap"] is not None:
                metrics_to_create.append(
                    AssetMetric(
                        id=str(uuid.uuid4()),
                        asset_id=asset_id,
                        metric_type="market_cap",
                        value=market_data["market_cap"],
                        timestamp=timestamp
                    )
                )
            
            # Volume 24h metric
            if "volume_24h" in market_data and market_data["volume_24h"] is not None:
                metrics_to_create.append(
                    AssetMetric(
                        id=str(uuid.uuid4()),
                        asset_id=asset_id,
                        metric_type="volume_24h",
                        value=market_data["volume_24h"],
                        timestamp=timestamp
                    )
                )
            
            # Price change 24h metric
            if "price_change_24h" in market_data and market_data["price_change_24h"] is not None:
                metrics_to_create.append(
                    AssetMetric(
                        id=str(uuid.uuid4()),
                        asset_id=asset_id,
                        metric_type="price_change_24h",
                        value=market_data["price_change_24h"],
                        timestamp=timestamp
                    )
                )
        
        # Bulk create and update
        if assets_to_create:
            self.db.add_all(assets_to_create)
        
        if metrics_to_create:
            self.db.add_all(metrics_to_create)
        
        # Commit changes
        await self.db.commit()
        
        logger.info(f"Synced {len(assets_to_update)} existing assets and {len(assets_to_create)} new assets")
        return len(assets_to_update) + len(assets_to_create)
