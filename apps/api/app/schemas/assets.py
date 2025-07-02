from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional, Dict, Any
from ..models import Sector, RiskTier

class AssetBase(BaseModel):
    id: str
    ticker: str
    name: str
    sector: Sector
    risk_tier: RiskTier
    logo_url: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }

class AssetMetricBase(BaseModel):
    id: str
    asset_id: str
    metric_type: str
    value: float
    timestamp: datetime

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }

class AssetResponse(BaseModel):
    data: AssetBase

class AssetListResponse(BaseModel):
    data: List[AssetBase]
    total: int
    skip: int
    limit: int

class AssetMetricsResponse(BaseModel):
    asset_id: str
    metrics: List[AssetMetricBase]
    start_date: datetime
    end_date: datetime
    count: int

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }

class AssetRiskScoreResponse(BaseModel):
    asset_id: str
    risk_tier: RiskTier
    score: int
    updated_at: datetime

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }

class AssetCreate(BaseModel):
    ticker: str
    name: str
    sector: Sector
    risk_tier: RiskTier
    logo_url: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None

class AssetUpdate(BaseModel):
    ticker: Optional[str] = None
    name: Optional[str] = None
    sector: Optional[Sector] = None
    risk_tier: Optional[RiskTier] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class AssetMetricCreate(BaseModel):
    asset_id: str
    metric_type: str
    value: float
    timestamp: Optional[datetime] = None
