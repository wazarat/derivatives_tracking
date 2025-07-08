import asyncio
import logging
import signal
import sys
import os
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from ..services.coingecko_service import CoinGeckoService
from ..adapters.supabase_cache import SupabaseCache
from ..adapters.coingecko import CoinGeckoAdapter
from ..models import Base

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("coingecko_worker")

# Environment variables
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/canhav")
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://gxgmcrqcxfgmhvuborpa.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4Z21jcnFjeGZnbWh2dWJvcnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NzExMjQsImV4cCI6MjA2NzA0NzEyNH0.-LoPXC3qe3-BfzlATE3TDpvDZ0nyDX98hYkwzugzFVs")
FETCH_INTERVAL = int(os.getenv("COINGECKO_FETCH_INTERVAL", "300"))  # Default: 5 minutes
ASSETS_LIMIT = int(os.getenv("COINGECKO_ASSETS_LIMIT", "250"))  # Default: top 250 assets

class CoinGeckoWorker:
    """Worker to periodically fetch and update cryptocurrency data from CoinGecko"""
    
    def __init__(
        self,
        db_url: str = DATABASE_URL,
        supabase_url: str = SUPABASE_URL,
        supabase_key: str = SUPABASE_KEY,
        fetch_interval: int = FETCH_INTERVAL,
        assets_limit: int = ASSETS_LIMIT
    ):
        """
        Initialize the CoinGecko worker
        
        Args:
            db_url: Database URL
            supabase_url: Supabase URL
            supabase_key: Supabase API key
            fetch_interval: Interval between fetches in seconds
            assets_limit: Maximum number of assets to fetch
        """
        self.db_url = db_url
        self.supabase_url = supabase_url
        self.supabase_key = supabase_key
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
        """Fetch cryptocurrency data from CoinGecko and update the database"""
        logger.info("Starting fetch and update cycle")
        self.last_run = datetime.utcnow()
        
        try:
            # Create a new session for this run
            async with self.session_factory() as session:
                # Create services
                cache = SupabaseCache(url=self.supabase_url, key=self.supabase_key)
                adapter = CoinGeckoAdapter()
                service = CoinGeckoService(db=session, cache=cache, adapter=adapter)
                
                # Sync assets to database
                assets_count = await service.sync_assets_to_db(limit=self.assets_limit)
                logger.info(f"Updated {assets_count} assets in database")
                
                # Fetch global data for market overview
                global_data = await service.get_global_data()
                logger.info(f"Fetched global market data: {len(global_data)} data points")
                
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
        logger.info(f"Starting CoinGecko worker (interval: {self.fetch_interval}s, limit: {self.assets_limit} assets)")
        
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
        logger.info("Stopping CoinGecko worker")
        self.running = False

async def main():
    """Main entry point for the worker"""
    worker = CoinGeckoWorker()
    
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
