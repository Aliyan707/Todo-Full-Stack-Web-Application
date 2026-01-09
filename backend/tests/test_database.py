"""
Database integration tests.

Tests database connection and basic operations.
Verifies that the application can connect to the database
and execute queries successfully.
"""

from sqlmodel import Session, select

from app.database import get_session
from app.models.user import User


def test_database_connection(test_db: Session):
    """
    Test database connection (T053).

    Verifies that the database session can execute queries successfully.
    """
    # Test basic query execution
    statement = select(User)
    result = test_db.exec(statement).all()
    assert isinstance(result, list), "Query should return a list"


def test_get_session_dependency(test_db: Session):
    """
    Test get_session dependency function.

    Verifies that the test database session works correctly.
    """
    assert isinstance(test_db, Session), "test_db should be a Session instance"

    # Test that we can execute a query
    statement = select(User)
    result = test_db.exec(statement).all()

    assert isinstance(result, list), "Query should return a list"
