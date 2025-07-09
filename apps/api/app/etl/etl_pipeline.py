import logging
import asyncio
from typing import List, Dict, Any, Optional

from app.workers.coingecko_worker import CoinGeckoWorker
from app.workers.coinmarketcap_worker import CoinMarketCapWorker

logger = logging.getLogger(__name__)

class ETLPipeline:
    """
    ETL pipeline for fetching and processing cryptocurrency data
    """
    
    def __init__(self):
        """
        Initialize the ETL pipeline
        """
        self.coingecko_worker = CoinGeckoWorker()
        self.coinmarketcap_worker = CoinMarketCapWorker()
        self.is_initialized = False
    
    async def setup(self):
        """
        Set up the ETL pipeline
        """
        if self.is_initialized:
            return
        
        # Set up workers
        await self.coingecko_worker.setup()
        await self.coinmarketcap_worker.setup()
        
        self.is_initialized = True
        logger.info("ETL pipeline initialized")
    
    async def run_full_pipeline(self):
        """
        Run the full ETL pipeline
        """
        await self.setup()
        
        logger.info("Starting full ETL pipeline run")
        
        try:
            # Run CoinGecko worker
            logger.info("Running CoinGecko worker")
            coingecko_success = await self.coingecko_worker.fetch_and_update()
            
            # Run CoinMarketCap worker
            logger.info("Running CoinMarketCap worker")
            coinmarketcap_success = await self.coinmarketcap_worker.fetch_and_update()
            
            # Log results
            if coingecko_success and coinmarketcap_success:
                logger.info("Full ETL pipeline run completed successfully")
                return True
            else:
                logger.warning("Full ETL pipeline run completed with some failures")
                return False
                
        except Exception as e:
            logger.error(f"Error running full ETL pipeline: {e}")
            return False
    
    async def run_coingecko_pipeline(self):
        """
        Run only the CoinGecko part of the ETL pipeline
        """
        await self.setup()
        
        logger.info("Starting CoinGecko ETL pipeline run")
        
        try:
            # Run CoinGecko worker
            success = await self.coingecko_worker.fetch_and_update()
            
            if success:
                logger.info("CoinGecko ETL pipeline run completed successfully")
            else:
                logger.warning("CoinGecko ETL pipeline run failed")
                
            return success
                
        except Exception as e:
            logger.error(f"Error running CoinGecko ETL pipeline: {e}")
            return False
    
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
    
    async def get_top_cryptocurrencies(self, source: str = "coinmarketcap", limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get top cryptocurrencies from the specified source
        
        Args:
            source: Data source ("coinmarketcap" or "coingecko")
            limit: Number of cryptocurrencies to return
            
        Returns:
            List of cryptocurrency data
        """
        await self.setup()
        
        if source.lower() == "coinmarketcap":
            return await self.coinmarketcap_worker.get_top_cryptocurrencies(limit)
        else:
            # Default to CoinGecko
            return await self.coingecko_worker.get_top_coins(limit)
    
    async def get_market_overview(self, source: str = "coinmarketcap") -> Dict[str, Any]:
        """
        Get market overview data from the specified source
        
        Args:
            source: Data source ("coinmarketcap" or "coingecko")
            
        Returns:
            Dictionary containing market overview data
        """
        await self.setup()
        
        if source.lower() == "coinmarketcap":
            return await self.coinmarketcap_worker.get_market_overview()
        else:
            # Default to CoinGecko
            return await self.coingecko_worker.get_global_data()
    
    async def close(self):
        """
        Close the ETL pipeline and its workers
        """
        logger.info("Closing ETL pipeline")
        
        # Close workers
        await self.coingecko_worker.close()
        
        logger.info("ETL pipeline closed")
