from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from ..database import Base

class Sector(str, enum.Enum):
    CURRENCY = "currency"
    SMART_CONTRACT_PLATFORM = "smart_contract_platform"
    DEFI = "defi"
    NFT = "nft"
    GAMING = "gaming"
    METAVERSE = "metaverse"
    PRIVACY = "privacy"
    STORAGE = "storage"
    SCALING = "scaling"
    EXCHANGE = "exchange"
    LENDING = "lending"
    ORACLE = "oracle"
    STABLECOIN = "stablecoin"
    MEME = "meme"
    OTHER = "other"

class RiskTier(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    EXTREME = "extreme"

class Asset(Base):
    __tablename__ = "assets"

    id = Column(String, primary_key=True)
    ticker = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    sector = Column(Enum(Sector), nullable=False, default=Sector.OTHER)
    risk_tier = Column(Enum(RiskTier), nullable=False, default=RiskTier.MEDIUM)
    
    # Market data
    market_cap = Column(Float, nullable=True)
    market_cap_rank = Column(Integer, nullable=True)
    fully_diluted_valuation = Column(Float, nullable=True)
    price_usd = Column(Float, nullable=True)
    price_change_24h = Column(Float, nullable=True)
    price_change_percentage_24h = Column(Float, nullable=True)
    price_change_percentage_7d = Column(Float, nullable=True)
    price_change_percentage_30d = Column(Float, nullable=True)
    volume_24h = Column(Float, nullable=True)
    circulating_supply = Column(Float, nullable=True)
    total_supply = Column(Float, nullable=True)
    max_supply = Column(Float, nullable=True)
    
    # Risk metrics
    risk_score = Column(Float, nullable=True)
    volatility_score = Column(Float, nullable=True)
    momentum_score = Column(Float, nullable=True)
    correlation_score = Column(Float, nullable=True)
    sharpe_ratio = Column(Float, nullable=True)
    
    # Metadata
    logo_url = Column(String, nullable=True)
    description = Column(String, nullable=True)
    website = Column(String, nullable=True)
    twitter = Column(String, nullable=True)
    github = Column(String, nullable=True)
    reddit = Column(String, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    metrics = relationship("AssetMetric", back_populates="asset", cascade="all, delete-orphan")

class AssetMetric(Base):
    __tablename__ = "asset_metrics"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    asset_id = Column(String, ForeignKey("assets.id"), nullable=False)
    metric_type = Column(String, nullable=False)
    value = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    asset = relationship("Asset", back_populates="metrics")

class Market(Base):
    __tablename__ = "markets"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    total_market_cap_usd = Column(Float, nullable=True)
    total_volume_24h_usd = Column(Float, nullable=True)
    bitcoin_dominance = Column(Float, nullable=True)
    ethereum_dominance = Column(Float, nullable=True)
    active_cryptocurrencies = Column(Integer, nullable=True)
    active_exchanges = Column(Integer, nullable=True)
    last_updated = Column(DateTime, nullable=True)
