from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Optional, Any, Union
from datetime import datetime
import logging

from ..database import get_db
from ..services.coingecko_service import CoinGeckoService
from ..adapters.supabase_cache import SupabaseCache
from ..schemas.crypto import (
    CryptoAssetResponse, 
    CryptoAssetListResponse,
    CryptoMetricsResponse,
    CryptoHistoryResponse,
    CryptoGlobalDataResponse
)
from ..models import Asset, AssetMetric, Sector

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/crypto", tags=["crypto"])

# Dependency to get CoinGeckoService
async def get_coingecko_service(db: AsyncSession = Depends(get_db)):
    supabase_cache = SupabaseCache()
    service = CoinGeckoService(db, supabase_cache)
    try:
        yield service
    finally:
        await service.close()

@router.get("/markets", response_model=CryptoAssetListResponse)
async def get_crypto_markets(
    vs_currency: str = Query("usd", description="The target currency (e.g., usd, eur)"),
    order: str = Query("market_cap_desc", description="Sort by field (market_cap_desc, volume_desc, etc.)"),
    per_page: int = Query(100, ge=1, le=250, description="Number of results per page"),
    page: int = Query(1, ge=1, description="Page number"),
    price_change_percentage: str = Query("24h,7d", description="Include price change percentage for intervals (1h,24h,7d)"),
    sparkline: bool = Query(False, description="Include sparkline 7d data"),
    coingecko_service: CoinGeckoService = Depends(get_coingecko_service)
):
    """
    Get list of cryptocurrencies with market data
    """
    try:
        markets_data = await coingecko_service.get_coins_markets(
            vs_currency=vs_currency,
            order=order,
            per_page=per_page,
            page=page,
            price_change_percentage=price_change_percentage,
            sparkline=sparkline
        )
        
        if markets_data is None:
            raise HTTPException(status_code=503, detail="Unable to fetch market data")
        
        # Calculate total (approximate based on available data)
        total = len(markets_data) + ((page - 1) * per_page)
        
        return {
            "data": markets_data,
            "page": page,
            "per_page": per_page,
            "total": total,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error fetching crypto markets: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/assets/{coin_id}", response_model=CryptoAssetResponse)
async def get_crypto_asset(
    coin_id: str = Path(..., description="Coin ID (e.g., bitcoin, ethereum)"),
    coingecko_service: CoinGeckoService = Depends(get_coingecko_service)
):
    """
    Get detailed data for a specific cryptocurrency
    """
    try:
        coin_data = await coingecko_service.get_coin(coin_id)
        
        if coin_data is None:
            raise HTTPException(status_code=404, detail=f"Cryptocurrency with ID '{coin_id}' not found")
        
        return {
            "data": coin_data,
            "timestamp": datetime.utcnow().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching crypto asset {coin_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/assets/{coin_id}/history", response_model=CryptoHistoryResponse)
async def get_crypto_history(
    coin_id: str = Path(..., description="Coin ID (e.g., bitcoin, ethereum)"),
    vs_currency: str = Query("usd", description="The target currency (e.g., usd, eur)"),
    days: Union[int, str] = Query(7, description="Data up to number of days ago (1, 7, 14, 30, 90, 180, 365, max)"),
    interval: Optional[str] = Query(None, description="Data interval (daily, hourly, minutely)"),
    coingecko_service: CoinGeckoService = Depends(get_coingecko_service)
):
    """
    Get historical market data for a cryptocurrency
    """
    try:
        history_data = await coingecko_service.get_coin_market_chart(
            coin_id=coin_id,
            vs_currency=vs_currency,
            days=days,
            interval=interval
        )
        
        if history_data is None:
            raise HTTPException(status_code=404, detail=f"Historical data for cryptocurrency with ID '{coin_id}' not found")
        
        return {
            "data": history_data,
            "coin_id": coin_id,
            "vs_currency": vs_currency,
            "days": days,
            "interval": interval,
            "timestamp": datetime.utcnow().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching crypto history for {coin_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/global", response_model=CryptoGlobalDataResponse)
async def get_global_data(
    coingecko_service: CoinGeckoService = Depends(get_coingecko_service)
):
    """
    Get global cryptocurrency market data
    """
    try:
        global_data = await coingecko_service.get_global_data()
        
        if global_data is None:
            raise HTTPException(status_code=503, detail="Unable to fetch global market data")
        
        return {
            "data": global_data,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error fetching global crypto data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/metrics/{coin_id}", response_model=CryptoMetricsResponse)
async def get_crypto_metrics(
    coin_id: str = Path(..., description="Coin ID (e.g., bitcoin, ethereum)"),
    days: int = Query(30, description="Number of days of metrics to return"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get stored metrics for a cryptocurrency from the database
    """
    try:
        # Get asset by coin_id
        asset = await db.get(Asset, coin_id)
        if not asset:
            raise HTTPException(status_code=404, detail=f"Asset with ID '{coin_id}' not found")
        
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date.replace(day=end_date.day - days) if days < end_date.day else end_date.replace(month=end_date.month - 1, day=30)
        
        # Query metrics
        stmt = (
            Asset.select()
            .where(Asset.id == coin_id)
            .options(
                Asset.metrics.and_(
                    AssetMetric.timestamp >= start_date,
                    AssetMetric.timestamp <= end_date
                )
            )
        )
        
        result = await db.execute(stmt)
        asset_with_metrics = result.scalar_one_or_none()
        
        if not asset_with_metrics:
            raise HTTPException(status_code=404, detail=f"No metrics found for asset with ID '{coin_id}'")
        
        # Group metrics by type
        metrics_by_type = {}
        for metric in asset_with_metrics.metrics:
            if metric.metric_type not in metrics_by_type:
                metrics_by_type[metric.metric_type] = []
            
            metrics_by_type[metric.metric_type].append({
                "value": metric.value,
                "timestamp": metric.timestamp.isoformat()
            })
        
        return {
            "coin_id": coin_id,
            "metrics": metrics_by_type,
            "days": days,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "timestamp": datetime.utcnow().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching metrics for {coin_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/top-movers", response_model=CryptoAssetListResponse)
async def get_top_movers(
    timeframe: str = Query("24h", description="Timeframe for price change (1h, 24h, 7d)"),
    limit: int = Query(10, ge=1, le=100, description="Number of results to return"),
    direction: str = Query("gainers", description="Direction of price change (gainers, losers)"),
    coingecko_service: CoinGeckoService = Depends(get_coingecko_service)
):
    """
    Get top gainers or losers by price change percentage
    """
    try:
        # Map timeframe to CoinGecko price_change_percentage parameter
        timeframe_map = {
            "1h": "1h",
            "24h": "24h",
            "7d": "7d"
        }
        
        price_change = timeframe_map.get(timeframe, "24h")
        
        # Get market data with price change percentage
        markets_data = await coingecko_service.get_coins_markets(
            vs_currency="usd",
            per_page=250,  # Get more data to filter from
            page=1,
            price_change_percentage=price_change
        )
        
        if markets_data is None or len(markets_data) == 0:
            raise HTTPException(status_code=503, detail="Unable to fetch market data")
        
        # Filter out assets with None price change
        price_change_key = f"price_change_percentage_{price_change}_in_currency"
        filtered_data = [coin for coin in markets_data if coin.get(price_change_key) is not None]
        
        # Sort by price change percentage
        if direction == "gainers":
            sorted_data = sorted(filtered_data, key=lambda x: x.get(price_change_key, 0), reverse=True)
        else:
            sorted_data = sorted(filtered_data, key=lambda x: x.get(price_change_key, 0))
        
        # Limit results
        top_movers = sorted_data[:limit]
        
        return {
            "data": top_movers,
            "page": 1,
            "per_page": limit,
            "total": len(top_movers),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error fetching top movers: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/trending", response_model=CryptoAssetListResponse)
async def get_trending(
    limit: int = Query(10, ge=1, le=100, description="Number of results to return"),
    coingecko_service: CoinGeckoService = Depends(get_coingecko_service)
):
    """
    Get trending cryptocurrencies (using top market cap as a proxy)
    """
    try:
        # Get top market cap coins
        markets_data = await coingecko_service.get_coins_markets(
            vs_currency="usd",
            order="market_cap_desc",
            per_page=limit,
            page=1
        )
        
        if markets_data is None:
            raise HTTPException(status_code=503, detail="Unable to fetch trending data")
        
        return {
            "data": markets_data,
            "page": 1,
            "per_page": limit,
            "total": len(markets_data),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error fetching trending cryptocurrencies: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/sectors", response_model=List[str])
async def get_sectors(
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of all cryptocurrency sectors
    """
    try:
        # Return all sector enum values
        return [sector.value for sector in Sector]
    except Exception as e:
        logger.error(f"Error fetching sectors: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/sector/{sector}", response_model=CryptoAssetListResponse)
async def get_sector_assets(
    sector: str = Path(..., description="Sector name"),
    per_page: int = Query(100, ge=1, le=250, description="Number of results per page"),
    page: int = Query(1, ge=1, description="Page number"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get cryptocurrencies filtered by sector
    """
    try:
        # Validate sector
        try:
            sector_enum = Sector(sector.upper())
        except ValueError:
            raise HTTPException(status_code=404, detail=f"Sector '{sector}' not found")
        
        # Query assets by sector
        stmt = (
            Asset.select()
            .where(Asset.sector == sector_enum)
            .order_by(Asset.market_cap.desc())
            .offset((page - 1) * per_page)
            .limit(per_page)
        )
        
        result = await db.execute(stmt)
        assets = result.scalars().all()
        
        # Count total
        count_stmt = (
            Asset.select()
            .where(Asset.sector == sector_enum)
            .count()
        )
        
        count_result = await db.execute(count_stmt)
        total = count_result.scalar_one()
        
        # Format response
        assets_data = [
            {
                "id": asset.id,
                "symbol": asset.ticker,
                "name": asset.name,
                "sector": asset.sector.value,
                "risk_tier": asset.risk_tier.value,
                "market_cap": asset.market_cap,
                "price_usd": asset.price_usd,
                "price_change_24h": asset.price_change_24h,
                "volume_24h": asset.volume_24h,
                "logo_url": asset.logo_url
            }
            for asset in assets
        ]
        
        return {
            "data": assets_data,
            "page": page,
            "per_page": per_page,
            "total": total,
            "timestamp": datetime.utcnow().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching assets for sector {sector}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
