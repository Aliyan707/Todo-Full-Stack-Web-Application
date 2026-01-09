"""
Integration tests for Todo App backend.

Test Coverage:
- Database connection and models (test_database.py, test_models.py)
- Authentication endpoints (test_auth.py)
- Task CRUD endpoints (test_tasks.py)
- OpenAPI contract validation (test_contracts.py)

All tests use a real database connection (via DATABASE_URL environment variable).
Tests are isolated - each test function gets a fresh database session.
"""
