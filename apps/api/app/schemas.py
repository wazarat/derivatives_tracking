from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class CryptoMetric(BaseModel):
    """
    Schema for cryptocurrency metrics
    """
    id: Optional[int] = None
    name: Optional[str] = None
    symbol: Optional[str] = None
    price: Optional[float] = None
    percent_change_24h: Optional[float] = None
    volume_24h: Optional[float] = None
    market_cap: Optional[float] = None
    last_updated: Optional[str] = None

class MarketOverview(BaseModel):
    """
    Schema for market overview data
    """
    total_market_cap: Optional[float] = None
    total_volume_24h: Optional[float] = None
    btc_dominance: Optional[float] = None
    eth_dominance: Optional[float] = None
    active_cryptocurrencies: Optional[int] = None
    last_updated: Optional[str] = None

class MarketMetrics(BaseModel):
    """
    Schema for market metrics
    """
    id: str
    name: str
    symbol: str
    price: float
    volume_24h: float
    market_cap: float
    percent_change_24h: float
    funding_rate: Optional[float] = None

class Asset(BaseModel):
    """
    Schema for asset details
    """
    id: str
    name: str
    symbol: str
    description: Optional[str] = None
    website: Optional[str] = None
    explorer: Optional[str] = None
    twitter: Optional[str] = None
    reddit: Optional[str] = None
    github: Optional[str] = None
    logo: Optional[str] = None
    price: Optional[float] = None
    market_cap: Optional[float] = None
    volume_24h: Optional[float] = None
    percent_change_24h: Optional[float] = None
    percent_change_7d: Optional[float] = None
    percent_change_30d: Optional[float] = None
    circulating_supply: Optional[float] = None
    total_supply: Optional[float] = None
    max_supply: Optional[float] = None
    last_updated: Optional[str] = None

class HistoricalData(BaseModel):
    """
    Schema for historical price data
    """
    timestamp: int
    price: float
    volume: Optional[float] = None
    market_cap: Optional[float] = None

class HistoricalDataResponse(BaseModel):
    """
    Schema for historical data response
    """
    id: str
    symbol: str
    name: str
    data: List[HistoricalData]

class Sector(BaseModel):
    """
    Schema for sector data
    """
    id: str
    name: str
    description: Optional[str] = None
    market_cap: Optional[float] = None
    volume_24h: Optional[float] = None
    percent_change_24h: Optional[float] = None
    assets: Optional[List[str]] = None

class Mover(BaseModel):
    """
    Schema for market movers
    """
    id: str
    name: str
    symbol: str
    price: float
    percent_change_24h: float
    volume_24h: Optional[float] = None
    market_cap: Optional[float] = None

class MoversResponse(BaseModel):
    """
    Schema for market movers response
    """
    gainers: List[Mover]
    losers: List[Mover]

class TrendingAsset(BaseModel):
    """
    Schema for trending asset
    """
    id: str
    name: str
    symbol: str
    price: Optional[float] = None
    percent_change_24h: Optional[float] = None
    market_cap: Optional[float] = None
    volume_24h: Optional[float] = None
    score: Optional[int] = None

# Watchlist schemas
class WatchlistBase(BaseModel):
    symbol: str
    usd_value: float

class WatchlistCreate(WatchlistBase):
    pass

class WatchlistUpdate(BaseModel):
    usd_value: float

class WatchlistResponse(WatchlistBase):
    id: int
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class CryptoMetricsResponse(BaseModel):
    """
    Schema for detailed cryptocurrency metrics response
    """
    symbol: str
    name: str
    price: Optional[float] = None
    price_change_24h: Optional[float] = None
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
    ath_date: Optional[str] = None
    atl: Optional[float] = None
    atl_change_percentage: Optional[float] = None
    atl_date: Optional[str] = None
    last_updated: Optional[str] = None
    price_change_percentage_1h: Optional[float] = None
    price_change_percentage_7d: Optional[float] = None
    price_change_percentage_14d: Optional[float] = None
    price_change_percentage_30d: Optional[float] = None
    price_change_percentage_200d: Optional[float] = None
    price_change_percentage_1y: Optional[float] = None
    market_cap_change_24h: Optional[float] = None
    market_cap_change_percentage_24h: Optional[float] = None

class HistoryDataPoint(BaseModel):
    """
    Schema for a single history data point
    """
    timestamp: int
    value: float

class CryptoHistoryResponse(BaseModel):
    """
    Schema for cryptocurrency historical data response
    """
    symbol: str
    name: str
    interval: str
    days: int
    price_history: List[HistoryDataPoint]
    volume_history: List[HistoryDataPoint]
    market_cap_history: List[HistoryDataPoint]
    last_updated: datetime
