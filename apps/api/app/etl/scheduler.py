import logging
import asyncio
from datetime import datetime
import os
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from .pipeline import ETLPipeline

logger = logging.getLogger(__name__)

class ETLScheduler:
    """Scheduler for running ETL jobs on a regular basis."""
    
    def __init__(self):
        """Initialize the ETL scheduler."""
        self.scheduler = AsyncIOScheduler()
        self.pipeline = ETLPipeline()
        
    def start(self):
        """Start the scheduler."""
        logger.info("Starting ETL scheduler")
        
        # Schedule the full pipeline to run every day at 2 AM UTC
        # This time is chosen to minimize impact on users and to ensure
        # data is fresh for the next day
        self.scheduler.add_job(
            self._run_pipeline_wrapper,
            CronTrigger(hour=2, minute=0),
            id="full_pipeline",
            name="Full ETL Pipeline",
            replace_existing=True
        )
        
        # Schedule risk score updates to run every 6 hours
        # This ensures risk scores are updated more frequently than the full pipeline
        self.scheduler.add_job(
            self._update_risk_scores_wrapper,
            CronTrigger(hour="*/6", minute=0),
            id="risk_scores",
            name="Update Risk Scores",
            replace_existing=True
        )
        
        # Start the scheduler
        self.scheduler.start()
        logger.info("ETL scheduler started")
        
    def stop(self):
        """Stop the scheduler."""
        logger.info("Stopping ETL scheduler")
        self.scheduler.shutdown()
        logger.info("ETL scheduler stopped")
        
    async def _run_pipeline_wrapper(self):
        """Wrapper for running the full pipeline to handle exceptions."""
        try:
            logger.info("Running scheduled full ETL pipeline")
            await self.pipeline.run_full_pipeline()
        except Exception as e:
            logger.error(f"Scheduled ETL pipeline failed: {e}")
            
    async def _update_risk_scores_wrapper(self):
        """Wrapper for updating risk scores to handle exceptions."""
        try:
            logger.info("Running scheduled risk score updates")
            await self.pipeline.update_risk_scores()
        except Exception as e:
            logger.error(f"Scheduled risk score updates failed: {e}")
            
    async def run_now(self):
        """Run the full pipeline immediately."""
        logger.info("Running ETL pipeline immediately")
        await self._run_pipeline_wrapper()
        
    async def update_risk_scores_now(self):
        """Update risk scores immediately."""
        logger.info("Updating risk scores immediately")
        await self._update_risk_scores_wrapper()


# Singleton instance
_scheduler_instance = None

def get_scheduler():
    """Get the singleton scheduler instance."""
    global _scheduler_instance
    if _scheduler_instance is None:
        _scheduler_instance = ETLScheduler()
    return _scheduler_instance
