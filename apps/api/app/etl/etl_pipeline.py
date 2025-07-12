import logging
import asyncio
import os
from typing import List, Dict, Any, Optional

from app.workers.coinmarketcap_worker import CoinMarketCapWorker
from app.workers.dydx_worker import DydxV4Worker
from app.workers.hyperliquid_worker import HyperliquidRESTWorker
from app.cache.memory_cache import InMemoryCache

logger = logging.getLogger(__name__)

class ETLPipeline:
    """
    ETL pipeline for fetching and processing cryptocurrency data
    """
    
    def __init__(self):
        """
        Initialize the ETL pipeline
        """
        self.cache = InMemoryCache()
        self.coinmarketcap_worker = CoinMarketCapWorker()
        
        # DEX workers
        self.dydx_worker = DydxV4Worker(self.cache)
        self.hyperliquid_worker = HyperliquidRESTWorker()
        
        # Flag to enable/disable DEX workers
        self.enable_dex_workers = os.getenv("ENABLE_DEX_WORKERS", "false").lower() == "true"
        
        self.is_initialized = False
    
    async def setup(self):
        """
        Set up the ETL pipeline
        """
        if self.is_initialized:
            return
        
        # Set up workers
        await self.coinmarketcap_worker.setup()
        
        # Set up DEX workers if enabled
        if self.enable_dex_workers:
            logger.info("DEX workers are enabled")
            await self.dydx_worker.setup()
            await self.hyperliquid_worker.setup()
        else:
            logger.info("DEX workers are disabled")
        
        self.is_initialized = True
        logger.info("ETL pipeline initialized")
    
    async def run_full_pipeline(self):
        """
        Run the full ETL pipeline
        """
        await self.setup()
        
        logger.info("Starting full ETL pipeline run")
        
        try:
            # Run CoinMarketCap worker
            logger.info("Running CoinMarketCap worker")
            coinmarketcap_success = await self.coinmarketcap_worker.fetch_and_update()
            
            # Run DEX workers if enabled
            dex_success = True
            if self.enable_dex_workers:
                dex_success = await self.run_dex_workers()
            
            # Log results
            if coinmarketcap_success and dex_success:
                logger.info("Full ETL pipeline run completed successfully")
                return True
            else:
                logger.warning("Full ETL pipeline run completed with some failures")
                return False
                
        except Exception as e:
            logger.error(f"Error running full ETL pipeline: {e}")
            return False
    
    async def run_dex_workers(self):
        """
        Run DEX workers (dYdX and Hyperliquid)
        
        Returns:
            bool: True if successful, False otherwise
        """
        if not self.enable_dex_workers:
            logger.info("DEX workers are disabled, skipping")
            return True
            
        logger.info("Running DEX workers")
        success = True
        
        try:
            # Start dYdX worker if not already running
            if not self.dydx_worker.running:
                logger.info("Starting dYdX worker")
                await self.dydx_worker.start(markets=["BTC-USD", "ETH-USD", "SOL-USD"])
            
            # Run Hyperliquid worker
            logger.info("Running Hyperliquid worker")
            hyperliquid_data = await self.hyperliquid_worker.get_all_mids()
            
            # Process Hyperliquid data and store in cache
            if hyperliquid_data:
                # Store funding rates in cache
                meta_data = await self.hyperliquid_worker.get_meta()
                
                if meta_data and "universe" in meta_data:
                    for coin in meta_data["universe"]:
                        try:
                            symbol = coin.get("name")
                            if not symbol:
                                continue
                                
                            funding_data = await self.hyperliquid_worker.get_funding_data(symbol)
                            if funding_data:
                                await self.cache.set(f"hyperliquid:funding:{symbol}", funding_data, ttl=3600)
                                logger.info(f"Cached Hyperliquid funding data for {coin}")
                        except Exception as e:
                            logger.error(f"Error fetching Hyperliquid funding data for {coin}: {e}")
                            success = False
            
        except Exception as e:
            logger.error(f"Error running DEX workers: {e}")
            success = False
            
        return success
    
    async def run_coinmarketcap_pipeline(self):
        """
        Run only the CoinMarketCap part of the ETL pipeline
        """
        await self.setup()
        
        logger.info("Starting CoinMarketCap ETL pipeline run")
        
        try:
            # Run CoinMarketCap worker
            success = await self.coinmarketcap_worker.fetch_and_update()
            
            if success:
                logger.info("CoinMarketCap ETL pipeline run completed successfully")
            else:
                logger.warning("CoinMarketCap ETL pipeline run failed")
                
            return success
                
        except Exception as e:
            logger.error(f"Error running CoinMarketCap ETL pipeline: {e}")
            return False
    
    async def get_top_cryptocurrencies(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get top cryptocurrencies
        
        Args:
            limit: Number of cryptocurrencies to return
            
        Returns:
            List of cryptocurrency data
        """
        await self.setup()
        return await self.coinmarketcap_worker.get_top_cryptocurrencies(limit)
    
    async def get_market_overview(self) -> Dict[str, Any]:
        """
        Get market overview data
        
        Returns:
            Dictionary containing market overview data
        """
        await self.setup()
        return await self.coinmarketcap_worker.get_market_overview()
    
    async def close(self):
        """
        Close the ETL pipeline and its workers
        """
        logger.info("Closing ETL pipeline")
        
        # Close workers
        await self.coinmarketcap_worker.close()
        
        # Stop DEX workers if running
        if self.enable_dex_workers:
            if hasattr(self, 'dydx_worker') and self.dydx_worker.running:
                await self.dydx_worker.stop()
            
            if hasattr(self, 'hyperliquid_worker'):
                # Close Hyperliquid worker if it has a close method
                if hasattr(self.hyperliquid_worker, 'close'):
                    await self.hyperliquid_worker.close()
        
        logger.info("ETL pipeline closed")
