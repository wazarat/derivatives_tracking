import asyncio
import logging
import signal
import sys
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Any

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select

from ..services.coinmarketcap_service import CoinMarketCapService
from ..adapters.supabase_cache import SupabaseCache
from ..adapters.coinmarketcap import CoinMarketCapAdapter
from ..models import Base, Asset

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("coinmarketcap_worker")

# Environment variables
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/canhav")
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://gxgmcrqcxfgmhvuborpa.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4Z21jcnFjeGZnbWh2dWJvcnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NzExMjQsImV4cCI6MjA2NzA0NzEyNH0.-LoPXC3qe3-BfzlATE3TDpvDZ0nyDX98hYkwzugzFVs")
CMC_API_KEY = os.getenv("COINMARKETCAP_API_KEY", "")
FETCH_INTERVAL = int(os.getenv("COINMARKETCAP_FETCH_INTERVAL", "300"))  # Default: 5 minutes
ASSETS_LIMIT = int(os.getenv("COINMARKETCAP_ASSETS_LIMIT", "250"))  # Default: top 250 assets

class CoinMarketCapWorker:
    """Worker to periodically fetch and update cryptocurrency data from CoinMarketCap"""
    
    def __init__(
        self,
        db_url: str = DATABASE_URL,
        supabase_url: str = SUPABASE_URL,
        supabase_key: str = SUPABASE_KEY,
        api_key: str = CMC_API_KEY,
        fetch_interval: int = FETCH_INTERVAL,
        assets_limit: int = ASSETS_LIMIT
    ):
        """
        Initialize the CoinMarketCap worker
        
        Args:
            db_url: Database URL
            supabase_url: Supabase URL
            supabase_key: Supabase API key
            api_key: CoinMarketCap API key
            fetch_interval: Interval between fetches in seconds
            assets_limit: Maximum number of assets to fetch
        """
        self.db_url = db_url
        self.supabase_url = supabase_url
        self.supabase_key = supabase_key
        self.api_key = api_key
        self.fetch_interval = fetch_interval
        self.assets_limit = assets_limit
        self.engine = None
        self.session_factory = None
        self.running = False
        self.last_run = None
        
    async def setup(self):
        """Set up database connection"""
        logger.info("Setting up database connection")
        self.engine = create_async_engine(self.db_url, echo=False)
        self.session_factory = sessionmaker(
            self.engine, class_=AsyncSession, expire_on_commit=False
        )
        
        # Create tables if they don't exist
        async with self.engine.begin() as conn:
            # await conn.run_sync(Base.metadata.drop_all)  # Uncomment to reset tables (CAREFUL!)
            await conn.run_sync(Base.metadata.create_all)
            
        logger.info("Database setup complete")
    
    async def close(self):
        """Close database connection"""
        if self.engine:
            await self.engine.dispose()
            logger.info("Database connection closed")
    
    async def fetch_and_update(self):
        """Fetch cryptocurrency data from CoinMarketCap and update the database"""
        logger.info("Starting fetch and update cycle")
        self.last_run = datetime.utcnow()
        
        try:
            # Create a new session for this run
            async with self.session_factory() as session:
                # Create services
                cache = SupabaseCache(url=self.supabase_url, key=self.supabase_key)
                adapter = CoinMarketCapAdapter(api_key=self.api_key)
                service = CoinMarketCapService(db=session, cache=cache, adapter=adapter)
                
                # Sync assets to database
                assets_count = await service.sync_assets_to_db(limit=self.assets_limit)
                logger.info(f"Updated {assets_count} assets in database")
                
                # Fetch global metrics for market overview
                global_metrics = await service.get_global_metrics(convert="USD")
                logger.info(f"Fetched global market metrics: {len(global_metrics)} data points")
                
                # Close services
                await service.close()
                
            logger.info("Fetch and update cycle completed successfully")
            return True
        except Exception as e:
            logger.error(f"Error in fetch and update cycle: {e}", exc_info=True)
            return False
    
    async def run(self):
        """Run the worker in a loop"""
        self.running = True
        logger.info(f"Starting CoinMarketCap worker (interval: {self.fetch_interval}s, limit: {self.assets_limit} assets)")
        
        # Set up database
        await self.setup()
        
        try:
            while self.running:
                # Run fetch and update
                success = await self.fetch_and_update()
                
                if success:
                    # Wait for next interval
                    logger.info(f"Waiting {self.fetch_interval} seconds until next update")
                    await asyncio.sleep(self.fetch_interval)
                else:
                    # Wait a shorter time if there was an error
                    logger.info("Error occurred, retrying in 60 seconds")
                    await asyncio.sleep(60)
        finally:
            await self.close()
    
    def stop(self):
        """Stop the worker"""
        logger.info("Stopping CoinMarketCap worker")
        self.running = False
    
    async def get_market(self) -> Dict[str, Any]:
        """
        Get market data
        
        Returns:
            Market data
        """
        logger.info("Getting market data")
        try:
            async with self.session_factory() as session:
                cache = SupabaseCache(url=self.supabase_url, key=self.supabase_key)
                adapter = CoinMarketCapAdapter(api_key=self.api_key)
                service = CoinMarketCapService(db=session, cache=cache, adapter=adapter)
                
                # Get global metrics
                global_metrics = await service.get_global_metrics(convert="USD")
                
                # Format the response
                data = global_metrics.get("data", {})
                quote = data.get("quote", {}).get("USD", {})
                
                market_data = {
                    "total_market_cap": quote.get("total_market_cap"),
                    "total_volume_24h": quote.get("total_volume_24h"),
                    "btc_dominance": data.get("btc_dominance"),
                    "eth_dominance": data.get("eth_dominance"),
                    "active_cryptocurrencies": data.get("total_cryptocurrencies"),
                    "last_updated": data.get("last_updated"),
                    "market_cap_change_percentage_24h": quote.get("total_market_cap_yesterday_percentage_change")
                }
                
                await service.close()
                return market_data
                
        except Exception as e:
            logger.error(f"Error getting market data: {e}", exc_info=True)
            return {}
    
    async def get_assets(self) -> List[Dict[str, Any]]:
        """
        Get all assets
        
        Returns:
            List of assets
        """
        logger.info("Getting all assets")
        try:
            async with self.session_factory() as session:
                # Query assets from database
                query = select(Asset).where(Asset.is_active == True).order_by(Asset.market_cap.desc())
                result = await session.execute(query)
                assets = result.scalars().all()
                
                # Format the response
                asset_list = []
                for asset in assets:
                    asset_data = {
                        "id": asset.id,
                        "ticker": asset.ticker,
                        "name": asset.name,
                        "sector": asset.sector.value if asset.sector else None,
                        "risk_tier": asset.risk_tier.value if asset.risk_tier else None,
                        "logo_url": asset.logo_url,
                        "website": asset.website,
                        "description": asset.description,
                        "market_cap": asset.market_cap,
                        "price_usd": asset.price_usd,
                        "volume_24h": asset.volume_24h,
                        "price_change_24h": asset.price_change_24h,
                        "last_updated": asset.updated_at.isoformat() if asset.updated_at else None
                    }
                    asset_list.append(asset_data)
                
                return asset_list
                
        except Exception as e:
            logger.error(f"Error getting assets: {e}", exc_info=True)
            return []
    
    async def get_asset(self, asset_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific asset
        
        Args:
            asset_id: Asset ID or symbol
            
        Returns:
            Asset data or None if not found
        """
        logger.info(f"Getting asset: {asset_id}")
        try:
            async with self.session_factory() as session:
                cache = SupabaseCache(url=self.supabase_url, key=self.supabase_key)
                adapter = CoinMarketCapAdapter(api_key=self.api_key)
                service = CoinMarketCapService(db=session, cache=cache, adapter=adapter)
                
                # Try to find by ID first
                query = select(Asset).where(Asset.id == asset_id)
                result = await session.execute(query)
                asset = result.scalars().first()
                
                # If not found, try by ticker
                if not asset:
                    query = select(Asset).where(Asset.ticker == asset_id.upper())
                    result = await session.execute(query)
                    asset = result.scalars().first()
                
                if not asset:
                    # Asset not found in database, try to fetch from API
                    try:
                        # Get quotes for the symbol
                        quotes_data = await service.get_quotes_latest(symbol=asset_id.upper())
                        
                        if not quotes_data:
                            return None
                        
                        # Get coin details
                        coin_details = await service.get_coin_details(symbol=asset_id.upper())
                        
                        # Format the response
                        quote = quotes_data.get("quote", {}).get("USD", {})
                        
                        asset_data = {
                            "id": str(quotes_data.get("id")),
                            "ticker": quotes_data.get("symbol"),
                            "name": quotes_data.get("name"),
                            "logo_url": f"https://s2.coinmarketcap.com/static/img/coins/64x64/{quotes_data.get('id')}.png",
                            "website": coin_details.get("urls", {}).get("website", [None])[0],
                            "description": coin_details.get("description"),
                            "market_cap": quote.get("market_cap"),
                            "price_usd": quote.get("price"),
                            "volume_24h": quote.get("volume_24h"),
                            "price_change_24h": quote.get("percent_change_24h"),
                            "price_change_7d": quote.get("percent_change_7d"),
                            "price_change_30d": quote.get("percent_change_30d"),
                            "circulating_supply": quotes_data.get("circulating_supply"),
                            "total_supply": quotes_data.get("total_supply"),
                            "max_supply": quotes_data.get("max_supply"),
                            "last_updated": quote.get("last_updated")
                        }
                        
                        await service.close()
                        return asset_data
                    except Exception as e:
                        logger.error(f"Error fetching asset from API: {e}", exc_info=True)
                        return None
                
                # Format the response from database
                asset_data = {
                    "id": asset.id,
                    "ticker": asset.ticker,
                    "name": asset.name,
                    "sector": asset.sector.value if asset.sector else None,
                    "risk_tier": asset.risk_tier.value if asset.risk_tier else None,
                    "logo_url": asset.logo_url,
                    "website": asset.website,
                    "description": asset.description,
                    "market_cap": asset.market_cap,
                    "price_usd": asset.price_usd,
                    "volume_24h": asset.volume_24h,
                    "price_change_24h": asset.price_change_24h,
                    "last_updated": asset.updated_at.isoformat() if asset.updated_at else None
                }
                
                # Try to get additional metrics from API
                try:
                    quotes_data = await service.get_quotes_latest(symbol=asset.ticker)
                    if quotes_data:
                        quote = quotes_data.get("quote", {}).get("USD", {})
                        asset_data.update({
                            "price_change_7d": quote.get("percent_change_7d"),
                            "price_change_30d": quote.get("percent_change_30d"),
                            "circulating_supply": quotes_data.get("circulating_supply"),
                            "total_supply": quotes_data.get("total_supply"),
                            "max_supply": quotes_data.get("max_supply")
                        })
                except Exception as e:
                    logger.warning(f"Could not fetch additional metrics for {asset_id}: {e}")
                
                await service.close()
                return asset_data
                
        except Exception as e:
            logger.error(f"Error getting asset {asset_id}: {e}", exc_info=True)
            return None
    
    async def get_trending(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get trending assets
        
        Args:
            limit: Number of trending assets to return
            
        Returns:
            List of trending assets
        """
        logger.info(f"Getting trending assets (limit: {limit})")
        try:
            async with self.session_factory() as session:
                cache = SupabaseCache(url=self.supabase_url, key=self.supabase_key)
                adapter = CoinMarketCapAdapter(api_key=self.api_key)
                service = CoinMarketCapService(db=session, cache=cache, adapter=adapter)
                
                # Get latest listings sorted by percent change
                listings = await service.get_listings_latest(limit=100)  # Get more than needed to filter
                
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
                
                await service.close()
                return trending_list
                
        except Exception as e:
            logger.error(f"Error getting trending assets: {e}", exc_info=True)
            return []
    
    async def get_crypto_metrics(self, symbol: str) -> Dict[str, Any]:
        """
        Get detailed metrics for a specific cryptocurrency by symbol
        
        Args:
            symbol: The symbol of the cryptocurrency (e.g., BTC, ETH)
            
        Returns:
            Dictionary containing detailed metrics for the cryptocurrency
        """
        logger.info(f"Getting detailed metrics for {symbol}")
        try:
            async with self.session_factory() as session:
                cache = SupabaseCache(url=self.supabase_url, key=self.supabase_key)
                adapter = CoinMarketCapAdapter(api_key=self.api_key)
                service = CoinMarketCapService(db=session, cache=cache, adapter=adapter)
                
                # Get quote data for the symbol
                quote_data = await service.get_quote(symbol)
                if not quote_data:
                    logger.warning(f"No quote data found for {symbol}")
                    return None
                
                # Extract the cryptocurrency data
                crypto_data = quote_data.get(symbol, {})
                if not crypto_data:
                    logger.warning(f"No cryptocurrency data found for {symbol}")
                    return None
                
                # Extract quote data
                quote = crypto_data.get("quote", {}).get("USD", {})
                
                # Get additional metadata
                metadata = await service.get_metadata(symbol)
                
                # Prepare the metrics response
                metrics = {
                    "name": crypto_data.get("name"),
                    "symbol": symbol,
                    "price": quote.get("price"),
                    "price_change_24h": quote.get("percent_change_24h"),
                    "market_cap": quote.get("market_cap"),
                    "market_cap_rank": crypto_data.get("cmc_rank"),
                    "total_volume": quote.get("volume_24h"),
                    "high_24h": None,  # Not directly available from CMC
                    "low_24h": None,   # Not directly available from CMC
                    "circulating_supply": crypto_data.get("circulating_supply"),
                    "total_supply": crypto_data.get("total_supply"),
                    "max_supply": crypto_data.get("max_supply"),
                    "ath": None,  # Not directly available from CMC
                    "ath_change_percentage": None,  # Not directly available from CMC
                    "ath_date": None,  # Not directly available from CMC
                    "atl": None,  # Not directly available from CMC
                    "atl_change_percentage": None,  # Not directly available from CMC
                    "atl_date": None,  # Not directly available from CMC
                    "last_updated": quote.get("last_updated"),
                    "price_change_percentage_1h": quote.get("percent_change_1h"),
                    "price_change_percentage_7d": quote.get("percent_change_7d"),
                    "price_change_percentage_14d": quote.get("percent_change_14d", None),
                    "price_change_percentage_30d": quote.get("percent_change_30d"),
                    "price_change_percentage_200d": None,  # Not directly available from CMC
                    "price_change_percentage_1y": quote.get("percent_change_90d"),  # Using 90d as proxy
                    "market_cap_change_24h": None,  # Calculate if needed
                    "market_cap_change_percentage_24h": quote.get("market_cap_change_percent_24h", None)
                }
                
                # Add metadata if available
                if metadata and symbol in metadata:
                    meta = metadata.get(symbol, {})
                    metrics.update({
                        "description": meta.get("description"),
                        "website": meta.get("urls", {}).get("website", [None])[0] if meta.get("urls", {}).get("website") else None,
                        "twitter": meta.get("urls", {}).get("twitter", [None])[0] if meta.get("urls", {}).get("twitter") else None,
                        "reddit": meta.get("urls", {}).get("reddit", [None])[0] if meta.get("urls", {}).get("reddit") else None,
                        "github": meta.get("urls", {}).get("source_code", [None])[0] if meta.get("urls", {}).get("source_code") else None,
                        "logo": meta.get("logo"),
                        "tags": meta.get("tags"),
                        "platform": meta.get("platform"),
                    })
                
                await service.close()
                return metrics
                
        except Exception as e:
            logger.error(f"Error getting metrics for {symbol}: {e}", exc_info=True)
            return None
    
    async def get_crypto_history(self, symbol: str, days: int = 30, interval: Optional[str] = None) -> Dict[str, Any]:
        """
        Get historical price data for a specific cryptocurrency by symbol
        
        Args:
            symbol: The symbol of the cryptocurrency (e.g., BTC, ETH)
            days: Number of days of history to return (1-365)
            interval: Data interval (daily, hourly)
            
        Returns:
            Dictionary containing historical data for the cryptocurrency
        """
        logger.info(f"Getting historical data for {symbol} (days: {days}, interval: {interval})")
        try:
            async with self.session_factory() as session:
                cache = SupabaseCache(url=self.supabase_url, key=self.supabase_key)
                adapter = CoinMarketCapAdapter(api_key=self.api_key)
                service = CoinMarketCapService(db=session, cache=cache, adapter=adapter)
                
                # Calculate time range
                end_date = datetime.utcnow()
                start_date = end_date - timedelta(days=days)
                
                # Determine interval if not specified
                if not interval:
                    if days <= 7:
                        interval = "hourly"
                    else:
                        interval = "daily"
                
                # Convert interval to CMC format
                cmc_interval = {
                    "daily": "1d",
                    "hourly": "1h",
                    "minutely": "5m"  # Using 5m as the smallest interval
                }.get(interval, "1d")
                
                # Get historical data
                historical_data = await service.get_historical_quotes(
                    symbol=symbol,
                    time_start=start_date.strftime("%Y-%m-%dT%H:%M:%SZ"),
                    time_end=end_date.strftime("%Y-%m-%dT%H:%M:%SZ"),
                    interval=cmc_interval
                )
                
                if not historical_data:
                    logger.warning(f"No historical data found for {symbol}")
                    return None
                
                # Get cryptocurrency metadata for additional info
                metadata = await service.get_metadata(symbol)
                name = metadata.get(symbol, {}).get("name", symbol) if metadata and symbol in metadata else symbol
                
                # Extract and format the historical data
                quotes = historical_data.get("quotes", [])
                price_history = []
                volume_history = []
                market_cap_history = []
                
                for quote in quotes:
                    timestamp = quote.get("timestamp")
                    if not timestamp:
                        continue
                    
                    quote_data = quote.get("quote", {}).get("USD", {})
                    
                    # Add price data
                    price_history.append({
                        "timestamp": timestamp,
                        "value": quote_data.get("price")
                    })
                    
                    # Add volume data
                    volume_history.append({
                        "timestamp": timestamp,
                        "value": quote_data.get("volume_24h")
                    })
                    
                    # Add market cap data
                    market_cap_history.append({
                        "timestamp": timestamp,
                        "value": quote_data.get("market_cap")
                    })
                
                # Prepare the history response
                history = {
                    "name": name,
                    "symbol": symbol,
                    "interval": interval,
                    "days": days,
                    "price_history": price_history,
                    "volume_history": volume_history,
                    "market_cap_history": market_cap_history,
                    "last_updated": datetime.utcnow().isoformat()
                }
                
                await service.close()
                return history
                
        except Exception as e:
            logger.error(f"Error getting history for {symbol}: {e}", exc_info=True)
            return None

async def main():
    """Main entry point for the worker"""
    worker = CoinMarketCapWorker()
    
    # Set up signal handlers
    def signal_handler(sig, frame):
        logger.info(f"Received signal {sig}, shutting down")
        worker.stop()
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Run the worker
    await worker.run()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Keyboard interrupt received, exiting")
    except Exception as e:
        logger.error(f"Unhandled exception: {e}", exc_info=True)
        sys.exit(1)
    sys.exit(0)
