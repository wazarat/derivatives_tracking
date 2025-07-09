import logging
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import os
import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime

from .database import engine, get_db
from .routers import crypto, watchlist
from .etl.pipeline import ETLPipeline

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="CanHav API",
    description="API for CanHav cryptocurrency platform",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(crypto.router)
app.include_router(watchlist.router)

# ETL pipeline instance
etl_pipeline = None

@app.on_event("startup")
async def startup_event():
    """
    Initialize database and start ETL pipeline on startup
    """
    global etl_pipeline
    
    logger.info("Starting up API")
    
    # Initialize ETL pipeline
    etl_pipeline = ETLPipeline()
    await etl_pipeline.setup()
    
    # Run initial data fetch
    try:
        logger.info("Running initial data fetch")
        await etl_pipeline.run_full_pipeline()
    except Exception as e:
        logger.error(f"Error during initial data fetch: {e}")
    
    # Set up scheduler for periodic data refresh
    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        refresh_data,
        "interval",
        minutes=5,
        id="refresh_data",
        replace_existing=True,
    )
    scheduler.start()
    
    logger.info("API startup complete")

@app.on_event("shutdown")
async def shutdown_event():
    """
    Clean up resources on shutdown
    """
    logger.info("Shutting down API")

async def refresh_data():
    """
    Refresh cryptocurrency data
    """
    global etl_pipeline
    
    try:
        logger.info("Refreshing cryptocurrency data")
        await etl_pipeline.run_full_pipeline()
        logger.info("Data refresh complete")
    except Exception as e:
        logger.error(f"Error refreshing data: {e}")

@app.get("/")
async def root():
    """
    Root endpoint
    """
    return {
        "message": "Welcome to CanHav API",
        "docs": "/docs",
        "redoc": "/redoc",
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint for monitoring.
    Returns basic health information about the API.
    """
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development")
    }
