from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from contextlib import asynccontextmanager
import os
import ssl
import logging
from dotenv import load_dotenv

# Configure logging
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Get database URLs from environment variables
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/dbname")
SUPABASE_DATABASE_URL = os.getenv("SUPABASE_DATABASE_URL")

logger.info(f"Primary DATABASE_URL: {DATABASE_URL}")
if SUPABASE_DATABASE_URL:
    logger.info(f"Fallback SUPABASE_DATABASE_URL available")

# Function to create engine with appropriate connect_args
def create_db_engine(db_url):
    connect_args = {}
    if db_url.startswith("sqlite"):
        connect_args["check_same_thread"] = False
    elif "postgresql" in db_url or "postgres" in db_url:
        # For PostgreSQL connections
        if "supabase" in db_url:
            # For Supabase PostgreSQL, use SSL
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            connect_args["ssl"] = ssl_context
            # Increase connection timeout for Supabase
            connect_args["command_timeout"] = 30
            connect_args["timeout"] = 30
            logger.info(f"Connecting to Supabase PostgreSQL with SSL and increased timeout")
        else:
            # For local PostgreSQL, no SSL needed
            logger.info(f"Connecting to local PostgreSQL")
    
    try:
        return create_async_engine(
            db_url,
            pool_pre_ping=True,
            echo=False,
            connect_args=connect_args,
            # Add connection pool settings
            pool_size=5,
            max_overflow=10,
            pool_timeout=30,
            pool_recycle=1800,  # Recycle connections after 30 minutes
        )
    except Exception as e:
        logger.error(f"Failed to create engine for {db_url}: {e}")
        return None

# Try to create engine with primary database URL
engine = create_db_engine(DATABASE_URL)

# If primary engine creation failed and we have a fallback URL, try that
if engine is None and SUPABASE_DATABASE_URL:
    logger.warning(f"Failed to connect to primary database, trying fallback")
    engine = create_db_engine(SUPABASE_DATABASE_URL)

# If both failed, fall back to SQLite
if engine is None:
    logger.warning(f"All database connections failed, falling back to SQLite")
    sqlite_url = "sqlite+aiosqlite:///./sql_app.db"
    connect_args = {"check_same_thread": False}
    engine = create_async_engine(
        sqlite_url,
        pool_pre_ping=True,
        echo=False,
        connect_args=connect_args
    )

# Create an async session factory
AsyncSessionLocal = sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# For backward compatibility
SessionLocal = AsyncSessionLocal

# Base class for models
Base = declarative_base()

# Import models after Base is defined to avoid circular imports
from .models import *  # noqa: F401, E402

async def init_db():
    """Initialize the database by creating all tables"""
    try:
        # Models are already imported at module level
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise

async def get_db():
    """Provide a database session for dependency injection"""
    session = AsyncSessionLocal()
    try:
        yield session
    finally:
        await session.close()

async def get_db_session():
    """Get a database session (for use with FastAPI dependencies)"""
    session = AsyncSessionLocal()
    try:
        yield session
    finally:
        await session.close()
