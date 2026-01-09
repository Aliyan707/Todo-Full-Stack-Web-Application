"""
Database connection and session management for Neon PostgreSQL.

This module handles:
- Database engine creation with connection pooling
- Session management via FastAPI dependency injection
- Database initialization (table creation)
"""

import os
from typing import Generator

from sqlmodel import Session, SQLModel, create_engine
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError(
        "DATABASE_URL environment variable is not set. "
        "Please set it in your .env file or environment."
    )

# Create engine with connection pooling for Neon Serverless PostgreSQL
# Configuration optimized for serverless environment
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Set to True for SQL query logging during development
    pool_size=5,  # Number of persistent connections to maintain
    max_overflow=10,  # Additional connections when pool is exhausted
    pool_pre_ping=True,  # Verify connections before using (important for serverless)
    pool_recycle=3600,  # Recycle connections after 1 hour
    connect_args={
        "options": "-c timezone=utc"  # Ensure UTC timezone for all connections
    }
)


def init_db() -> None:
    """
    Initialize the database by creating all tables.

    This function creates all tables defined in SQLModel models.
    It's idempotent - safe to call multiple times.

    Called during application startup.
    """
    try:
        SQLModel.metadata.create_all(engine)
        print("[DB] Database tables created/verified successfully")
    except Exception as e:
        # Tables may already exist, which is fine
        print(f"[DB] Database initialization: {str(e)[:100]}")


def get_session() -> Generator[Session, None, None]:
    """
    FastAPI dependency for database session management.

    Yields a database session that is automatically closed after use.
    Use this as a dependency in FastAPI route handlers.

    Example:
        @app.get("/items")
        def get_items(session: Session = Depends(get_session)):
            items = session.exec(select(Item)).all()
            return items

    Yields:
        Session: SQLModel database session
    """
    with Session(engine) as session:
        yield session


def test_connection() -> dict:
    """
    Test database connection.

    Returns:
        dict: Connection status with details
    """
    try:
        with Session(engine) as session:
            # Simple query to test connection
            session.exec("SELECT 1")
        return {"status": "connected", "database": "Neon PostgreSQL"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
