from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import List

from app.database import get_async_db
from app.schemas.derivatives import DerivativesRow

router = APIRouter()

@router.get("/{sector}", response_model=List[DerivativesRow])
async def get_derivatives(sector: str, db: AsyncSession = Depends(get_async_db)):
    """
    Get derivatives data for a specific sector.
    
    - **sector**: Either 'cex-futures' or 'cex-perps'
    """
    # Map route parameters to contract types in the database
    allowed = {"cex-futures": "futures", "cex-perps": "perpetual"}
    
    if sector not in allowed:
        raise HTTPException(status_code=404, detail="Sector not found")
    
    # Query the materialized view for the latest data
    query = text("""
        SELECT *
        FROM derivatives_latest
        WHERE contract_type = :type
        ORDER BY oi_usd DESC
        LIMIT 500
    """)
    
    try:
        result = await db.execute(query, {"type": allowed[sector]})
        rows = result.mappings().all()
        return rows
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )
