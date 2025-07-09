import logging
import asyncio
import os
from typing import Dict, List, Any, Optional

from ..workers.coinmarketcap_worker import CoinMarketCapWorker

logger = logging.getLogger(__name__)

class ETLPipeline:
    """
    ETL pipeline for cryptocurrency data
    
    Orchestrates data fetching, transformation, and loading
    """
    
    def __init__(self):
        """
        Initialize the ETL pipeline
        """
        api_key = os.environ.get("COINMARKETCAP_API_KEY")
        if not api_key:
            logger.warning("COINMARKETCAP_API_KEY not found in environment variables")
        
        self.worker = CoinMarketCapWorker()
        self.is_initialized = False
    
    async def setup(self):
        """
        Set up the ETL pipeline
        """
        if not self.is_initialized:
            logger.info("Setting up ETL pipeline")
            await self.worker.setup()
            self.is_initialized = True
    
    async def run_full_pipeline(self):
        """
        Run the full ETL pipeline
        """
        await self.setup()
        await self.worker.fetch_and_update()
    
    async def get_market(self) -> Dict[str, Any]:
        """
        Get market data
        
        Returns:
            Market data
        """
        await self.setup()
        return await self.worker.get_market()
    
    async def get_assets(self) -> List[Dict[str, Any]]:
        """
        Get all assets
        
        Returns:
            List of assets
        """
        await self.setup()
        return await self.worker.get_assets()
    
    async def get_asset(self, asset_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific asset
        
        Args:
            asset_id: Asset ID or symbol
            
        Returns:
            Asset data or None if not found
        """
        await self.setup()
        return await self.worker.get_asset(asset_id)
    
    async def get_trending(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get trending assets
        
        Args:
            limit: Number of trending assets to return
            
        Returns:
            List of trending assets
        """
        await self.setup()
        return await self.worker.get_trending(limit=limit)
