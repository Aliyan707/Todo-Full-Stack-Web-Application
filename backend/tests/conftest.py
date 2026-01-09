"""
Pytest configuration and shared fixtures for integration tests.

This module provides fixtures used across all test modules:
- test_client: FastAPI test client with dependency overrides
- test_db: Database session with automatic rollback after each test
- test_user: Authenticated test user with JWT token
- auth_headers: Authorization headers for authenticated requests
"""

import os
from typing import Generator

# IMPORTANT: Load environment variables BEFORE importing app modules
# The auth.py module requires BETTER_AUTH_SECRET to be set at import time
from dotenv import load_dotenv

load_dotenv()  # Load .env file

# Ensure BETTER_AUTH_SECRET is set for tests
if not os.getenv("BETTER_AUTH_SECRET"):
    # Set a test secret if not found in environment
    os.environ["BETTER_AUTH_SECRET"] = "test-secret-key-minimum-32-characters-required-for-testing"

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.auth import create_access_token, hash_password
from app.database import get_session
from app.main import app
from app.models.user import User

# Use in-memory SQLite for tests (faster and isolated)
# For full Neon PostgreSQL testing, uncomment the DATABASE_URL line below
# DATABASE_URL = os.getenv("DATABASE_URL")
SQLITE_URL = "sqlite:///:memory:"

# Create test engine with StaticPool for in-memory database
test_engine = create_engine(
    SQLITE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


@pytest.fixture(name="test_db", scope="function")
def test_db_fixture() -> Generator[Session, None, None]:
    """
    Provide a database session for testing with automatic rollback.

    Creates all tables before each test and drops them after.
    This ensures test isolation - each test starts with a clean database.

    Yields:
        Session: SQLModel database session
    """
    # Create all tables
    SQLModel.metadata.create_all(test_engine)

    # Create session
    with Session(test_engine) as session:
        yield session

    # Drop all tables after test
    SQLModel.metadata.drop_all(test_engine)


@pytest.fixture(name="test_client", scope="function")
def test_client_fixture(test_db: Session) -> TestClient:
    """
    Provide a FastAPI test client with database dependency override.

    Overrides the get_session dependency to use the test database session.
    This ensures all API calls during tests use the test database.

    Args:
        test_db: Test database session (from test_db fixture)

    Returns:
        TestClient: FastAPI test client
    """

    def get_test_session():
        """Override get_session dependency to return test database session."""
        yield test_db

    # Override dependency
    app.dependency_overrides[get_session] = get_test_session

    # Create test client
    client = TestClient(app)

    yield client

    # Clean up dependency override
    app.dependency_overrides.clear()


@pytest.fixture(name="test_user", scope="function")
def test_user_fixture(test_db: Session) -> User:
    """
    Create a test user in the database.

    Creates a user with email "test@example.com" and password "testpass123".
    Useful for authentication and task ownership tests.

    Args:
        test_db: Test database session (from test_db fixture)

    Returns:
        User: Created user instance
    """
    user = User(
        email="test@example.com",
        password_hash=hash_password("testpass123"),
    )

    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)

    return user


@pytest.fixture(name="auth_headers", scope="function")
def auth_headers_fixture(test_user: User) -> dict[str, str]:
    """
    Generate Authorization headers for authenticated requests.

    Creates a JWT token for the test user and returns headers
    in the format required by FastAPI (Authorization: Bearer <token>).

    Args:
        test_user: Test user (from test_user fixture)

    Returns:
        dict: HTTP headers with Authorization: Bearer token
    """
    token = create_access_token(user_id=test_user.id)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(name="second_user", scope="function")
def second_user_fixture(test_db: Session) -> User:
    """
    Create a second test user for multi-user testing.

    Creates a user with email "user2@example.com" and password "testpass456".
    Useful for testing user isolation (e.g., user A cannot access user B's tasks).

    Args:
        test_db: Test database session (from test_db fixture)

    Returns:
        User: Created second user instance
    """
    user = User(
        email="user2@example.com",
        password_hash=hash_password("testpass456"),
    )

    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)

    return user
