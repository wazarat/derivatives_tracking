# Models module
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Table, Enum, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from datetime import datetime
import enum

Base = declarative_base()

# Association tables
# Removed redundant portfolio_assets Table definition

class Sector(str, enum.Enum):
    NATIVE_CRYPTO = "native_crypto"
    STABLECOINS = "stablecoins"
    TOKENIZED_RWA = "tokenized_rwa"
    ETFS = "etfs"
    YIELD_PROTOCOLS = "yield_protocols"
    DERIVATIVES = "derivatives"
    NETWORK_PARTICIPATION = "network_participation"
    VENTURE = "venture"
    DIGITAL_COLLECTIBLES = "digital_collectibles"

class RiskTier(int, enum.Enum):
    CASH_CORE = 1
    YIELD_PLUS = 2
    MARKET_BETA = 3
    TACTICAL_EDGE = 4
    MOON_SHOT = 5

class User(Base):
    __tablename__ = 'users'

    id = Column(String, primary_key=True, index=True)  # Auth provider ID
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    avatar_url = Column(String)
    objective_json = Column(JSON)  # Stores T1-T5 weights
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Relationships
    portfolios = relationship("Portfolio", back_populates="owner")
    watchlist = relationship("Watchlist", back_populates="user")

class Asset(Base):
    __tablename__ = 'assets'

    id = Column(String, primary_key=True, index=True)  # UUID
    ticker = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    sector = Column(Enum(Sector), nullable=False)
    risk_tier = Column(Enum(RiskTier), nullable=False)
    logo_url = Column(String)
    website = Column(String)
    description = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Relationships
    metrics = relationship("AssetMetric", back_populates="asset")
    portfolio_associations = relationship("PortfolioAsset", back_populates="asset")
    watchlist_associations = relationship("Watchlist", back_populates="asset")

class AssetMetric(Base):
    __tablename__ = 'asset_metrics'

    id = Column(String, primary_key=True, index=True)  # UUID
    asset_id = Column(String, ForeignKey('assets.id'), nullable=False)
    metric_type = Column(String, nullable=False)  # e.g., 'price', 'apy', 'volume_24h'
    value = Column(Float, nullable=False)
    timestamp = Column(DateTime, server_default=func.now())
    
    # Relationships
    asset = relationship("Asset", back_populates="metrics")

class Portfolio(Base):
    __tablename__ = 'portfolios'

    id = Column(String, primary_key=True, index=True)  # UUID
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String)
    is_public = Column(Boolean, default=False)
    slug = Column(String, unique=True, index=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="portfolios")
    assets = relationship("PortfolioAsset", back_populates="portfolio")

class PortfolioAsset(Base):
    __tablename__ = 'portfolio_assets'
    
    id = Column(String, primary_key=True, index=True)  # UUID
    portfolio_id = Column(String, ForeignKey('portfolios.id'), nullable=False)
    asset_id = Column(String, ForeignKey('assets.id'), nullable=False)
    weight = Column(Float, nullable=False)  # 0.0 to 1.0 (0% to 100%)
    notes = Column(String)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Relationships
    portfolio = relationship("Portfolio", back_populates="assets")
    asset = relationship("Asset", back_populates="portfolio_associations")

class Watchlist(Base):
    __tablename__ = 'watchlist'
    
    id = Column(String, primary_key=True, index=True)  # UUID
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    asset_id = Column(String, ForeignKey('assets.id'), nullable=False)
    notes = Column(String)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="watchlist")
    asset = relationship("Asset", back_populates="watchlist_associations")
    
    __table_args__ = (
        # Ensure a user can only have an asset in their watchlist once
        {'sqlite_autoincrement': True},
    )

class Event(Base):
    __tablename__ = 'events'
    
    id = Column(String, primary_key=True, index=True)  # UUID
    event_type = Column(String, nullable=False)  # e.g., 'price_alert', 'news', 'risk_change'
    title = Column(String, nullable=False)
    description = Column(String)
    event_metadata = Column(JSON)  # Flexible field for event-specific data
    is_read = Column(Boolean, default=False)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    related_asset_id = Column(String, ForeignKey('assets.id'))
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    user = relationship("User")
    related_asset = relationship("Asset")

from .crypto import Asset, AssetMetric, Market, Sector, RiskTier

__all__ = ["Asset", "AssetMetric", "Market", "Sector", "RiskTier"]
