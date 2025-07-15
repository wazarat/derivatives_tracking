from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class DerivativesRow(BaseModel):
    """
    Schema for a derivatives data row from the database
    """
    id: int
    ts: datetime = Field(..., description="Timestamp of the snapshot")
    exchange: str = Field(..., description="Exchange name (e.g., 'Binance', 'OKX')")
    symbol: str = Field(..., description="Contract symbol (e.g., 'BTCUSDT')")
    contract_type: str = Field(..., description="Either 'perpetual' or 'futures'")
    oi_usd: float = Field(..., description="Open interest in USD")
    funding_rate: Optional[float] = Field(None, description="Funding rate (%) for perpetuals, null for futures")
    volume_24h: float = Field(..., description="24-hour trading volume in USD")
    index_price: Optional[float] = Field(None, description="Current index price")
    
    class Config:
        orm_mode = True
        
class DerivativesStats(BaseModel):
    """
    Aggregated statistics for derivatives
    """
    total_oi_usd: float = Field(..., description="Total open interest in USD")
    avg_funding_rate: Optional[float] = Field(None, description="Average funding rate (%)")
    total_volume_24h: float = Field(..., description="Total 24-hour trading volume in USD")
    contract_count: int = Field(..., description="Number of contracts")
    
    class Config:
        orm_mode = True
