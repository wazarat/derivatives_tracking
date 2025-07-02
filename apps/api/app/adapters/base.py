from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import logging
import httpx
from datetime import datetime

logger = logging.getLogger(__name__)

class BaseAdapter(ABC):
    """Base class for all data source adapters."""
    
    def __init__(self, api_key: str = None, base_url: str = None):
        """Initialize the adapter with API key and base URL."""
        self.api_key = api_key
        self.base_url = base_url.rstrip('/') if base_url else ''
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()
    
    async def _make_request(
        self, 
        method: str, 
        endpoint: str, 
        params: Optional[Dict[str, Any]] = None,
        json_data: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Make an HTTP request to the API."""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        
        # Add API key to headers if provided
        request_headers = headers or {}
        if self.api_key:
            request_headers["Authorization"] = f"Bearer {self.api_key}"
        
        try:
            response = await self.client.request(
                method=method,
                url=url,
                params=params,
                json=json_data,
                headers=request_headers
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error: {e}")
            raise
        except Exception as e:
            logger.error(f"Request failed: {e}")
            raise
    
    @abstractmethod
    async def get_asset_data(self, asset_id: str) -> Dict[str, Any]:
        """Get data for a specific asset."""
        pass
    
    @abstractmethod
    async def get_asset_metrics(
        self, 
        asset_id: str, 
        start_date: datetime = None, 
        end_date: datetime = None
    ) -> List[Dict[str, Any]]:
        """Get historical metrics for an asset."""
        pass
    
    @abstractmethod
    async def list_assets(self) -> List[Dict[str, Any]]:
        """List all available assets from this data source."""
        pass
    
    @abstractmethod
    def get_risk_score(self, asset_data: Dict[str, Any]) -> float:
        """Calculate risk score for an asset based on its data."""
        pass
    
    def to_asset_model(self, asset_data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert API-specific asset data to our standard format."""
        return {
            "id": asset_data.get("id"),
            "ticker": asset_data.get("ticker"),
            "name": asset_data.get("name"),
            "sector": asset_data.get("sector"),
            "risk_tier": asset_data.get("risk_tier"),
            "logo_url": asset_data.get("logo_url"),
            "website": asset_data.get("website"),
            "description": asset_data.get("description"),
            "is_active": asset_data.get("is_active", True),
            "metadata": asset_data  # Store raw data for reference
        }
    
    def to_metric_model(self, metric_data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert API-specific metric data to our standard format."""
        return {
            "asset_id": metric_data.get("asset_id"),
            "metric_type": metric_data.get("metric_type"),
            "value": metric_data.get("value"),
            "timestamp": metric_data.get("timestamp"),
            "metadata": metric_data  # Store raw data for reference
        }
