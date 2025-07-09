import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from typing import List

from ..database import get_db
from ..models import Watchlist
from ..schemas import WatchlistCreate, WatchlistUpdate, WatchlistResponse
from ..dependencies import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/watchlist",
    tags=["watchlist"],
    responses={404: {"description": "Not found"}},
)

@router.get("", response_model=List[WatchlistResponse])
async def get_watchlist(
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all watchlist items for the current user
    """
    try:
        query = select(Watchlist).where(Watchlist.user_id == user_id)
        result = await db.execute(query)
        items = result.scalars().all()
        return items
    except Exception as e:
        logger.error(f"Error getting watchlist: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve watchlist"
        )

@router.post("", response_model=WatchlistResponse, status_code=status.HTTP_201_CREATED)
async def create_watchlist_item(
    item: WatchlistCreate,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new watchlist item
    """
    try:
        # Create new watchlist item
        db_item = Watchlist(
            user_id=user_id,
            symbol=item.symbol.upper(),  # Store symbols in uppercase
            usd_value=item.usd_value
        )
        
        # Add to database
        db.add(db_item)
        await db.commit()
        await db.refresh(db_item)
        
        return db_item
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Asset {item.symbol} already exists in watchlist"
        )
    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating watchlist item: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create watchlist item"
        )

@router.put("/{symbol}", response_model=WatchlistResponse)
async def update_watchlist_item(
    symbol: str,
    item: WatchlistUpdate,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a watchlist item's USD value
    """
    try:
        # Find the item
        query = select(Watchlist).where(
            Watchlist.user_id == user_id,
            Watchlist.symbol == symbol.upper()
        )
        result = await db.execute(query)
        db_item = result.scalars().first()
        
        if not db_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Asset {symbol} not found in watchlist"
            )
        
        # Update the item
        db_item.usd_value = item.usd_value
        await db.commit()
        await db.refresh(db_item)
        
        return db_item
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating watchlist item: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update watchlist item"
        )

@router.delete("/{symbol}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_watchlist_item(
    symbol: str,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a watchlist item
    """
    try:
        # Find the item
        query = select(Watchlist).where(
            Watchlist.user_id == user_id,
            Watchlist.symbol == symbol.upper()
        )
        result = await db.execute(query)
        db_item = result.scalars().first()
        
        if not db_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Asset {symbol} not found in watchlist"
            )
        
        # Delete the item
        await db.delete(db_item)
        await db.commit()
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error deleting watchlist item: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete watchlist item"
        )
