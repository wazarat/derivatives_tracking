from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from ..etl.pipeline import ETLPipeline
from ..services.cmc_service import CMCService
from ..workers.coinmarketcap_worker import CoinMarketCapWorker
import os
from ..schemas import CryptoMetric, MarketOverview, MarketMetrics
from .. import schemas
from ..database import get_async_db
from ..adapters.supabase_cache import SupabaseCache, get_supabase_cache
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/crypto",
    tags=["crypto"],
    responses={404: {"description": "Not found"}},
)

# Pydantic models for response validation
class MarketData(BaseModel):
    total_market_cap: float = Field(..., description="Total market capitalization in USD")
    total_volume_24h: float = Field(..., description="Total 24-hour trading volume in USD")
    btc_dominance: float = Field(..., description="Bitcoin dominance percentage")
    eth_dominance: float = Field(..., description="Ethereum dominance percentage")
    active_cryptocurrencies: int = Field(..., description="Number of active cryptocurrencies")
    total_cryptocurrencies: int = Field(..., description="Total number of cryptocurrencies")
    market_cap_change_24h: float = Field(..., description="24-hour market cap change percentage")
    volume_change_24h: float = Field(..., description="24-hour volume change percentage")
    last_updated: str = Field(..., description="Last updated timestamp")

class AssetData(BaseModel):
    id: str = Field(..., description="Asset ID")
    name: str = Field(..., description="Asset name")
    symbol: str = Field(..., description="Asset symbol")
    slug: str = Field(..., description="Asset slug")
    rank: int = Field(..., description="Market cap rank")
    price: float = Field(..., description="Current price in USD")
    volume_24h: float = Field(..., description="24-hour trading volume in USD")
    market_cap: float = Field(..., description="Market capitalization in USD")
    percent_change_1h: float = Field(..., description="1-hour price change percentage")
    percent_change_24h: float = Field(..., description="24-hour price change percentage")
    percent_change_7d: float = Field(..., description="7-day price change percentage")
    circulating_supply: float = Field(..., description="Circulating supply")
    total_supply: float = Field(..., description="Total supply")
    max_supply: Optional[float] = Field(None, description="Maximum supply")
    last_updated: str = Field(..., description="Last updated timestamp")

class MarketMetrics(BaseModel):
    symbol: str = Field(..., description="Asset symbol")
    name: str = Field(..., description="Asset name")
    price: float = Field(..., description="Current price in USD")
    percent_change_24h: float = Field(..., description="24-hour price change percentage")
    volume_24h: float = Field(..., description="24-hour trading volume in USD")
    market_cap: float = Field(..., description="Market capitalization in USD")
    open_interest: float = Field(..., description="Open interest")
    funding_rate: float = Field(..., description="Funding rate")
    last_updated: str = Field(..., description="Last updated timestamp")

class DerivativeExchange(BaseModel):
    id: str = Field(..., description="Exchange ID")
    name: str = Field(..., description="Exchange name")
    slug: str = Field(..., description="Exchange slug")
    rank: int = Field(..., description="Exchange rank")
    open_interest: float = Field(..., description="Open interest in USD")
    volume_24h: float = Field(..., description="24-hour trading volume in USD")
    num_market_pairs: int = Field(..., description="Number of market pairs")
    maker_fee: float = Field(..., description="Maker fee")
    taker_fee: float = Field(..., description="Taker fee")
    funding_rate: float = Field(..., description="Funding rate")
    last_updated: str = Field(..., description="Last updated timestamp")

# Dependency to get ETL pipeline
async def get_pipeline():
    pipeline = ETLPipeline()
    await pipeline.setup()
    try:
        yield pipeline
    finally:
        pass  # No cleanup needed for pipeline

# Dependency to get CMC service
async def get_cmc_service():
    # Get CMC API key from environment
    api_key = os.environ.get("CMC_API_KEY", "")
    
    # Create worker and service
    worker = CoinMarketCapWorker(api_key=api_key)
    await worker.setup()
    
    # Start refresh loop if not already running
    await worker.start_refresh_loop()
    
    service = CMCService(cmc_worker=worker)
    
    try:
        yield service
    finally:
        pass  # Worker cleanup handled by ETL pipeline

@router.get("/markets", response_model=MarketData)
async def get_markets(pipeline: ETLPipeline = Depends(get_pipeline)):
    """
    Get global cryptocurrency market data
    """
    try:
        market_data = await pipeline.get_market()
        if not market_data:
            raise HTTPException(status_code=404, detail="Market data not found")
        return market_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching market data: {str(e)}")

@router.get("/assets", response_model=List[AssetData])
async def get_assets(
    limit: int = Query(100, description="Number of assets to return", ge=1, le=250),
    pipeline: ETLPipeline = Depends(get_pipeline)
):
    """
    Get list of cryptocurrency assets
    """
    try:
        assets = await pipeline.get_assets()
        if not assets:
            raise HTTPException(status_code=404, detail="Assets not found")
        return assets[:limit]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching assets: {str(e)}")

@router.get("/assets/{asset_id}", response_model=AssetData)
async def get_asset(
    asset_id: str,
    pipeline: ETLPipeline = Depends(get_pipeline)
):
    """
    Get data for a specific cryptocurrency asset
    
    Asset ID can be either the numeric ID or the symbol (e.g., "BTC")
    """
    try:
        asset = await pipeline.get_asset(asset_id)
        if not asset:
            raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found")
        return asset
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching asset {asset_id}: {str(e)}")

@router.get("/trending", response_model=List[AssetData])
async def get_trending(
    limit: int = Query(10, description="Number of trending assets to return", ge=1, le=50),
    pipeline: ETLPipeline = Depends(get_pipeline)
):
    """
    Get trending cryptocurrency assets
    """
    try:
        trending = await pipeline.get_trending(limit=limit)
        if not trending:
            raise HTTPException(status_code=404, detail="Trending assets not found")
        return trending
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching trending assets: {str(e)}")

@router.get("/refresh", response_model=Dict[str, str])
async def refresh_data(pipeline: ETLPipeline = Depends(get_pipeline)):
    """
    Manually trigger a refresh of all cryptocurrency data
    """
    try:
        await pipeline.run_full_pipeline()
        return {"status": "success", "message": "Data refresh completed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error refreshing data: {str(e)}")

@router.get("/dashboard-metrics", response_model=List[CryptoMetric])
async def get_dashboard_metrics(
    limit: int = Query(100, description="Number of cryptocurrencies to return"),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Get cryptocurrency metrics for the dashboard
    """
    try:
        # Get pipeline
        pipeline = ETLPipeline()
        await pipeline.setup()
        
        # Get top cryptocurrencies
        cryptocurrencies = await pipeline.get_top_cryptocurrencies(limit=limit)
        
        if not cryptocurrencies:
            raise HTTPException(status_code=404, detail="No cryptocurrency data found")
        
        # Convert to response model
        metrics = []
        for crypto in cryptocurrencies:
            metrics.append(
                CryptoMetric(
                    symbol=crypto.get("symbol", ""),
                    name=crypto.get("name", ""),
                    price=crypto.get("price", 0.0),
                    price_change_percentage_24h=crypto.get("price_change_percentage_24h", 0.0),
                    market_cap=crypto.get("market_cap", 0.0),
                    volume_24h=crypto.get("volume_24h", 0.0),
                    circulating_supply=crypto.get("circulating_supply", 0.0),
                    total_supply=crypto.get("total_supply", 0.0),
                    max_supply=crypto.get("max_supply", 0.0),
                    last_updated=crypto.get("last_updated", "")
                )
            )
        
        return metrics
    except Exception as e:
        logger.error(f"Error fetching dashboard metrics: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching dashboard metrics: {str(e)}")

@router.get("/market-overview", response_model=MarketOverview)
async def get_market_overview(
    db: AsyncSession = Depends(get_async_db)
):
    """
    Get market overview data
    """
    try:
        # Get pipeline
        pipeline = ETLPipeline()
        await pipeline.setup()
        
        # Get market overview
        overview = await pipeline.get_market_overview()
        
        if not overview:
            raise HTTPException(status_code=404, detail="Market overview data not found")
        
        # Convert to response model
        return MarketOverview(
            total_market_cap=overview.get("total_market_cap", 0.0),
            total_volume_24h=overview.get("total_volume_24h", 0.0),
            btc_dominance=overview.get("btc_dominance", 0.0),
            eth_dominance=overview.get("eth_dominance", 0.0),
            active_cryptocurrencies=overview.get("active_cryptocurrencies", 0),
            market_cap_change_percentage_24h=overview.get("market_cap_change_percentage_24h", 0.0),
            last_updated=overview.get("last_updated", "")
        )
    except Exception as e:
        logger.error(f"Error fetching market overview: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching market overview: {str(e)}")

@router.get("/metrics", response_model=List[MarketMetrics])
async def get_metrics(
    limit: int = Query(20, description="Number of markets to return", ge=1, le=100),
    sector: Optional[str] = Query(None, description="Optional sector filter (e.g., 'cex', 'dex')"),
    cmc_service: CMCService = Depends(get_cmc_service)
):
    """
    Get market metrics for cryptocurrencies with real-time data
    """
    try:
        markets = await cmc_service.get_markets(sector=sector, limit=limit)
        if not markets:
            raise HTTPException(status_code=404, detail="Market metrics not found")
        return markets
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching market metrics: {str(e)}")

@router.get("/metrics/{symbol}", response_model=schemas.CryptoMetricsResponse)
async def get_metrics_by_symbol(
    symbol: str,
    db: AsyncSession = Depends(get_async_db),
    cache: SupabaseCache = Depends(get_supabase_cache)
):
    """
    Get detailed metrics for a specific cryptocurrency by symbol.
    
    This endpoint provides comprehensive metrics including:
    - Current price and price changes
    - Market cap and volume
    - Supply information
    - All-time high/low data
    - Price change percentages for various time periods
    
    Args:
        symbol: The symbol of the cryptocurrency (e.g., BTC, ETH)
        
    Returns:
        Detailed metrics for the specified cryptocurrency
    """
    # Try to get from cache first
    cache_key = f"metrics:{symbol.lower()}"
    cached_data = await cache.get(cache_key)
    
    if cached_data:
        return schemas.CryptoMetricsResponse(**cached_data)
    
    # If not in cache, fetch from CoinMarketCap API
    try:
        # First find the asset by symbol
        from sqlalchemy import func
        from sqlalchemy.future import select
        from ..models import Asset
        
        # Convert symbol to uppercase for comparison
        query = select(Asset).where(func.upper(Asset.symbol) == symbol.upper())
        result = await db.execute(query)
        asset = result.scalar_one_or_none()
        
        if not asset:
            raise HTTPException(status_code=404, detail=f"Cryptocurrency with symbol {symbol} not found")
        
        # Initialize CoinMarketCap worker
        from ..workers.coinmarketcap_worker import CoinMarketCapWorker
        worker = CoinMarketCapWorker()
        await worker.setup()
        
        # Fetch detailed metrics
        metrics_data = await worker.get_crypto_metrics(symbol.upper())
        
        if not metrics_data:
            raise HTTPException(status_code=404, detail=f"Metrics for {symbol} not found")
        
        # Create response
        response = schemas.CryptoMetricsResponse(
            symbol=symbol.upper(),
            name=metrics_data.get("name", asset.name),
            price=metrics_data.get("price"),
            price_change_24h=metrics_data.get("price_change_24h"),
            market_cap=metrics_data.get("market_cap"),
            market_cap_rank=metrics_data.get("market_cap_rank"),
            total_volume=metrics_data.get("total_volume"),
            high_24h=metrics_data.get("high_24h"),
            low_24h=metrics_data.get("low_24h"),
            circulating_supply=metrics_data.get("circulating_supply"),
            total_supply=metrics_data.get("total_supply"),
            max_supply=metrics_data.get("max_supply"),
            ath=metrics_data.get("ath"),
            ath_change_percentage=metrics_data.get("ath_change_percentage"),
            ath_date=metrics_data.get("ath_date"),
            atl=metrics_data.get("atl"),
            atl_change_percentage=metrics_data.get("atl_change_percentage"),
            atl_date=metrics_data.get("atl_date"),
            last_updated=metrics_data.get("last_updated"),
            price_change_percentage_1h=metrics_data.get("price_change_percentage_1h"),
            price_change_percentage_7d=metrics_data.get("price_change_percentage_7d"),
            price_change_percentage_14d=metrics_data.get("price_change_percentage_14d"),
            price_change_percentage_30d=metrics_data.get("price_change_percentage_30d"),
            price_change_percentage_200d=metrics_data.get("price_change_percentage_200d"),
            price_change_percentage_1y=metrics_data.get("price_change_percentage_1y"),
            market_cap_change_24h=metrics_data.get("market_cap_change_24h"),
            market_cap_change_percentage_24h=metrics_data.get("market_cap_change_percentage_24h")
        )
        
        # Cache the result
        await cache.set(cache_key, response.dict(), ttl=300)  # Cache for 5 minutes
        
        return response
        
    except Exception as e:
        logger.error(f"Error fetching metrics for {symbol}: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching metrics data for {symbol}: {str(e)}")

@router.get("/trending-metrics", response_model=List[MarketMetrics])
async def get_trending_metrics(
    limit: int = Query(10, description="Number of trending markets to return", ge=1, le=50),
    cmc_service: CMCService = Depends(get_cmc_service)
):
    """
    Get trending market metrics with real-time data
    """
    try:
        trending = await cmc_service.get_trending_markets(limit=limit)
        if not trending:
            raise HTTPException(status_code=404, detail="Trending market metrics not found")
        return trending
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching trending market metrics: {str(e)}")

@router.get("/history/{symbol}", response_model=schemas.CryptoHistoryResponse)
async def get_history_by_symbol(
    symbol: str,
    days: int = Query(30, description="Number of days of history to return", ge=1, le=365),
    interval: Optional[str] = Query(None, description="Data interval (daily, hourly, minutely)"),
    db: AsyncSession = Depends(get_async_db),
    cache: SupabaseCache = Depends(get_supabase_cache)
):
    """
    Get historical price data for a specific cryptocurrency by symbol.
    
    This endpoint provides historical data including:
    - Price history
    - Volume history
    - Market cap history
    
    Args:
        symbol: The symbol of the cryptocurrency (e.g., BTC, ETH)
        days: Number of days of history to return (1-365)
        interval: Data interval (daily, hourly)
        
    Returns:
        Historical data for the specified cryptocurrency
    """
    # Validate parameters
    if days < 1 or days > 365:
        raise HTTPException(status_code=400, detail="Days must be between 1 and 365")
    
    if interval and interval not in ["daily", "hourly"]:
        raise HTTPException(status_code=400, detail="Interval must be 'daily' or 'hourly'")
    
    # Try to get from cache first
    cache_key = f"history:{symbol.lower()}:{days}:{interval or 'default'}"
    cached_data = await cache.get(cache_key)
    
    if cached_data:
        return schemas.CryptoHistoryResponse(**cached_data)
    
    # If not in cache, fetch from CoinMarketCap API
    try:
        # First find the asset by symbol
        from sqlalchemy import func
        from sqlalchemy.future import select
        from ..models import Asset
        
        # Convert symbol to uppercase for comparison
        query = select(Asset).where(func.upper(Asset.symbol) == symbol.upper())
        result = await db.execute(query)
        asset = result.scalar_one_or_none()
        
        if not asset:
            raise HTTPException(status_code=404, detail=f"Cryptocurrency with symbol {symbol} not found")
        
        # Initialize CoinMarketCap worker
        from ..workers.coinmarketcap_worker import CoinMarketCapWorker
        worker = CoinMarketCapWorker()
        await worker.setup()
        
        # Fetch historical data
        history_data = await worker.get_crypto_history(
            symbol=symbol.upper(),
            days=days,
            interval=interval
        )
        
        if not history_data:
            raise HTTPException(status_code=404, detail=f"Historical data for {symbol} not found")
        
        # Create response
        response = schemas.CryptoHistoryResponse(
            symbol=symbol.upper(),
            name=history_data.get("name", asset.name),
            interval=history_data.get("interval", interval or "auto"),
            days=days,
            price_history=history_data.get("price_history", []),
            volume_history=history_data.get("volume_history", []),
            market_cap_history=history_data.get("market_cap_history", []),
            last_updated=history_data.get("last_updated", datetime.utcnow())
        )
        
        # Cache the result
        await cache.set(cache_key, response.dict(), ttl=3600)  # Cache for 1 hour
        
        return response
        
    except Exception as e:
        logger.error(f"Error fetching history for {symbol}: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching history data for {symbol}: {str(e)}")
