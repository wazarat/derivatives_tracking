import asyncio
import logging
from typing import List, Dict, Any, Optional
import os
from datetime import datetime

from ..workers.coingecko_worker import CoinGeckoWorker

logger = logging.getLogger(__name__)

class ETLPipeline:
    """
    ETL Pipeline to manage data fetching workers
    """
    
    def __init__(self):
        """Initialize the ETL pipeline"""
        self.workers = {}
        self.tasks = {}
        self.running = False
    
    async def start(self):
        """Start all workers in the ETL pipeline"""
        logger.info("Starting ETL pipeline")
        self.running = True
        
        # Initialize and start CoinGecko worker
        await self.start_coingecko_worker()
        
        logger.info("ETL pipeline started")
    
    async def run_full_pipeline(self):
        """Run the full ETL pipeline once"""
        logger.info("Running full ETL pipeline")
        
        # Start the pipeline if not already running
        if not self.running:
            await self.start()
            
        # Run CoinGecko worker once
        if "coingecko" in self.workers:
            worker = self.workers["coingecko"]
            try:
                # Ensure setup is called before fetch_and_update
                await worker.setup()
                await worker.fetch_and_update()
                logger.info("Full ETL pipeline completed successfully")
            except Exception as e:
                logger.error(f"Error running full ETL pipeline: {e}")
                raise
        else:
            logger.warning("CoinGecko worker not found, starting it")
            await self.start_coingecko_worker()
            if "coingecko" in self.workers:
                worker = self.workers["coingecko"]
                # Ensure setup is called before fetch_and_update
                await worker.setup()
                await worker.fetch_and_update()
                logger.info("Full ETL pipeline completed successfully")
    
    async def stop(self):
        """Stop all workers in the ETL pipeline"""
        logger.info("Stopping ETL pipeline")
        self.running = False
        
        # Stop all workers
        for worker_name, worker in self.workers.items():
            logger.info(f"Stopping worker: {worker_name}")
            worker.stop()
        
        # Cancel all tasks
        for task_name, task in self.tasks.items():
            if not task.done():
                logger.info(f"Cancelling task: {task_name}")
                task.cancel()
                
                try:
                    await task
                except asyncio.CancelledError:
                    logger.info(f"Task cancelled: {task_name}")
        
        # Clear workers and tasks
        self.workers = {}
        self.tasks = {}
        
        logger.info("ETL pipeline stopped")
    
    async def start_coingecko_worker(self):
        """Initialize and start the CoinGecko worker"""
        # Create worker
        worker = CoinGeckoWorker(
            db_url=os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/canhav"),
            supabase_url=os.getenv("SUPABASE_URL", "https://gxgmcrqcxfgmhvuborpa.supabase.co"),
            supabase_key=os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4Z21jcnFjeGZnbWh2dWJvcnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NzExMjQsImV4cCI6MjA2NzA0NzEyNH0.-LoPXC3qe3-BfzlATE3TDpvDZ0nyDX98hYkwzugzFVs"),
            fetch_interval=int(os.getenv("COINGECKO_FETCH_INTERVAL", "300")),
            assets_limit=int(os.getenv("COINGECKO_ASSETS_LIMIT", "250"))
        )
        
        # Register worker
        self.workers["coingecko"] = worker
        
        # Create and start task
        task = asyncio.create_task(worker.run())
        self.tasks["coingecko"] = task
        
        logger.info("CoinGecko worker started")
    
    def get_status(self) -> Dict[str, Any]:
        """Get the status of all workers in the pipeline"""
        status = {
            "running": self.running,
            "workers": {},
            "started_at": datetime.utcnow().isoformat()
        }
        
        # Get status of each worker
        for worker_name, worker in self.workers.items():
            worker_status = {
                "running": worker.running,
                "last_run": worker.last_run.isoformat() if worker.last_run else None,
                "fetch_interval": worker.fetch_interval,
                "assets_limit": worker.assets_limit
            }
            status["workers"][worker_name] = worker_status
        
        return status
