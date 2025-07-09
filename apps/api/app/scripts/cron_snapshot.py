#!/usr/bin/env python3
"""
Cron script to flush data from Supabase to Postgres every 5 minutes.
This ensures data is regularly backed up and synchronized between databases.

Usage:
    python cron_snapshot.py

Environment variables:
    SUPABASE_URL: Supabase project URL
    SUPABASE_KEY: Supabase service role key (needs full access)
    DATABASE_URL: PostgreSQL connection string for local database
"""

import os
import sys
import logging
import asyncio
import time
from datetime import datetime
import json
from typing import Dict, List, Any, Optional

import httpx
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('cron_snapshot.log')
    ]
)
logger = logging.getLogger(__name__)

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")

# Tables to sync (in order of dependency)
TABLES_TO_SYNC = [
    "assets",
    "markets",
    "metrics",
    "sectors",
    "watchlists",
    "portfolios",
    "users",
    "history"
]

class SupabaseToPostgresSync:
    """Class to handle syncing data from Supabase to local Postgres"""
    
    def __init__(self):
        """Initialize the sync client"""
        if not SUPABASE_URL or not SUPABASE_KEY or not DATABASE_URL:
            raise ValueError("Missing required environment variables: SUPABASE_URL, SUPABASE_KEY, DATABASE_URL")
        
        # Initialize Supabase client
        self.supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Initialize PostgreSQL engine
        self.pg_engine = create_engine(DATABASE_URL)
        
        # Initialize async PostgreSQL engine
        self.async_pg_engine = create_async_engine(DATABASE_URL)
        self.async_session = sessionmaker(
            self.async_pg_engine, 
            class_=AsyncSession, 
            expire_on_commit=False
        )
    
    async def fetch_table_data(self, table_name: str) -> List[Dict[str, Any]]:
        """Fetch all data from a Supabase table"""
        try:
            response = self.supabase.table(table_name).select("*").execute()
            if hasattr(response, 'data'):
                return response.data
            return []
        except Exception as e:
            logger.error(f"Error fetching data from Supabase table {table_name}: {str(e)}")
            return []
    
    async def truncate_and_insert(self, table_name: str, data: List[Dict[str, Any]]) -> bool:
        """Truncate local table and insert new data"""
        if not data:
            logger.warning(f"No data to sync for table {table_name}")
            return True
        
        try:
            async with self.async_session() as session:
                # Disable foreign key checks temporarily
                await session.execute(text("SET CONSTRAINTS ALL DEFERRED"))
                
                # Truncate the table
                await session.execute(text(f"TRUNCATE TABLE {table_name} CASCADE"))
                
                # Prepare bulk insert
                if data:
                    # Get column names from first row
                    columns = list(data[0].keys())
                    placeholders = ", ".join([f":{col}" for col in columns])
                    column_str = ", ".join(columns)
                    
                    # Batch inserts in chunks of 100
                    chunk_size = 100
                    for i in range(0, len(data), chunk_size):
                        chunk = data[i:i+chunk_size]
                        insert_stmt = text(f"INSERT INTO {table_name} ({column_str}) VALUES ({placeholders})")
                        await session.execute(insert_stmt, chunk)
                
                # Re-enable foreign key checks
                await session.execute(text("SET CONSTRAINTS ALL IMMEDIATE"))
                
                # Commit the transaction
                await session.commit()
                
                logger.info(f"Successfully synced {len(data)} records to table {table_name}")
                return True
                
        except Exception as e:
            logger.error(f"Error syncing data to PostgreSQL table {table_name}: {str(e)}")
            return False
    
    async def sync_table(self, table_name: str) -> bool:
        """Sync a single table from Supabase to PostgreSQL"""
        logger.info(f"Syncing table {table_name}...")
        
        # Fetch data from Supabase
        data = await self.fetch_table_data(table_name)
        
        # Insert into PostgreSQL
        success = await self.truncate_and_insert(table_name, data)
        
        return success
    
    async def sync_all_tables(self) -> Dict[str, bool]:
        """Sync all tables from Supabase to PostgreSQL"""
        results = {}
        
        for table_name in TABLES_TO_SYNC:
            success = await self.sync_table(table_name)
            results[table_name] = success
        
        return results
    
    async def run(self) -> None:
        """Run the sync process"""
        start_time = time.time()
        logger.info(f"Starting Supabase to PostgreSQL sync at {datetime.now().isoformat()}")
        
        try:
            results = await self.sync_all_tables()
            
            # Log results
            success_count = sum(1 for success in results.values() if success)
            logger.info(f"Sync completed. {success_count}/{len(results)} tables synced successfully.")
            
            for table, success in results.items():
                status = "SUCCESS" if success else "FAILED"
                logger.info(f"{table}: {status}")
            
        except Exception as e:
            logger.error(f"Error during sync process: {str(e)}")
        
        elapsed_time = time.time() - start_time
        logger.info(f"Sync process completed in {elapsed_time:.2f} seconds")

async def main():
    """Main function to run the sync process"""
    try:
        syncer = SupabaseToPostgresSync()
        await syncer.run()
    except Exception as e:
        logger.error(f"Unhandled exception: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
