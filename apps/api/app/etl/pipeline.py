import logging
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import insert, update

from ..database import get_db
from ..models import Asset, AssetMetric
from ..adapters.circle import CircleAdapter
from ..adapters.tether import TetherAdapter
from ..adapters.ondo import OndoAdapter
from ..adapters.matrixdock import MatrixDockAdapter
from ..risk.scoring import RiskScoringEngine

logger = logging.getLogger(__name__)

class ETLPipeline:
    """ETL pipeline for fetching and storing data from various adapters."""
    
    def __init__(self):
        """Initialize the ETL pipeline with adapters."""
        self.adapters = {
            "circle": CircleAdapter(),
            "tether": TetherAdapter(),
            "ondo": OndoAdapter(),
            "matrixdock": MatrixDockAdapter()
        }
        self.risk_engine = RiskScoringEngine()
        
    async def run_full_pipeline(self):
        """Run the complete ETL pipeline."""
        logger.info("Starting full ETL pipeline run")
        
        try:
            # Fetch and store all assets
            await self.fetch_and_store_assets()
            
            # Fetch and store metrics for all assets
            await self.fetch_and_store_metrics()
            
            # Update risk scores
            await self.update_risk_scores()
            
            logger.info("ETL pipeline completed successfully")
            
        except Exception as e:
            logger.error(f"ETL pipeline failed: {e}")
            raise
    
    async def fetch_and_store_assets(self):
        """Fetch assets from all adapters and store them in the database."""
        logger.info("Fetching assets from all adapters")
        
        all_assets = []
        
        # Collect assets from all adapters
        for adapter_name, adapter in self.adapters.items():
            try:
                logger.info(f"Fetching assets from {adapter_name}")
                assets = await adapter.list_assets()
                all_assets.extend(assets)
                logger.info(f"Fetched {len(assets)} assets from {adapter_name}")
            except Exception as e:
                logger.error(f"Error fetching assets from {adapter_name}: {e}")
        
        # Store assets in the database
        async with get_db() as db:
            await self._store_assets(db, all_assets)
    
    async def _store_assets(self, db: AsyncSession, assets: List[Dict[str, Any]]):
        """Store assets in the database."""
        logger.info(f"Storing {len(assets)} assets in the database")
        
        for asset_data in assets:
            try:
                # Check if asset already exists
                asset_id = asset_data.get("id")
                stmt = select(Asset).where(Asset.id == asset_id)
                result = await db.execute(stmt)
                existing_asset = result.scalars().first()
                
                if existing_asset:
                    # Update existing asset
                    stmt = update(Asset).where(Asset.id == asset_id).values(
                        ticker=asset_data.get("ticker"),
                        name=asset_data.get("name"),
                        sector=asset_data.get("sector"),
                        risk_tier=asset_data.get("risk_tier"),
                        logo_url=asset_data.get("logo_url"),
                        website=asset_data.get("website"),
                        description=asset_data.get("description"),
                        market_data=asset_data.get("market_data"),
                        reserves=asset_data.get("reserves"),
                        last_updated=datetime.utcnow()
                    )
                    await db.execute(stmt)
                else:
                    # Insert new asset
                    stmt = insert(Asset).values(
                        id=asset_id,
                        ticker=asset_data.get("ticker"),
                        name=asset_data.get("name"),
                        sector=asset_data.get("sector"),
                        risk_tier=asset_data.get("risk_tier"),
                        logo_url=asset_data.get("logo_url"),
                        website=asset_data.get("website"),
                        description=asset_data.get("description"),
                        market_data=asset_data.get("market_data"),
                        reserves=asset_data.get("reserves"),
                        created_at=datetime.utcnow(),
                        last_updated=datetime.utcnow()
                    )
                    await db.execute(stmt)
            
            except Exception as e:
                logger.error(f"Error storing asset {asset_data.get('id')}: {e}")
        
        await db.commit()
        logger.info("Assets stored successfully")
    
    async def fetch_and_store_metrics(self, days_back: int = 30):
        """Fetch metrics for all assets and store them in the database."""
        logger.info(f"Fetching metrics for the past {days_back} days")
        
        # Get start and end dates
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days_back)
        
        all_metrics = []
        
        # Fetch assets from the database
        async with get_db() as db:
            stmt = select(Asset)
            result = await db.execute(stmt)
            assets = result.scalars().all()
        
        # Collect metrics for all assets from their respective adapters
        for asset in assets:
            try:
                # Determine which adapter to use based on the asset ID
                adapter = self._get_adapter_for_asset(asset.id)
                if not adapter:
                    logger.warning(f"No adapter found for asset {asset.id}")
                    continue
                
                logger.info(f"Fetching metrics for {asset.id}")
                metrics = await adapter.get_asset_metrics(
                    asset_id=asset.id,
                    start_date=start_date,
                    end_date=end_date
                )
                all_metrics.extend(metrics)
                logger.info(f"Fetched {len(metrics)} metrics for {asset.id}")
                
            except Exception as e:
                logger.error(f"Error fetching metrics for {asset.id}: {e}")
        
        # Store metrics in the database
        async with get_db() as db:
            await self._store_metrics(db, all_metrics)
    
    def _get_adapter_for_asset(self, asset_id: str) -> Optional[Any]:
        """Get the appropriate adapter for an asset ID."""
        if asset_id.startswith("usdc"):
            return self.adapters["circle"]
        elif asset_id.startswith("usdt"):
            return self.adapters["tether"]
        elif asset_id in ["ousd", "ohmydai", "ousg"]:
            return self.adapters["ondo"]
        elif asset_id in ["stbt", "mtbt", "ltbt"]:
            return self.adapters["matrixdock"]
        return None
    
    async def _store_metrics(self, db: AsyncSession, metrics: List[Dict[str, Any]]):
        """Store metrics in the database."""
        logger.info(f"Storing {len(metrics)} metrics in the database")
        
        for metric_data in metrics:
            try:
                # Check if metric already exists for this timestamp
                asset_id = metric_data.get("asset_id")
                metric_type = metric_data.get("metric_type")
                timestamp = metric_data.get("timestamp")
                
                stmt = select(AssetMetric).where(
                    AssetMetric.asset_id == asset_id,
                    AssetMetric.metric_type == metric_type,
                    AssetMetric.timestamp == timestamp
                )
                result = await db.execute(stmt)
                existing_metric = result.scalars().first()
                
                if existing_metric:
                    # Update existing metric
                    stmt = update(AssetMetric).where(
                        AssetMetric.asset_id == asset_id,
                        AssetMetric.metric_type == metric_type,
                        AssetMetric.timestamp == timestamp
                    ).values(
                        value=metric_data.get("value"),
                        last_updated=datetime.utcnow()
                    )
                    await db.execute(stmt)
                else:
                    # Insert new metric
                    stmt = insert(AssetMetric).values(
                        asset_id=asset_id,
                        metric_type=metric_type,
                        value=metric_data.get("value"),
                        timestamp=timestamp,
                        created_at=datetime.utcnow(),
                        last_updated=datetime.utcnow()
                    )
                    await db.execute(stmt)
            
            except Exception as e:
                logger.error(f"Error storing metric for {metric_data.get('asset_id')}: {e}")
        
        await db.commit()
        logger.info("Metrics stored successfully")
    
    async def update_risk_scores(self):
        """Update risk scores for all assets using the risk scoring engine."""
        logger.info("Updating risk scores for all assets")
        
        try:
            # Use the risk scoring engine to calculate and update risk scores
            risk_scores = await self.risk_engine.update_asset_risk_scores()
            logger.info(f"Updated risk scores for {len(risk_scores)} assets")
            return risk_scores
        except Exception as e:
            logger.error(f"Error updating risk scores: {e}")
            raise
