import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import httpx

from app.adapters.base import BaseAdapter
from app.models import Sector, RiskTier

logger = logging.getLogger(__name__)


class MatrixDockAdapter(BaseAdapter):
    """Adapter for MatrixDock's API to fetch tokenized US Treasury data."""
    
    def __init__(self, api_key: str = None):
        """Initialize the MatrixDock adapter.
        
        Args:
            api_key: MatrixDock API key (optional, some endpoints may not require it)
        """
        base_url = "https://api.matrixdock.com"
        super().__init__(api_key=api_key, base_url=base_url)
        self.default_headers = {
            "Content-Type": "application/json",
        }
        
        # Map of asset IDs to their metadata
        self.asset_metadata = {
            "stbt": {
                "ticker": "STBT",
                "name": "Short-Term Treasury Bill Token",
                "description": "Tokenized short-term US Treasury bills",
                "logo_url": "https://matrixdock.com/images/logo.png",
                "website": "https://matrixdock.com",
                "sector": Sector.TOKENIZED_RWA,
                "risk_tier": RiskTier.YIELD_PLUS,
            },
            "mtbt": {
                "ticker": "MTBT",
                "name": "Medium-Term Treasury Bond Token",
                "description": "Tokenized medium-term US Treasury bonds",
                "logo_url": "https://matrixdock.com/images/logo.png",
                "website": "https://matrixdock.com",
                "sector": Sector.TOKENIZED_RWA,
                "risk_tier": RiskTier.INCOME_PLUS,
            },
            "ltbt": {
                "ticker": "LTBT",
                "name": "Long-Term Treasury Bond Token",
                "description": "Tokenized long-term US Treasury bonds",
                "logo_url": "https://matrixdock.com/images/logo.png",
                "website": "https://matrixdock.com",
                "sector": Sector.TOKENIZED_RWA,
                "risk_tier": RiskTier.BALANCED,
            },
        }
    
    async def get_asset_data(self, asset_id: str) -> Dict[str, Any]:
        """Get data for a MatrixDock tokenized asset.
        
        Args:
            asset_id: Asset ID (e.g., "stbt", "mtbt", "ltbt")
            
        Returns:
            Dict containing asset data in our standard format
        """
        if asset_id not in self.asset_metadata:
            raise ValueError(f"Unsupported asset_id: {asset_id}")
            
        metadata = self.asset_metadata[asset_id]
        
        try:
            # Get yield data from MatrixDock API
            yield_data = await self._get_yield_data(asset_id)
            
            # Get underlying assets and reserve data
            reserve_data = await self._get_reserve_data(asset_id)
            
            # Get price data (in a real implementation, this would come from an API)
            price_data = await self._get_price_data(asset_id)
            
            # Combine all data
            return self.to_asset_model({
                "id": asset_id,
                "ticker": metadata["ticker"],
                "name": metadata["name"],
                "sector": metadata["sector"],
                "risk_tier": metadata["risk_tier"],
                "logo_url": metadata["logo_url"],
                "website": metadata["website"],
                "description": metadata["description"],
                "market_data": {
                    "price_usd": price_data.get("price"),
                    "yield_7d_apy": yield_data.get("yield_7d_apy"),
                    "yield_30d_apy": yield_data.get("yield_30d_apy"),
                    "duration_years": yield_data.get("duration"),
                    "maturity_date": yield_data.get("maturity_date"),
                    "nav_per_share": price_data.get("nav"),
                },
                "reserves": reserve_data,
                "last_updated": datetime.utcnow().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Error fetching {asset_id} data: {e}")
            raise
    
    async def _get_yield_data(self, asset_id: str) -> Dict[str, Any]:
        """Get yield data for a MatrixDock product."""
        # This is a placeholder - in production, you'd fetch this from MatrixDock's API
        yield_map = {
            "stbt": {
                "yield_7d_apy": 4.8,
                "yield_30d_apy": 4.75,
                "duration": 0.25,  # years
                "maturity_date": (datetime.utcnow() + timedelta(days=90)).strftime("%Y-%m-%d"),
            },
            "mtbt": {
                "yield_7d_apy": 5.1,
                "yield_30d_apy": 5.05,
                "duration": 2.5,  # years
                "maturity_date": (datetime.utcnow() + timedelta(days=912)).strftime("%Y-%m-%d"),
            },
            "ltbt": {
                "yield_7d_apy": 5.4,
                "yield_30d_apy": 5.35,
                "duration": 7.5,  # years
                "maturity_date": (datetime.utcnow() + timedelta(days=2737)).strftime("%Y-%m-%d"),
            },
        }
        return yield_map.get(asset_id, {})
    
    async def _get_price_data(self, asset_id: str) -> Dict[str, Any]:
        """Get price and NAV data for a MatrixDock product."""
        # This is a placeholder - in production, you'd fetch this from MatrixDock's API
        price_map = {
            "stbt": {
                "price": 100.05,  # Slightly above $100 due to accrued interest
                "nav": 100.0,     # NAV is typically $100 for T-bill tokens
            },
            "mtbt": {
                "price": 98.75,   # Price can fluctuate based on interest rates
                "nav": 100.0,     # NAV at issuance
            },
            "ltbt": {
                "price": 95.20,   # More price volatility for longer durations
                "nav": 100.0,     # NAV at issuance
            },
        }
        return price_map.get(asset_id, {})
    
    async def _get_reserve_data(self, asset_id: str) -> Dict[str, Any]:
        """Get reserve data for a MatrixDock product."""
        # This is a simplified example - in production, you'd fetch from MatrixDock's API
        reserve_map = {
            "stbt": {
                "underlying_assets": [
                    {"type": "us_treasury_bills_3m", "percentage": 100.0},
                ],
                "nav_per_share": 100.0,
                "nav_update_date": (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d"),
                "prospectus_url": "https://matrixdock.com/documents"
            },
            "mtbt": {
                "underlying_assets": [
                    {"type": "us_treasury_notes_2y", "percentage": 100.0},
                ],
                "nav_per_share": 100.0,
                "nav_update_date": (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d"),
                "prospectus_url": "https://matrixdock.com/documents"
            },
            "ltbt": {
                "underlying_assets": [
                    {"type": "us_treasury_bonds_10y", "percentage": 100.0},
                ],
                "nav_per_share": 100.0,
                "nav_update_date": (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d"),
                "prospectus_url": "https://matrixdock.com/documents"
            },
        }
        return reserve_map.get(asset_id, {})
    
    async def get_asset_metrics(
        self, 
        asset_id: str, 
        start_date: datetime = None, 
        end_date: datetime = None
    ) -> List[Dict[str, Any]]:
        """Get historical metrics for a MatrixDock asset.
        
        Args:
            asset_id: Asset ID (e.g., "stbt", "mtbt", "ltbt")
            start_date: Start date for historical data
            end_date: End date for historical data
            
        Returns:
            List of historical metrics in our standard format
        """
        if asset_id not in self.asset_metadata:
            raise ValueError(f"Unsupported asset_id: {asset_id}")
            
        if start_date is None:
            start_date = datetime.utcnow() - timedelta(days=30)
        if end_date is None:
            end_date = datetime.utcnow()
            
        try:
            # In a real implementation, we would fetch historical data from MatrixDock's API
            # For now, we'll generate some synthetic data
            metrics = []
            current_date = start_date
            
            # Get current yield data
            yield_data = await self._get_yield_data(asset_id)
            price_data = await self._get_price_data(asset_id)
            
            # Generate daily data points
            while current_date <= end_date:
                # Add slight randomness to simulate market movements
                price_noise = (hash(f"{asset_id}{current_date.date()}") % 100) / 1000  # -0.05 to 0.05
                yield_noise = (hash(f"yield{asset_id}{current_date.date()}") % 100) / 1000  # -0.05 to 0.05
                
                # Add price metric
                metrics.append(self.to_metric_model({
                    "asset_id": asset_id,
                    "metric_type": "price_usd",
                    "value": price_data.get("price", 100.0) * (1 + price_noise),
                    "timestamp": current_date
                }))
                
                # Add yield metrics
                metrics.append(self.to_metric_model({
                    "asset_id": asset_id,
                    "metric_type": "yield_7d_apy",
                    "value": yield_data.get("yield_7d_apy", 5.0) * (1 + yield_noise),
                    "timestamp": current_date
                }))
                
                current_date += timedelta(days=1)
                
            return metrics
            
        except Exception as e:
            logger.error(f"Error fetching {asset_id} historical data: {e}")
            raise
    
    async def list_assets(self) -> List[Dict[str, Any]]:
        """List all available assets from MatrixDock."""
        assets = []
        for asset_id in self.asset_metadata:
            try:
                asset_data = await self.get_asset_data(asset_id)
                assets.append(asset_data)
            except Exception as e:
                logger.error(f"Error fetching {asset_id} data: {e}")
        return assets
    
    def get_risk_score(self, asset_data: Dict[str, Any]) -> float:
        """Calculate risk score for a MatrixDock asset.
        
        Risk is based on duration and type of underlying Treasury securities.
        """
        # Start with the base risk tier (1-5 scale, lower is better)
        base_scores = {
            RiskTier.CASH_CORE: 1.0,
            RiskTier.INCOME: 2.0,
            RiskTier.INCOME_PLUS: 2.5,
            RiskTier.BALANCED: 3.0,
            RiskTier.GROWTH: 4.0,
            RiskTier.AGGRESSIVE: 5.0,
        }
        
        risk_tier = asset_data.get("risk_tier", RiskTier.BALANCED)
        score = base_scores.get(risk_tier, 3.0)
        
        # Adjust based on duration (longer duration = higher risk)
        duration = asset_data.get("market_data", {}).get("duration_years", 0)
        if duration > 5:  # Long duration
            score += 0.5
        elif duration > 1:  # Medium duration
            score += 0.25
            
        # Adjust based on price volatility
        price = asset_data.get("market_data", {}).get("price_usd", 100.0)
        if abs(price - 100.0) > 5.0:  # Significant price deviation from par
            score += 0.5
            
        return min(max(score, 1.0), 5.0)  # Ensure score is between 1 and 5
