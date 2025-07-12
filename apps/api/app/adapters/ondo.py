import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import httpx
import os

from app.adapters.base import BaseAdapter
from app.models import Sector, RiskTier

logger = logging.getLogger(__name__)


class OndoAdapter(BaseAdapter):
    """Adapter for Ondo Finance's API to fetch tokenized RWA data."""
    
    def __init__(self, api_key: str = None):
        """Initialize the Ondo adapter.
        
        Args:
            api_key: Ondo API key (optional, some endpoints may not require it)
        """
        base_url = "https://api.ondo.finance"
        super().__init__(api_key=api_key, base_url=base_url)
        self.default_headers = {
            "Content-Type": "application/json",
        }
        
        # CoinMarketCap API setup
        self.cmc_api_key = os.environ.get("COINMARKETCAP_API_KEY")
        self.cmc_base_url = "https://pro-api.coinmarketcap.com/v1"
        self.cmc_headers = {
            "X-CMC_PRO_API_KEY": self.cmc_api_key,
            "Accept": "application/json"
        }
        
        # Map of asset IDs to their metadata
        self.asset_metadata = {
            "ousd": {
                "ticker": "OUSD",
                "name": "Ondo USD Yield",
                "description": "Tokenized cash equivalent backed by short-term US Treasuries",
                "logo_url": "https://assets.ondofinance.com/images/tokens/ousd.png",
                "website": "https://ondo.finance",
                "sector": Sector.TOKENIZED_RWA,
                "risk_tier": RiskTier.YIELD_PLUS,
                "cmc_symbol": "OUSD"  # CoinMarketCap symbol
            },
            "ohmydai": {
                "ticker": "OHMDAI",
                "name": "Ondo DAI Yield",
                "description": "Tokenized DAI yield product backed by real-world assets",
                "logo_url": "https://assets.ondofinance.com/images/tokens/ohmydai.png",
                "website": "https://ondo.finance",
                "sector": Sector.TOKENIZED_RWA,
                "risk_tier": RiskTier.MARKET_BETA,
                "cmc_symbol": "OHMDAI"  # CoinMarketCap symbol
            },
            "ousg": {
                "ticker": "OUSG",
                "name": "Ondo Short-Term US Government Bond",
                "description": "Tokenized short-term US Treasury bond fund",
                "logo_url": "https://assets.ondofinance.com/images/tokens/ousg.png",
                "website": "https://ondo.finance",
                "sector": Sector.TOKENIZED_RWA,
                "risk_tier": RiskTier.YIELD_PLUS,
                "cmc_symbol": "OUSG"  # CoinMarketCap symbol
            },
        }
    
    async def get_asset_data(self, asset_id: str) -> Dict[str, Any]:
        """Get data for an Ondo tokenized asset.
        
        Args:
            asset_id: Asset ID (e.g., "ousd", "ohmydai", "ousg")
            
        Returns:
            Dict containing asset data in our standard format
        """
        if asset_id not in self.asset_metadata:
            raise ValueError(f"Unsupported asset_id: {asset_id}")
            
        metadata = self.asset_metadata[asset_id]
        cmc_symbol = metadata.get("cmc_symbol", metadata["ticker"])
        
        try:
            # Get market data from CoinMarketCap
            cmc_url = f"{self.cmc_base_url}/cryptocurrency/quotes/latest"
            
            async with httpx.AsyncClient() as client:
                # Get market data
                response = await client.get(
                    cmc_url,
                    headers=self.cmc_headers,
                    params={"symbol": cmc_symbol, "convert": "USD"}
                )
                response.raise_for_status()
                data = response.json()
                
                # Extract data from response
                token_data = data.get("data", {}).get(cmc_symbol, {})
                quote = token_data.get("quote", {}).get("USD", {})
                
                # Get APY/APR data from Ondo API if available
                apy = await self._get_apy(asset_id)
            
            # Get underlying assets and reserve data
            reserve_data = await self._get_reserve_data(asset_id)
            
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
                    "price_usd": quote.get("price"),
                    "market_cap": quote.get("market_cap"),
                    "circulating_supply": token_data.get("circulating_supply"),
                    "total_supply": token_data.get("total_supply"),
                    "price_change_24h": quote.get("percent_change_24h"),
                    "price_change_percentage_24h": quote.get("percent_change_24h"),
                    "yield_7d_apy": apy,
                },
                "reserves": reserve_data,
                "last_updated": datetime.utcnow().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Error fetching {asset_id} data: {e}")
            raise
    
    async def _get_apy(self, asset_id: str) -> Optional[float]:
        """Get the current APY for an Ondo product."""
        # This is a placeholder - in production, you'd fetch this from Ondo's API
        # or a DeFi rate provider like DefiLlama
        apy_map = {
            "ousd": 4.25,  # Example APY
            "ohmydai": 5.1,
            "ousg": 4.8
        }
        return apy_map.get(asset_id)
    
    async def _get_reserve_data(self, asset_id: str) -> Dict[str, Any]:
        """Get reserve data for an Ondo product."""
        # This is a simplified example - in production, you'd fetch from Ondo's API
        reserve_map = {
            "ousd": {
                "underlying_assets": [
                    {"type": "us_treasury_bills", "percentage": 85.0},
                    {"type": "money_market_funds", "percentage": 10.0},
                    {"type": "cash_equivalents", "percentage": 5.0}
                ],
                "nav_per_share": 1.0,
                "nav_update_date": (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d"),
                "prospectus_url": "https://ondo.finance/documents"
            },
            "ohmydai": {
                "underlying_assets": [
                    {"type": "decentralized_finance", "percentage": 70.0},
                    {"type": "us_treasury_bills", "percentage": 20.0},
                    {"type": "stablecoin_yield", "percentage": 10.0}
                ],
                "nav_per_share": 1.02,
                "nav_update_date": (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d"),
                "prospectus_url": "https://ondo.finance/documents"
            },
            "ousg": {
                "underlying_assets": [
                    {"type": "short_term_us_treasuries", "percentage": 95.0},
                    {"type": "cash_equivalents", "percentage": 5.0}
                ],
                "nav_per_share": 25.67,
                "nav_update_date": (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d"),
                "prospectus_url": "https://ondo.finance/documents"
            }
        }
        return reserve_map.get(asset_id, {})
    
    async def get_asset_metrics(
        self, 
        asset_id: str, 
        start_date: datetime = None, 
        end_date: datetime = None
    ) -> List[Dict[str, Any]]:
        """Get historical metrics for an Ondo asset.
        
        Args:
            asset_id: Asset ID (e.g., "ousd", "ohmydai", "ousg")
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
            
        # Convert to timestamps
        start_str = start_date.strftime("%Y-%m-%d")
        end_str = end_date.strftime("%Y-%m-%d")
        
        metadata = self.asset_metadata[asset_id]
        cmc_symbol = metadata.get("cmc_symbol", metadata["ticker"])
        
        try:
            # Get historical price data from CoinMarketCap
            cmc_url = f"{self.cmc_base_url}/cryptocurrency/quotes/historical"
            params = {
                "symbol": cmc_symbol,
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
                    "asset_id": asset_id,
                    "metric_type": "price_usd",
                    "value": quote_data.get("price"),
                    "timestamp": datetime.fromisoformat(timestamp) if timestamp else None
                }))
                
                # Add volume data if available
                metrics.append(self.to_metric_model({
                    "asset_id": asset_id,
                    "metric_type": "volume_24h",
                    "value": quote_data.get("volume_24h"),
                    "timestamp": datetime.fromisoformat(timestamp) if timestamp else None
                }))
                
            # Add APY data (simplified - in prod, you'd fetch historical APY)
            apy = await self._get_apy(asset_id)
            if apy:
                metrics.append(self.to_metric_model({
                    "asset_id": asset_id,
                    "metric_type": "yield_7d_apy",
                    "value": apy,
                    "timestamp": datetime.utcnow()
                }))
                
            return metrics
            
        except Exception as e:
            logger.error(f"Error fetching {asset_id} historical data: {e}")
            raise
    
    async def list_assets(self) -> List[Dict[str, Any]]:
        """List all available assets from Ondo Finance."""
        assets = []
        for asset_id in self.asset_metadata:
            try:
                asset_data = await self.get_asset_data(asset_id)
                assets.append(asset_data)
            except Exception as e:
                logger.error(f"Error fetching {asset_id} data: {e}")
        return assets
    
    def get_risk_score(self, asset_data: Dict[str, Any]) -> float:
        """Calculate risk score for an Ondo asset.
        
        Risk is based on the underlying assets and historical volatility.
        """
        # Start with the base risk tier (1-5 scale, lower is better)
        base_scores = {
            RiskTier.CASH_CORE: 1.0,
            RiskTier.YIELD_PLUS: 2.0,
            RiskTier.MARKET_BETA: 3.0,
            RiskTier.TACTICAL_EDGE: 4.0,
            RiskTier.MOON_SHOT: 5.0,
        }
        
        risk_tier = asset_data.get("risk_tier", RiskTier.MARKET_BETA)
        score = base_scores.get(risk_tier, 3.0)
        
        # Adjust based on market cap (higher is better)
        market_cap = asset_data.get("market_data", {}).get("market_cap", 0)
        if market_cap < 100_000_000:  # Less than $100M
            score += 0.5
            
        # Adjust based on liquidity (trading volume)
        volume_24h = asset_data.get("market_data", {}).get("volume_24h", 0)
        if volume_24h < 1_000_000:  # Less than $1M daily volume
            score += 0.5
            
        return min(max(score, 1.0), 5.0)  # Ensure score is between 1 and 5
