from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
import logging
import os
import ssl
from dotenv import load_dotenv

# Configure logging
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Get database connection string from environment variables
# Priority: SUPABASE_DATABASE_URL > DATABASE_URL > SQLite
SUPABASE_DATABASE_URL = os.getenv("SUPABASE_DATABASE_URL")
DATABASE_URL = os.getenv("DATABASE_URL")
SQLITE_URL = "sqlite+aiosqlite:///./sql_app.db"

# SSL context for Supabase Postgres
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

# Choose the appropriate database connection
if SUPABASE_DATABASE_URL:
    # Use Supabase Postgres
    logger.info("Using Supabase Postgres database")
    # Convert connection string to asyncpg format if needed
    if SUPABASE_DATABASE_URL.startswith("postgres://"):
        SUPABASE_DATABASE_URL = SUPABASE_DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
    elif not "asyncpg" in SUPABASE_DATABASE_URL:
        # Ensure we're using asyncpg driver
        if SUPABASE_DATABASE_URL.startswith("postgresql://"):
            SUPABASE_DATABASE_URL = SUPABASE_DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    logger.info(f"Using connection string format: {SUPABASE_DATABASE_URL.split('@')[0].split('://')[0]}")
    
    # Create engine with Supabase Postgres
    engine = create_async_engine(
        SUPABASE_DATABASE_URL,
        pool_pre_ping=True,
        echo=False,
        connect_args={"ssl": ssl_context}
    )
elif DATABASE_URL:
    # Use standard Postgres
    logger.info("Using standard Postgres database")
    # Convert connection string to asyncpg format if needed
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
    elif not "asyncpg" in DATABASE_URL:
        # Ensure we're using asyncpg driver
        if DATABASE_URL.startswith("postgresql://"):
            DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    logger.info(f"Using connection string format: {DATABASE_URL.split('@')[0].split('://')[0]}")
    
    # Create engine with standard Postgres
    engine = create_async_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        echo=False
    )
else:
    # Fallback to SQLite
    logger.info(f"No database connection string found, using SQLite: {SQLITE_URL}")
    # Create engine with SQLite
    engine = create_async_engine(
        SQLITE_URL,
        pool_pre_ping=True,
        echo=False,
        connect_args={"check_same_thread": False}
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
        logger.error(f"Error creating database tables: {e}")
        raise

# Dependency for FastAPI to get async DB session
async def get_async_db():
    """Dependency that provides an async database session"""
    async_session = AsyncSessionLocal()
    try:
        yield async_session
    finally:
        await async_session.close()

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
