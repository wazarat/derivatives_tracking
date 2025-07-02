import logging
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..models import Asset, AssetMetric, RiskTier
from ..database import get_db

logger = logging.getLogger(__name__)

class RiskScoringEngine:
    """
    Risk scoring engine that calculates composite risk scores based on
    volatility, drawdown, liquidity, and other metrics.
    
    The risk score is on a scale of 1-5, where:
    1 = Very Low Risk (Cash Core)
    2 = Low Risk (Income)
    2.5 = Low-Medium Risk (Income Plus)
    3 = Medium Risk (Balanced)
    4 = Medium-High Risk (Growth)
    5 = High Risk (Aggressive)
    """
    
    def __init__(self):
        """Initialize the risk scoring engine."""
        # Weights for different risk components
        self.weights = {
            "volatility": 0.4,
            "drawdown": 0.3,
            "liquidity": 0.2,
            "base_risk": 0.1
        }
        
        # Risk tier base scores
        self.base_scores = {
            RiskTier.CASH_CORE: 1.0,
            RiskTier.INCOME: 2.0,
            RiskTier.INCOME_PLUS: 2.5,
            RiskTier.BALANCED: 3.0,
            RiskTier.GROWTH: 4.0,
            RiskTier.AGGRESSIVE: 5.0,
        }
    
    async def calculate_risk_scores(self, days_back: int = 90) -> Dict[str, float]:
        """
        Calculate risk scores for all assets based on historical data.
        
        Args:
            days_back: Number of days of historical data to use
            
        Returns:
            Dictionary mapping asset IDs to risk scores
        """
        logger.info(f"Calculating risk scores using {days_back} days of historical data")
        
        # Get start and end dates
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days_back)
        
        risk_scores = {}
        
        async with get_db() as db:
            # Get all assets
            stmt = select(Asset)
            result = await db.execute(stmt)
            assets = result.scalars().all()
            
            for asset in assets:
                try:
                    # Calculate risk score for each asset
                    risk_score = await self.calculate_asset_risk_score(
                        db, asset, start_date, end_date
                    )
                    risk_scores[asset.id] = risk_score
                    logger.info(f"Calculated risk score for {asset.id}: {risk_score}")
                except Exception as e:
                    logger.error(f"Error calculating risk score for {asset.id}: {e}")
        
        return risk_scores
    
    async def calculate_asset_risk_score(
        self, 
        db: AsyncSession, 
        asset: Asset, 
        start_date: datetime, 
        end_date: datetime
    ) -> float:
        """
        Calculate risk score for a specific asset.
        
        Args:
            db: Database session
            asset: Asset to calculate risk score for
            start_date: Start date for historical data
            end_date: End date for historical data
            
        Returns:
            Risk score (1-5 scale)
        """
        # Get price data for the asset
        price_data = await self._get_price_data(db, asset.id, start_date, end_date)
        
        if not price_data or len(price_data) < 7:  # Need at least a week of data
            logger.warning(f"Insufficient price data for {asset.id}, using base risk score")
            return self.base_scores.get(asset.risk_tier, 3.0)
        
        # Calculate volatility score (1-5)
        volatility_score = self._calculate_volatility_score(price_data)
        
        # Calculate drawdown score (1-5)
        drawdown_score = self._calculate_drawdown_score(price_data)
        
        # Calculate liquidity score (1-5)
        liquidity_score = await self._calculate_liquidity_score(db, asset.id, start_date, end_date)
        
        # Get base risk score from asset's risk tier
        base_risk_score = self.base_scores.get(asset.risk_tier, 3.0)
        
        # Calculate weighted composite score
        composite_score = (
            self.weights["volatility"] * volatility_score +
            self.weights["drawdown"] * drawdown_score +
            self.weights["liquidity"] * liquidity_score +
            self.weights["base_risk"] * base_risk_score
        )
        
        # Ensure score is between 1 and 5
        return min(max(composite_score, 1.0), 5.0)
    
    async def _get_price_data(
        self, 
        db: AsyncSession, 
        asset_id: str, 
        start_date: datetime, 
        end_date: datetime
    ) -> List[Tuple[datetime, float]]:
        """
        Get historical price data for an asset.
        
        Args:
            db: Database session
            asset_id: Asset ID
            start_date: Start date
            end_date: End date
            
        Returns:
            List of (timestamp, price) tuples
        """
        stmt = select(AssetMetric).where(
            AssetMetric.asset_id == asset_id,
            AssetMetric.metric_type == "price_usd",
            AssetMetric.timestamp >= start_date,
            AssetMetric.timestamp <= end_date
        ).order_by(AssetMetric.timestamp)
        
        result = await db.execute(stmt)
        metrics = result.scalars().all()
        
        return [(metric.timestamp, metric.value) for metric in metrics]
    
    def _calculate_volatility_score(self, price_data: List[Tuple[datetime, float]]) -> float:
        """
        Calculate volatility score based on price data.
        
        Args:
            price_data: List of (timestamp, price) tuples
            
        Returns:
            Volatility score (1-5 scale)
        """
        # Extract prices and convert to numpy array
        prices = np.array([price for _, price in price_data])
        
        if len(prices) < 2:
            return 1.0  # Default to low risk if not enough data
        
        # Calculate daily returns
        returns = np.diff(prices) / prices[:-1]
        
        # Calculate annualized volatility (standard deviation of returns * sqrt(365))
        volatility = np.std(returns) * np.sqrt(365)
        
        # Map volatility to 1-5 scale
        # These thresholds are based on typical asset class volatilities
        if volatility < 0.005:  # Less than 0.5% annualized vol (like cash)
            return 1.0
        elif volatility < 0.02:  # Less than 2% (like short-term bonds)
            return 2.0
        elif volatility < 0.05:  # Less than 5% (like medium-term bonds)
            return 2.5
        elif volatility < 0.10:  # Less than 10% (like long-term bonds)
            return 3.0
        elif volatility < 0.20:  # Less than 20% (like balanced portfolios)
            return 4.0
        else:  # 20%+ (like equities or crypto)
            return 5.0
    
    def _calculate_drawdown_score(self, price_data: List[Tuple[datetime, float]]) -> float:
        """
        Calculate drawdown score based on price data.
        
        Args:
            price_data: List of (timestamp, price) tuples
            
        Returns:
            Drawdown score (1-5 scale)
        """
        # Extract prices
        prices = np.array([price for _, price in price_data])
        
        if len(prices) < 2:
            return 1.0  # Default to low risk if not enough data
        
        # Calculate running maximum
        running_max = np.maximum.accumulate(prices)
        
        # Calculate drawdowns
        drawdowns = (running_max - prices) / running_max
        
        # Get maximum drawdown
        max_drawdown = np.max(drawdowns)
        
        # Map maximum drawdown to 1-5 scale
        if max_drawdown < 0.001:  # Less than 0.1% drawdown
            return 1.0
        elif max_drawdown < 0.01:  # Less than 1% drawdown
            return 2.0
        elif max_drawdown < 0.03:  # Less than 3% drawdown
            return 2.5
        elif max_drawdown < 0.10:  # Less than 10% drawdown
            return 3.0
        elif max_drawdown < 0.20:  # Less than 20% drawdown
            return 4.0
        else:  # 20%+ drawdown
            return 5.0
    
    async def _calculate_liquidity_score(
        self, 
        db: AsyncSession, 
        asset_id: str, 
        start_date: datetime, 
        end_date: datetime
    ) -> float:
        """
        Calculate liquidity score based on trading volume.
        
        Args:
            db: Database session
            asset_id: Asset ID
            start_date: Start date
            end_date: End date
            
        Returns:
            Liquidity score (1-5 scale)
        """
        # Get volume data
        stmt = select(AssetMetric).where(
            AssetMetric.asset_id == asset_id,
            AssetMetric.metric_type == "volume_24h",
            AssetMetric.timestamp >= start_date,
            AssetMetric.timestamp <= end_date
        )
        
        result = await db.execute(stmt)
        metrics = result.scalars().all()
        
        if not metrics:
            # If no volume data, use a default medium-high risk score
            return 4.0
        
        # Calculate average daily volume
        avg_volume = sum(metric.value for metric in metrics) / len(metrics)
        
        # Map average volume to 1-5 scale (higher volume = lower risk)
        if avg_volume > 1_000_000_000:  # $1B+ daily volume
            return 1.0
        elif avg_volume > 100_000_000:  # $100M+ daily volume
            return 2.0
        elif avg_volume > 10_000_000:  # $10M+ daily volume
            return 3.0
        elif avg_volume > 1_000_000:  # $1M+ daily volume
            return 4.0
        else:  # Less than $1M daily volume
            return 5.0
    
    async def update_asset_risk_scores(self, days_back: int = 90) -> Dict[str, float]:
        """
        Calculate and update risk scores for all assets in the database.
        
        Args:
            days_back: Number of days of historical data to use
            
        Returns:
            Dictionary mapping asset IDs to updated risk scores
        """
        risk_scores = await self.calculate_risk_scores(days_back)
        
        # Update risk scores in the database
        async with get_db() as db:
            for asset_id, risk_score in risk_scores.items():
                try:
                    # Update asset with new risk score
                    from sqlalchemy import update
                    stmt = update(Asset).where(Asset.id == asset_id).values(
                        risk_score=risk_score,
                        last_updated=datetime.utcnow()
                    )
                    await db.execute(stmt)
                except Exception as e:
                    logger.error(f"Error updating risk score for {asset_id}: {e}")
            
            await db.commit()
        
        return risk_scores
