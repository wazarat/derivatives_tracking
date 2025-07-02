from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, or_, desc, asc
from datetime import datetime, timedelta
from enum import Enum

from ..database import get_db
from ..models import Asset, AssetMetric, Sector, RiskTier
from ..schemas.assets import AssetResponse, AssetListResponse, AssetMetricsResponse, AssetRiskScoreResponse

router = APIRouter(
    prefix="/assets",
    tags=["assets"],
    responses={404: {"description": "Not found"}},
)

class SortField(str, Enum):
    NAME = "name"
    TICKER = "ticker"
    RISK_SCORE = "risk_score"
    MARKET_CAP = "market_cap"
    PRICE = "price"
    VOLUME = "volume"
    CREATED_AT = "created_at"
    UPDATED_AT = "updated_at"

class SortOrder(str, Enum):
    ASC = "asc"
    DESC = "desc"

@router.get("/", response_model=AssetListResponse)
async def list_assets(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    sectors: Annotated[List[Sector], Query()] = None,
    risk_tiers: Annotated[List[RiskTier], Query()] = None,
    min_risk_score: Optional[float] = None,
    max_risk_score: Optional[float] = None,
    search: Optional[str] = None,
    sort_by: SortField = SortField.NAME,
    sort_order: SortOrder = SortOrder.ASC,
    is_active: bool = True
):
    """
    List all assets with comprehensive filtering and sorting options.
    
    - **sectors**: Filter by one or more sectors
    - **risk_tiers**: Filter by one or more risk tiers
    - **min_risk_score**: Minimum risk score (1-5 scale)
    - **max_risk_score**: Maximum risk score (1-5 scale)
    - **search**: Search in name, ticker, and description
    - **sort_by**: Field to sort by
    - **sort_order**: Sort order (asc or desc)
    - **is_active**: Filter by active status
    """
    # Start building the query
    query = select(Asset).where(Asset.is_active == is_active)
    
    # Apply sector filter if provided
    if sectors:
        query = query.where(Asset.sector.in_(sectors))
    
    # Apply risk tier filter if provided
    if risk_tiers:
        query = query.where(Asset.risk_tier.in_(risk_tiers))
    
    # Apply risk score range filter if provided
    if min_risk_score is not None:
        query = query.where(Asset.risk_score >= min_risk_score)
    if max_risk_score is not None:
        query = query.where(Asset.risk_score <= max_risk_score)
    
    # Apply search filter if provided
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            or_(
                Asset.name.ilike(search_pattern),
                Asset.ticker.ilike(search_pattern),
                Asset.description.ilike(search_pattern)
            )
        )
    
    # Apply sorting
    if sort_order == SortOrder.ASC:
        sort_func = asc
    else:
        sort_func = desc
        
    # Handle special sorting cases
    if sort_by == SortField.NAME:
        query = query.order_by(sort_func(Asset.name))
    elif sort_by == SortField.TICKER:
        query = query.order_by(sort_func(Asset.ticker))
    elif sort_by == SortField.RISK_SCORE:
        query = query.order_by(sort_func(Asset.risk_score))
    elif sort_by == SortField.CREATED_AT:
        query = query.order_by(sort_func(Asset.created_at))
    elif sort_by == SortField.UPDATED_AT:
        query = query.order_by(sort_func(Asset.updated_at))
    elif sort_by in [SortField.MARKET_CAP, SortField.PRICE, SortField.VOLUME]:
        # For these fields, we need to extract from the market_data JSON
        # This is a simplification - in a real implementation, you might want to
        # use proper JSON extraction functions specific to your database
        query = query.order_by(sort_func(Asset.market_data))
    
    # Count total results (without pagination)
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.execute(count_query)
    total_count = total.scalar_one()
    
    # Apply pagination
    query = query.offset(skip).limit(limit)
    
    # Execute query
    result = await db.execute(query)
    assets = result.scalars().all()
    
    return {
        "data": assets,
        "total": total_count,
        "skip": skip,
        "limit": limit
    }

@router.get("/{asset_id}", response_model=AssetResponse)
async def get_asset(
    asset_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed information about a specific asset by ID.
    """
    query = select(Asset).where(Asset.id == asset_id)
    result = await db.execute(query)
    asset = result.scalars().first()
    
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    return {"data": asset}

@router.get("/{asset_id}/metrics", response_model=AssetMetricsResponse)
async def get_asset_metrics(
    asset_id: str,
    metric_type: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """
    Get historical metrics for a specific asset.
    
    - **asset_id**: ID of the asset
    - **metric_type**: Type of metric to retrieve (e.g., price_usd, volume_24h)
    - **start_date**: Start date for the metrics
    - **end_date**: End date for the metrics
    - **limit**: Maximum number of metrics to return
    """
    # Verify asset exists
    asset_query = select(Asset).where(Asset.id == asset_id)
    asset_result = await db.execute(asset_query)
    asset = asset_result.scalars().first()
    
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Set default time range if not provided
    if not end_date:
        end_date = datetime.utcnow()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    # Build metrics query
    query = select(AssetMetric).where(
        AssetMetric.asset_id == asset_id,
        AssetMetric.timestamp >= start_date,
        AssetMetric.timestamp <= end_date
    )
    
    if metric_type:
        query = query.where(AssetMetric.metric_type == metric_type)
    
    # Get the most recent metrics first
    query = query.order_by(desc(AssetMetric.timestamp)).limit(limit)
    
    result = await db.execute(query)
    metrics = result.scalars().all()
    
    return {
        "asset_id": asset_id,
        "metrics": metrics,
        "start_date": start_date,
        "end_date": end_date,
        "count": len(metrics)
    }

@router.get("/{asset_id}/risk-score", response_model=AssetRiskScoreResponse)
async def get_asset_risk_score(
    asset_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get the current risk score for an asset.
    
    Returns the calculated risk score based on volatility, drawdown, and liquidity metrics.
    """
    query = select(Asset).where(Asset.id == asset_id)
    result = await db.execute(query)
    asset = result.scalars().first()
    
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    return {
        "asset_id": asset_id,
        "risk_tier": asset.risk_tier,
        "score": asset.risk_score or float(asset.risk_tier.value),
        "updated_at": asset.last_updated or datetime.utcnow()
    }

@router.get("/sectors", response_model=List[str])
async def list_sectors():
    """
    List all available asset sectors.
    """
    return [sector.value for sector in Sector]

@router.get("/risk-tiers", response_model=List[str])
async def list_risk_tiers():
    """
    List all available risk tiers.
    """
    return [tier.value for tier in RiskTier]
