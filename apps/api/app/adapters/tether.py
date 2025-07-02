import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import httpx

from .base import BaseAdapter
from ...models import Sector, RiskTier

logger = logging.getLogger(__name__)

class TetherAdapter(BaseAdapter):
    """Adapter for Tether's API to fetch USDT data."""
    
    def __init__(self, api_key: str = None):
        """Initialize the Tether adapter.
        
        Args:
            api_key: API key (currently not used as Tether's API is public)
        """
        base_url = "https://api.tether.to"
        super().__init__(api_key=api_key, base_url=base_url)
        self.default_headers = {
            "Content-Type": "application/json",
        }
    
    async def get_asset_data(self, asset_id: str = "usdt") -> Dict[str, Any]:
        """Get data for USDT.
        
        Args:
            asset_id: Asset ID (default: "usdt")
            
        Returns:
            Dict containing USDT data in our standard format
        """
        # Get market data from CoinGecko
        cg_url = "https://api.coingecko.com/api/v3/coins/tether"
        
        try:
            async with httpx.AsyncClient() as client:
                # Get market data
                response = await client.get(cg_url, params={"tickers": "false"})
                response.raise_for_status()
                data = response.json()
                
                # Get USDT supply data
                supply_url = "https://api.tether.to/v1/market/current"
                supply_response = await client.get(supply_url)
                supply_data = supply_response.json() if supply_response.status_code == 200 else {}
            
            # Get reserve data from Tether's transparency page
            reserve_data = await self._get_reserve_data()
            
            # Calculate market cap using circulating supply and price
            circulating_supply = data["market_data"].get("circulating_supply")
            price = data["market_data"].get("current_price", {}).get("usd", 1.0)
            market_cap = circulating_supply * price if circulating_supply and price else None
            
            # Combine all data
            return self.to_asset_model({
                "id": "usdt",
                "ticker": "USDT",
                "name": "Tether",
                "sector": Sector.STABLE_COIN,
                "risk_tier": RiskTier.CASH_CORE,
                "logo_url": "https://cryptologos.cc/logos/tether-usdt-logo.png",
                "website": "https://tether.to/",
                "description": "Tether (USDT) is a stablecoin pegged to the US Dollar.",
                "market_data": {
                    "price_usd": price,
                    "market_cap": market_cap,
                    "circulating_supply": circulating_supply,
                    "total_supply": data["market_data"].get("total_supply"),
                    "price_change_24h": data["market_data"].get("price_change_24h"),
                    "price_change_percentage_24h": data["market_data"].get("price_change_percentage_24h"),
                },
                "reserves": reserve_data,
                "last_updated": datetime.utcnow().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Error fetching USDT data: {e}")
            raise
    
    async def _get_reserve_data(self) -> Dict[str, Any]:
        """Get USDT reserve attestation data."""
        # This is a simplified example - in production, you'd fetch from Tether's transparency page
        return {
            "total_reserves": None,  # Would be fetched from attestation
            "reserve_breakdown": [
                {"type": "cash_and_cash_equivalents", "amount": None, "percentage": None},
                {"type": "commercial_paper", "amount": None, "percentage": None},
                {"type": "treasury_bills", "amount": None, "percentage": None},
                {"type": "corporate_bonds", "amount": None, "percentage": None},
                {"type": "other_investments", "amount": None, "percentage": None}
            ],
            "attestation_date": None,
            "attestation_url": "https://tether.to/transparency/"
        }
    
    async def get_asset_metrics(
        self, 
        asset_id: str = "usdt", 
        start_date: datetime = None, 
        end_date: datetime = None
    ) -> List[Dict[str, Any]]:
        """Get historical metrics for USDT.
        
        Args:
            asset_id: Asset ID (default: "usdt")
            start_date: Start date for historical data
            end_date: End date for historical data
            
        Returns:
            List of historical metrics in our standard format
        """
        if start_date is None:
            start_date = datetime.utcnow() - timedelta(days=30)
        if end_date is None:
            end_date = datetime.utcnow()
            
        # Convert to timestamps in seconds
        from_timestamp = int(start_date.timestamp())
        to_timestamp = int(end_date.timestamp())
        
        try:
            # Get historical price data from CoinGecko
            cg_url = "https://api.coingecko.com/api/v3/coins/tether/market_chart/range"
            params = {
                "vs_currency": "usd",
                "from": from_timestamp,
                "to": to_timestamp,
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(cg_url, params=params)
                response.raise_for_status()
                data = response.json()
            
            # Format the data into our standard metric format
            metrics = []
            for timestamp, price in data.get("prices", []):
                metrics.append(self.to_metric_model({
                    "asset_id": "usdt",
                    "metric_type": "price_usd",
                    "value": price,
                    "timestamp": datetime.fromtimestamp(timestamp / 1000)
                }))
                
            # Add volume data if available
            for timestamp, volume in data.get("total_volumes", []):
                metrics.append(self.to_metric_model({
                    "asset_id": "usdt",
                    "metric_type": "volume_24h",
                    "value": volume,
                    "timestamp": datetime.fromtimestamp(timestamp / 1000)
                }))
                
            return metrics
            
        except Exception as e:
            logger.error(f"Error fetching USDT historical data: {e}")
            raise
    
    async def list_assets(self) -> List[Dict[str, Any]]:
        """List all available assets from Tether (just USDT for now)."""
        usdt_data = await self.get_asset_data()
        return [usdt_data]
    
    def get_risk_score(self, asset_data: Dict[str, Any]) -> float:
        """Calculate risk score for USDT.
        
        USDT has had controversies around reserves, so we'll give it a slightly
        higher risk score than other stablecoins.
        """
        # Base score for stablecoins (lower is better)
        score = 2.0  # Start with slightly higher risk due to past controversies
        
        # Adjust based on market cap (higher is better)
        market_cap = asset_data.get("market_data", {}).get("market_cap", 0)
        if market_cap < 10_000_000_000:  # Less than $10B
            score += 0.5
        
        # Adjust based on reserves (if available)
        reserves = asset_data.get("reserves", {})
        if not reserves.get("total_reserves"):
            score += 0.5  # Unknown reserves increase risk
            
        return min(max(score, 1.0), 5.0)  # Ensure score is between 1 and 5
