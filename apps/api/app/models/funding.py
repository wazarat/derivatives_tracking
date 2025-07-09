from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from datetime import datetime

from app.database import Base

class FundingRate(Base):
    """Model for storing cryptocurrency funding rate data"""
    
    __tablename__ = "funding_rates"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True, nullable=False)
    exchange = Column(String, index=True, nullable=False)
    rate = Column(Float, nullable=False)
    next_funding_time = Column(DateTime, nullable=True)
    timestamp = Column(DateTime, default=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<FundingRate(symbol='{self.symbol}', exchange='{self.exchange}', rate={self.rate})>"
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            "id": self.id,
            "symbol": self.symbol,
            "exchange": self.exchange,
            "rate": self.rate,
            "next_funding_time": self.next_funding_time.isoformat() if self.next_funding_time else None,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }
