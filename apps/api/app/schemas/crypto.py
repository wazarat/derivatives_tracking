from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Union
from datetime import datetime

class CryptoAssetResponse(BaseModel):
    """Response model for a single cryptocurrency asset"""
    data: Dict[str, Any] = Field(..., description="Cryptocurrency data")
    timestamp: str = Field(..., description="Response timestamp")

class CryptoAssetListResponse(BaseModel):
    """Response model for a list of cryptocurrency assets"""
    data: List[Dict[str, Any]] = Field(..., description="List of cryptocurrency data")
    page: int = Field(1, description="Current page number")
    per_page: int = Field(..., description="Number of results per page")
    total: int = Field(..., description="Total number of results")
    timestamp: str = Field(..., description="Response timestamp")

class CryptoMetricsResponse(BaseModel):
    """Response model for cryptocurrency metrics"""
    coin_id: str = Field(..., description="Coin ID")
    metrics: Dict[str, List[Dict[str, Any]]] = Field(..., description="Metrics grouped by type")
    days: int = Field(..., description="Number of days of data")
    start_date: str = Field(..., description="Start date of data")
    end_date: str = Field(..., description="End date of data")
    timestamp: str = Field(..., description="Response timestamp")

class CryptoHistoryResponse(BaseModel):
    """Response model for cryptocurrency historical data"""
    data: Dict[str, List[List[Union[int, float]]]] = Field(..., description="Historical data (prices, market_caps, total_volumes)")
    coin_id: str = Field(..., description="Coin ID")
    vs_currency: str = Field(..., description="Target currency")
    days: Union[int, str] = Field(..., description="Number of days of data")
    interval: Optional[str] = Field(None, description="Data interval")
    timestamp: str = Field(..., description="Response timestamp")

class CryptoGlobalDataResponse(BaseModel):
    """Response model for global cryptocurrency data"""
    data: Dict[str, Any] = Field(..., description="Global cryptocurrency data")
    timestamp: str = Field(..., description="Response timestamp")
