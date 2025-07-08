import logging
from typing import Dict, List, Optional, Any, Union
import uuid
from datetime import datetime, timedelta

from ..adapters.coingecko import CoinGeckoAdapter
from ..adapters.supabase_cache import SupabaseCache
from ..models import Asset, AssetMetric, Sector, RiskTier
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

logger = logging.getLogger(__name__)

class CoinGeckoService:
    """
    Service for fetching cryptocurrency data from CoinGecko with Supabase caching
    """
    
    def __init__(self, db: AsyncSession, cache: Optional[SupabaseCache] = None, adapter: Optional[CoinGeckoAdapter] = None):
        """
        Initialize the CoinGecko service
        
        Args:
            db: Database session
            cache: Supabase cache service (optional)
            adapter: CoinGecko adapter (optional)
        """
        self.db = db
        self.cache = cache or SupabaseCache()
        self.adapter = adapter or CoinGeckoAdapter()
    
    async def close(self):
        """Close connections"""
        await self.adapter.close()
        await self.cache.close()
    
    async def get_coins_markets(
        self,
        vs_currency: str = "usd",
        ids: Optional[List[str]] = None,
        category: Optional[str] = None,
        order: str = "market_cap_desc",
        per_page: int = 100,
        page: int = 1,
        sparkline: bool = False,
        price_change_percentage: Optional[str] = None,
        use_cache: bool = True
    ) -> List[Dict]:
        """
        Get list of coins with market data, using cache if available
        
        Args:
            vs_currency: The target currency (e.g., usd, eur)
            ids: List of coin ids to filter by
            category: Filter by coin category
            order: Sort by field (market_cap_desc, volume_desc, etc.)
            per_page: Number of results per page (1-250)
            page: Page number
            sparkline: Include sparkline 7d data
            price_change_percentage: Include price change percentage for intervals (1h, 24h, 7d, etc.)
            use_cache: Whether to use cached data if available
            
        Returns:
            List of coins with market data
        """
        # Try to get from cache first
        if use_cache and not ids and not category:  # Only cache standard queries
            cached_data = await self.cache.get_coins_markets(vs_currency, page)
            if cached_data:
                logger.info(f"Using cached coins market data for {vs_currency} page {page}")
                return cached_data
        
        # Fetch from API
        logger.info(f"Fetching coins market data from CoinGecko for {vs_currency} page {page}")
        data = await self.adapter.get_coins_markets(
            vs_currency=vs_currency,
            ids=ids,
            category=category,
            order=order,
            per_page=per_page,
            page=page,
            sparkline=sparkline,
            price_change_percentage=price_change_percentage
        )
        
        # Cache the result if it's a standard query
        if not ids and not category:
            await self.cache.set_coins_markets(data, vs_currency, page)
        
        return data
    
    async def get_coin_by_id(
        self,
        id: str,
        localization: bool = False,
        tickers: bool = True,
        market_data: bool = True,
        community_data: bool = False,
        developer_data: bool = False,
        sparkline: bool = False,
        use_cache: bool = True
    ) -> Dict:
        """
        Get current data for a coin by id, using cache if available
        
        Args:
            id: Coin id (e.g., bitcoin, ethereum)
            localization: Include localized data
            tickers: Include ticker data
            market_data: Include market data
            community_data: Include community data
            developer_data: Include developer data
            sparkline: Include sparkline 7d data
            use_cache: Whether to use cached data if available
            
        Returns:
            Detailed coin data
        """
        # Try to get from cache first
        if use_cache:
            cached_data = await self.cache.get_coin_data(id)
            if cached_data:
                logger.info(f"Using cached coin data for {id}")
                return cached_data
        
        # Fetch from API
        logger.info(f"Fetching coin data from CoinGecko for {id}")
        data = await self.adapter.get_coin_by_id(
            id=id,
            localization=localization,
            tickers=tickers,
            market_data=market_data,
            community_data=community_data,
            developer_data=developer_data,
            sparkline=sparkline
        )
        
        # Cache the result
        await self.cache.set_coin_data(id, data)
        
        return data
    
    async def get_coin_market_chart(
        self,
        id: str,
        vs_currency: str = "usd",
        days: Union[int, str] = 1,
        interval: Optional[str] = None,
        use_cache: bool = True
    ) -> Dict:
        """
        Get historical market data for a coin, using cache if available
        
        Args:
            id: Coin id (e.g., bitcoin, ethereum)
            vs_currency: The target currency (e.g., usd, eur)
            days: Data up to number of days ago (1, 7, 14, 30, 90, 180, 365, max)
            interval: Data interval (daily, hourly, minutely)
            use_cache: Whether to use cached data if available
            
        Returns:
            Historical market data (prices, market_caps, total_volumes)
        """
        # Try to get from cache first
        if use_cache and not interval:  # Only cache standard queries
            cached_data = await self.cache.get_coin_history(id, days)
            if cached_data:
                logger.info(f"Using cached history data for {id} ({days} days)")
                return cached_data
        
        # Fetch from API
        logger.info(f"Fetching market chart from CoinGecko for {id} ({days} days)")
        data = await self.adapter.get_coin_market_chart(
            id=id,
            vs_currency=vs_currency,
            days=days,
            interval=interval
        )
        
        # Cache the result if it's a standard query
        if not interval:
            await self.cache.set_coin_history(id, days, data)
        
        return data
    
    async def get_global_data(self, use_cache: bool = True) -> Dict:
        """
        Get cryptocurrency global data, using cache if available
        
        Args:
            use_cache: Whether to use cached data if available
            
        Returns:
            Global cryptocurrency data
        """
        # Try to get from cache first
        if use_cache:
            cached_data = await self.cache.get_global_data()
            if cached_data:
                logger.info("Using cached global data")
                return cached_data
        
        # Fetch from API
        logger.info("Fetching global data from CoinGecko")
        data = await self.adapter.get_global_data()
        
        # Cache the result
        await self.cache.set_global_data(data)
        
        return data
    
    async def sync_assets_to_db(self, limit: int = 250) -> int:
        """
        Sync top cryptocurrency assets from CoinGecko to the database
        
        Args:
            limit: Maximum number of assets to sync
            
        Returns:
            Number of assets synced
        """
        logger.info(f"Syncing top {limit} assets from CoinGecko to database")
        
        # Fetch coins with market data
        pages = (limit + 99) // 100  # Ceiling division to get number of pages
        all_coins = []
        
        for page in range(1, pages + 1):
            per_page = min(100, limit - len(all_coins))
            coins = await self.get_coins_markets(
                vs_currency="usd",
                per_page=per_page,
                page=page,
                price_change_percentage="1h,24h,7d"
            )
            all_coins.extend(coins)
            if len(all_coins) >= limit:
                break
        
        # Map CoinGecko data to our asset model
        assets_data = await self.adapter.map_coingecko_to_assets(all_coins)
        
        # Get existing assets from database
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
