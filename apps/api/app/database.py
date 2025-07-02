from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session
from contextlib import contextmanager
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment variables or use default
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

# Create a scoped session factory
SessionLocal = scoped_session(
    sessionmaker(autocommit=False, autoflush=False, bind=engine)
)

# Base class for models
Base = declarative_base()

def init_db():
    """Initialize the database by creating all tables"""
    from .models import *  # Import all models to register them with SQLAlchemy
    Base.metadata.create_all(bind=engine)

@contextmanager
def get_db():
    """Provide a database session for dependency injection"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_db_session():
    """Get a database session (for use with FastAPI dependencies)"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Import models after Base is defined to avoid circular imports
from .models import *  # noqa: F401, E402
