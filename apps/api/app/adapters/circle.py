import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import httpx
import os

from app.adapters.base import BaseAdapter
from app.models import Sector, RiskTier

logger = logging.getLogger(__name__)

class CircleAdapter(BaseAdapter):
    """Adapter for Circle's API to fetch USDC data."""
    
    def __init__(self, api_key: str = None):
        """Initialize the Circle adapter.
        
        Args:
            api_key: Circle API key (optional, some endpoints may not require it)
        """
        base_url = "https://api.circle.com/v1"
        super().__init__(api_key=api_key, base_url=base_url)
        self.default_headers = {
            "Content-Type": "application/json",
        }
        self.cmc_api_key = os.environ.get("COINMARKETCAP_API_KEY")
        self.cmc_base_url = "https://pro-api.coinmarketcap.com/v1"
        self.cmc_headers = {
            "X-CMC_PRO_API_KEY": self.cmc_api_key,
            "Accept": "application/json"
        }
    
    async def get_asset_data(self, asset_id: str = "usdc") -> Dict[str, Any]:
        """Get data for USDC.
        
        Args:
            asset_id: Asset ID (default: "usdc")
            
        Returns:
            Dict containing USDC data in our standard format
        """
        # Get market data from CoinMarketCap as Circle doesn't provide this directly
        cmc_url = f"{self.cmc_base_url}/cryptocurrency/quotes/latest"
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    cmc_url, 
                    headers=self.cmc_headers,
                    params={"symbol": "USDC", "convert": "USD"}
                )
                response.raise_for_status()
                data = response.json()
                
                # Extract USDC data from response
                usdc_data = data.get("data", {}).get("USDC", {})
                quote = usdc_data.get("quote", {}).get("USD", {})
                
            # Get circulating supply and market cap from Circle's API
            supply_data = await self._make_request(
                "GET",
                "/supply/usdc",
                headers=self.default_headers
            )
            
            # Get reserve attestations from Circle's transparency page
            reserve_data = await self._get_reserve_data()
            
            # Combine all data
            return self.to_asset_model({
                "id": "usdc",
                "ticker": "USDC",
                "name": "USD Coin",
                "sector": Sector.STABLE_COIN,
                "risk_tier": RiskTier.CASH_CORE,
                "logo_url": "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
                "website": "https://www.circle.com/en/usdc",
                "description": "USD Coin (USDC) is a fully regulated, fiat-collateralized stablecoin.",
                "market_data": {
                    "price_usd": quote.get("price"),
                    "market_cap": quote.get("market_cap"),
                    "circulating_supply": supply_data.get("amount") or usdc_data.get("circulating_supply"),
                    "total_supply": supply_data.get("amount") or usdc_data.get("total_supply"),
                    "price_change_24h": quote.get("percent_change_24h"),
                    "price_change_percentage_24h": quote.get("percent_change_24h"),
                },
                "reserves": reserve_data,
                "last_updated": datetime.utcnow().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Error fetching USDC data: {e}")
            raise
    
    async def _get_reserve_data(self) -> Dict[str, Any]:
        """Get USDC reserve attestation data."""
        # This is a simplified example - in production, you'd fetch from Circle's transparency page
        # or their attestation API if available
        return {
            "total_reserves": None,  # Would be fetched from attestation
            "reserve_breakdown": [
                {"type": "cash", "amount": None, "percentage": None},
                {"type": "short_term_treasuries", "amount": None, "percentage": None},
                {"type": "commercial_paper", "amount": None, "percentage": None}
            ],
            "attestation_date": None,
            "attestation_url": "https://www.centre.io/transparency"
        }
    
    async def get_asset_metrics(
        self, 
        asset_id: str = "usdc", 
        start_date: datetime = None, 
        end_date: datetime = None
    ) -> List[Dict[str, Any]]:
        """Get historical metrics for USDC.
        
        Args:
            asset_id: Asset ID (default: "usdc")
            start_date: Start date for historical data
            end_date: End date for historical data
            
        Returns:
            List of historical metrics in our standard format
        """
        if start_date is None:
            start_date = datetime.utcnow() - timedelta(days=30)
        if end_date is None:
            end_date = datetime.utcnow()
            
        # Convert to timestamps
        start_str = start_date.strftime("%Y-%m-%d")
        end_str = end_date.strftime("%Y-%m-%d")
        
        try:
            # Get historical price data from CoinMarketCap
            cmc_url = f"{self.cmc_base_url}/cryptocurrency/quotes/historical"
            params = {
                "symbol": "USDC",
                "time_start": start_str,
                "time_end": end_str,
                "count": 500,  # Maximum allowed by CMC
                "interval": "daily",
                "convert": "USD"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(cmc_url, headers=self.cmc_headers, params=params)
                response.raise_for_status()
                data = response.json()
            
            # Format the data into our standard metric format
            metrics = []
            quotes = data.get("data", {}).get("quotes", [])
            
            for quote in quotes:
                timestamp = quote.get("timestamp")
                quote_data = quote.get("quote", {}).get("USD", {})
                
                # Add price data
                metrics.append(self.to_metric_model({
                    "asset_id": "usdc",
                    "metric_type": "price_usd",
                    "value": quote_data.get("price"),
                    "timestamp": datetime.fromisoformat(timestamp) if timestamp else None
                }))
                
                # Add volume data if available
                metrics.append(self.to_metric_model({
                    "asset_id": "usdc",
                    "metric_type": "volume_24h",
                    "value": quote_data.get("volume_24h"),
                    "timestamp": datetime.fromisoformat(timestamp) if timestamp else None
                }))
                
            return metrics
            
        except Exception as e:
            logger.error(f"Error fetching USDC historical data: {e}")
            raise
    
    async def list_assets(self) -> List[Dict[str, Any]]:
        """List all available assets from Circle (just USDC for now)."""
        usdc_data = await self.get_asset_data()
        return [usdc_data]
    
    def get_risk_score(self, asset_data: Dict[str, Any]) -> float:
        """Calculate risk score for USDC.
        
        Since USDC is a stablecoin, it should have a low risk score.
        We'll use reserve backing and market cap as indicators.
        """
        # Base score for stablecoins (lower is better)
        score = 1.0  # Start with minimum risk
        
        # Adjust based on market cap (higher is better)
        market_cap = asset_data.get("market_data", {}).get("market_cap", 0)
        if market_cap < 1_000_000_000:  # Less than $1B
            score += 0.5
        
        # Adjust based on reserves (if available)
        reserves = asset_data.get("reserves", {})
        if not reserves.get("total_reserves"):
            score += 0.5  # Unknown reserves increase risk
            
        return min(max(score, 1.0), 5.0)  # Ensure score is between 1 and 5
