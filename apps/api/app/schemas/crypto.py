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
    symbol: str
    name: str
    price: Optional[float] = None
    price_change_24h: Optional[float] = None
    price_change_percentage_24h: Optional[float] = None
    market_cap: Optional[float] = None
    market_cap_rank: Optional[int] = None
    total_volume: Optional[float] = None
    high_24h: Optional[float] = None
    low_24h: Optional[float] = None
    circulating_supply: Optional[float] = None
    total_supply: Optional[float] = None
    max_supply: Optional[float] = None
    ath: Optional[float] = None
    ath_change_percentage: Optional[float] = None
    ath_date: Optional[datetime] = None
    atl: Optional[float] = None
    atl_change_percentage: Optional[float] = None
    atl_date: Optional[datetime] = None
    last_updated: Optional[datetime] = None
    price_change_percentage_1h: Optional[float] = None
    price_change_percentage_7d: Optional[float] = None
    price_change_percentage_14d: Optional[float] = None
    price_change_percentage_30d: Optional[float] = None
    price_change_percentage_200d: Optional[float] = None
    price_change_percentage_1y: Optional[float] = None
    market_cap_change_24h: Optional[float] = None
    market_cap_change_percentage_24h: Optional[float] = None
    
    class Config:
        orm_mode = True
        schema_extra = {
            "example": {
                "symbol": "BTC",
                "name": "Bitcoin",
                "price": 50000.0,
                "price_change_24h": 1000.0,
                "price_change_percentage_24h": 2.0,
                "market_cap": 950000000000.0,
                "market_cap_rank": 1,
                "total_volume": 30000000000.0,
                "high_24h": 51000.0,
                "low_24h": 49000.0,
                "circulating_supply": 19000000.0,
                "total_supply": 21000000.0,
                "max_supply": 21000000.0,
                "ath": 69000.0,
                "ath_change_percentage": -27.5,
                "ath_date": "2021-11-10T14:24:11.849Z",
                "atl": 67.81,
                "atl_change_percentage": 73732.9,
                "atl_date": "2013-07-06T00:00:00.000Z",
                "last_updated": "2023-04-01T12:30:00.000Z",
                "price_change_percentage_1h": 0.1,
                "price_change_percentage_7d": 5.2,
                "price_change_percentage_14d": 10.5,
                "price_change_percentage_30d": 15.3,
                "price_change_percentage_200d": 45.7,
                "price_change_percentage_1y": 120.5,
                "market_cap_change_24h": 19000000000.0,
                "market_cap_change_percentage_24h": 2.0
            }
        }

class HistoryDataPoint(BaseModel):
    """Data point for historical data"""
    timestamp: int  # Unix timestamp in milliseconds
    value: float
    
    class Config:
        orm_mode = True

class CryptoHistoryResponse(BaseModel):
    """Response model for cryptocurrency historical data"""
    symbol: str
    name: str
    interval: str  # "daily" or "hourly"
    days: int
    price_history: List[HistoryDataPoint]
    volume_history: List[HistoryDataPoint]
    market_cap_history: List[HistoryDataPoint]
    last_updated: datetime
    
    class Config:
        orm_mode = True
        schema_extra = {
            "example": {
                "symbol": "BTC",
                "name": "Bitcoin",
                "interval": "daily",
                "days": 30,
                "price_history": [
                    {"timestamp": 1617235200000, "value": 58000.0},
                    {"timestamp": 1617321600000, "value": 59000.0}
                ],
                "volume_history": [
                    {"timestamp": 1617235200000, "value": 55000000000.0},
                    {"timestamp": 1617321600000, "value": 57000000000.0}
                ],
                "market_cap_history": [
                    {"timestamp": 1617235200000, "value": 1100000000000.0},
                    {"timestamp": 1617321600000, "value": 1120000000000.0}
                ],
                "last_updated": "2023-04-01T12:30:00.000Z"
            }
        }

class CryptoGlobalDataResponse(BaseModel):
    """Response model for global cryptocurrency data"""
    data: Dict[str, Any] = Field(..., description="Global cryptocurrency data")
    timestamp: str = Field(..., description="Response timestamp")
