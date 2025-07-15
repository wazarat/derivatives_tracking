from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from typing import Optional
import os
from datetime import datetime, timedelta
import logging
import sys
import os.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Application lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up...")
    
    # Initialize resources (DB connections, etc.)
    try:
        # Initialize database connection
        from app.database import AsyncSessionLocal, init_db
        
        # Initialize the database
        await init_db()
        logger.info("Database initialized")
        
        # Test database connection
        async with AsyncSessionLocal() as db:
            from sqlalchemy import text
            await db.execute(text("SELECT 1"))  # Test connection
            logger.info("Database connection successful")
        
        # Start ETL scheduler
        from app.etl.scheduler import get_scheduler
        scheduler = get_scheduler()
        scheduler.start()
        logger.info("ETL scheduler started")
        
        # Run initial data load if needed (check if database is empty)
        async with AsyncSessionLocal() as db:
            from sqlalchemy.future import select
            from app.models import Asset
            result = await db.execute(select(Asset).limit(1))
            if result.first() is None:
                logger.info("Database is empty, running initial data load")
                from app.etl.pipeline import ETLPipeline
                import asyncio
                # Run in a separate task to avoid blocking startup
                asyncio.create_task(ETLPipeline().run_full_pipeline())
    except Exception as e:
        logger.error(f"Startup failed: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")
    # Stop ETL scheduler
    try:
        from app.etl.scheduler import get_scheduler
        scheduler = get_scheduler()
        scheduler.stop()
        logger.info("ETL scheduler stopped")
    except Exception as e:
        logger.error(f"Error stopping ETL scheduler: {e}")

# Create FastAPI app
app = FastAPI(
    title="CanHav API",
    description="API for CanHav - Crypto Investment Platform",
    version="0.1.0",
    lifespan=lifespan
)

# CORS middleware
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "0.1.0"
    }

# Import and include routers
from app.routers import assets, crypto, derivatives
# TODO: Implement these routers
# from app.routers import portfolios, auth

app.include_router(assets.router, prefix="/api/v1/assets", tags=["assets"])
app.include_router(crypto.router, prefix="/api/v1/crypto", tags=["crypto"])
app.include_router(derivatives.router, prefix="/api/v1/derivatives", tags=["derivatives"])
# TODO: Uncomment when implemented
# app.include_router(portfolios.router, prefix="/api/v1/portfolios", tags=["portfolios"])
# app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])

# Admin endpoints for ETL
@app.post("/api/v1/admin/etl/run", tags=["admin"])
async def run_etl_pipeline():
    """Manually trigger the ETL pipeline"""
    from app.etl.scheduler import get_scheduler
    scheduler = get_scheduler()
    await scheduler.run_now()
    return {"status": "success", "message": "ETL pipeline triggered"}

@app.post("/api/v1/admin/etl/risk-scores", tags=["admin"])
async def update_risk_scores():
    """Manually trigger risk score updates"""
    from app.etl.scheduler import get_scheduler
    scheduler = get_scheduler()
    await scheduler.update_risk_scores_now()
    return {"status": "success", "message": "Risk score updates triggered"}

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "CanHav API",
        "version": "0.1.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )

# For development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
