import logging
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import time

from app.workers.rest_worker import CoinbaseRESTWorker
from app.cache.supabase_cache import SupabaseCache
from app.models.funding import FundingRate

# Configure logging
logger = logging.getLogger(__name__)

class CoinbaseWorker:
    """Worker for fetching funding rate data from Coinbase"""
    
    def __init__(self, cache: Optional[SupabaseCache] = None):
        """
        Initialize the Coinbase worker
        
        Args:
            cache: Optional SupabaseCache instance for caching data
        """
        self.rest_worker = CoinbaseRESTWorker()
        self.cache = cache
        self.funding_cache_key = "coinbase_funding_rates"
        self.funding_cache_expiry = 60 * 15  # 15 minutes
    
    async def setup(self):
        """Initialize any required resources"""
        pass
    
    async def close(self):
        """Close any open resources"""
        await self.rest_worker.close()
    
    async def fetch_funding_rates(self) -> List[Dict[str, Any]]:
        """
        Fetch current funding rates from Coinbase
        
        Returns:
            List of funding rate data
        """
        logger.info("Fetching Coinbase funding rates")
        
        # Get all available futures products
        products = await self.rest_worker.get_products()
        
        # Filter for perpetual futures products (they contain '-PERP' in the ID)
        perp_products = [p for p in products if '-PERP' in p.get('id', '')]
        
        funding_rates = []
        
        for product in perp_products:
            product_id = product.get('id')
            symbol = product_id.replace('-PERP', '')
            
            try:
                # Get product stats which includes funding rate info
                stats = await self.rest_worker.get_product_stats(product_id)
                
                # Get current ticker data for price
                ticker = await self.rest_worker.get_product_ticker(product_id)
                
                # Extract funding rate data
                funding_rate = {
                    'symbol': symbol,
                    'product_id': product_id,
                    'funding_rate': float(stats.get('funding_rate', 0)),
                    'funding_time': stats.get('funding_time'),
                    'next_funding_time': stats.get('next_funding_time'),
                    'price': float(ticker.get('price', 0)),
                    'timestamp': datetime.now(timezone.utc).isoformat(),
                }
                
                funding_rates.append(funding_rate)
                logger.debug(f"Fetched funding rate for {symbol}: {funding_rate['funding_rate']}")
                
            except Exception as e:
                logger.error(f"Error fetching funding rate for {product_id}: {str(e)}")
                continue
        
        return funding_rates
    
    async def fetch_and_cache_funding_rates(self) -> List[Dict[str, Any]]:
        """
        Fetch funding rates and store in cache
        
        Returns:
            List of funding rate data
        """
        funding_rates = await self.fetch_funding_rates()
        
        if self.cache and funding_rates:
            try:
                await self.cache.set(
                    self.funding_cache_key,
                    {'data': funding_rates, 'updated_at': time.time()},
                    expiry=self.funding_cache_expiry
                )
                logger.info(f"Cached {len(funding_rates)} Coinbase funding rates")
            except Exception as e:
                logger.error(f"Error caching Coinbase funding rates: {str(e)}")
        
        return funding_rates
    
    async def get_funding_rates(self, force_refresh: bool = False) -> List[Dict[str, Any]]:
        """
        Get funding rates from cache or fetch if not available
        
        Args:
            force_refresh: Force refresh from API instead of using cache
            
        Returns:
            List of funding rate data
        """
        if self.cache and not force_refresh:
            try:
                cached_data = await self.cache.get(self.funding_cache_key)
                if cached_data:
                    logger.info("Using cached Coinbase funding rates")
                    return cached_data.get('data', [])
            except Exception as e:
                logger.error(f"Error retrieving cached Coinbase funding rates: {str(e)}")
        
        # Fetch fresh data if not in cache or force_refresh
        return await self.fetch_and_cache_funding_rates()
    
    async def get_funding_rate_by_symbol(self, symbol: str) -> Optional[Dict[str, Any]]:
        """
        Get funding rate for a specific symbol
        
        Args:
            symbol: Cryptocurrency symbol (e.g., BTC)
            
        Returns:
            Funding rate data for the symbol or None if not found
        """
        funding_rates = await self.get_funding_rates()
        
        # Normalize symbol to uppercase for comparison
        symbol = symbol.upper()
        
        for rate in funding_rates:
            if rate.get('symbol', '').upper() == symbol:
                return rate
        
        return None
    
    async def store_funding_rates_in_db(self, db_session) -> int:
        """
        Store funding rates in the database
        
        Args:
            db_session: SQLAlchemy database session
            
        Returns:
            Number of funding rates stored
        """
        funding_rates = await self.fetch_funding_rates()
        count = 0
        
        for rate_data in funding_rates:
            try:
                funding_rate = FundingRate(
                    symbol=rate_data['symbol'],
                    exchange='coinbase',
                    rate=rate_data['funding_rate'],
                    next_funding_time=rate_data.get('next_funding_time'),
                    timestamp=datetime.now(timezone.utc)
                )
                
                db_session.add(funding_rate)
                count += 1
                
            except Exception as e:
                logger.error(f"Error storing funding rate for {rate_data.get('symbol')}: {str(e)}")
                continue
        
        if count > 0:
            try:
                await db_session.commit()
                logger.info(f"Stored {count} Coinbase funding rates in database")
            except Exception as e:
                await db_session.rollback()
                logger.error(f"Error committing funding rates to database: {str(e)}")
                count = 0
        
        return count
