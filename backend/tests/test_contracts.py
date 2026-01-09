"""
OpenAPI contract validation tests.

Tests that API endpoints match the OpenAPI specification:
- Request/response schemas match specification
- Status codes match specification
- Required fields are present
- Field types are correct

Verifies that backend implementation aligns with API contracts.
"""

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.task import Task
from app.models.user import User


def test_auth_register_contract(test_client: TestClient):
    """Test POST /api/auth/register matches OpenAPI spec (T072)."""
    response = test_client.post(
        "/api/auth/register",
        json={
            "email": "contract-test@example.com",
            "password": "testpass123",
        },
    )

    assert response.status_code == 201

    # Verify response schema
    data = response.json()
    required_fields = ["id", "email", "created_at"]
    for field in required_fields:
        assert field in data, f"Missing required field: {field}"

    # Verify no sensitive fields
    assert "password" not in data
    assert "password_hash" not in data

    # Verify field types
    assert isinstance(data["id"], str)
    assert isinstance(data["email"], str)
    assert isinstance(data["created_at"], str)


def test_auth_login_contract(test_client: TestClient, test_user: User):
    """Test POST /api/auth/login matches OpenAPI spec (T072)."""
    response = test_client.post(
        "/api/auth/login",
        json={
            "email": test_user.email,
            "password": "testpass123",
        },
    )

    assert response.status_code == 200

    # Verify response schema
    data = response.json()
    required_fields = ["access_token", "token_type", "user"]
    for field in required_fields:
        assert field in data, f"Missing required field: {field}"

    assert data["token_type"] == "bearer"

    # Verify user object
    user_required_fields = ["id", "email", "created_at"]
    for field in user_required_fields:
        assert field in data["user"], f"Missing user field: {field}"


def test_auth_me_contract(test_client: TestClient, auth_headers: dict):
    """Test GET /api/auth/me matches OpenAPI spec (T072)."""
    response = test_client.get("/api/auth/me", headers=auth_headers)

    assert response.status_code == 200

    # Verify response schema
    data = response.json()
    required_fields = ["id", "email", "created_at"]
    for field in required_fields:
        assert field in data, f"Missing required field: {field}"

    # Verify no sensitive fields
    assert "password_hash" not in data


def test_auth_error_responses(test_client: TestClient, test_user: User):
    """Test authentication error responses match OpenAPI spec (T072)."""
    # Test 401 Unauthorized
    response = test_client.post(
        "/api/auth/login",
        json={
            "email": test_user.email,
            "password": "wrongpassword",
        },
    )
    assert response.status_code == 401
    assert "detail" in response.json()

    # Test 409 Conflict
    response = test_client.post(
        "/api/auth/register",
        json={
            "email": test_user.email,
            "password": "testpass123",
        },
    )
    assert response.status_code == 409
    assert "detail" in response.json()

    # Test 422 Validation Error
    response = test_client.post(
        "/api/auth/register",
        json={
            "email": "invalid-email",
            "password": "test",
        },
    )
    assert response.status_code == 422


def test_task_create_contract(test_client: TestClient, auth_headers: dict):
    """Test POST /api/tasks matches OpenAPI spec (T073)."""
    response = test_client.post(
        "/api/tasks",
        json={
            "title": "Contract Test Task",
            "description": "Testing contract",
            "completed": False,
        },
        headers=auth_headers,
    )

    assert response.status_code == 201

    # Verify response schema
    data = response.json()
    required_fields = ["id", "title", "description", "completed", "user_id", "created_at", "updated_at"]
    for field in required_fields:
        assert field in data, f"Missing required field: {field}"

    # Verify field types
    assert isinstance(data["id"], str)
    assert isinstance(data["title"], str)
    assert isinstance(data["completed"], bool)
    assert isinstance(data["user_id"], str)


def test_task_list_contract(test_client: TestClient, auth_headers: dict):
    """Test GET /api/tasks matches OpenAPI spec (T073)."""
    response = test_client.get("/api/tasks", headers=auth_headers)

    assert response.status_code == 200

    # Verify response schema
    data = response.json()
    required_fields = ["tasks", "total", "limit", "offset"]
    for field in required_fields:
        assert field in data, f"Missing required field: {field}"

    # Verify field types
    assert isinstance(data["tasks"], list)
    assert isinstance(data["total"], int)
    assert isinstance(data["limit"], int)
    assert isinstance(data["offset"], int)


def test_task_get_contract(test_client: TestClient, test_db: Session, auth_headers: dict, test_user: User):
    """Test GET /api/tasks/{id} matches OpenAPI spec (T073)."""
    task = Task(title="Contract Task", user_id=test_user.id)
    test_db.add(task)
    test_db.commit()
    test_db.refresh(task)

    response = test_client.get(f"/api/tasks/{task.id}", headers=auth_headers)

    assert response.status_code == 200

    # Verify response schema
    data = response.json()
    required_fields = ["id", "title", "description", "completed", "user_id", "created_at", "updated_at"]
    for field in required_fields:
        assert field in data, f"Missing required field: {field}"


def test_task_update_contract(test_client: TestClient, test_db: Session, auth_headers: dict, test_user: User):
    """Test PUT /api/tasks/{id} matches OpenAPI spec (T073)."""
    task = Task(title="Original", user_id=test_user.id)
    test_db.add(task)
    test_db.commit()
    test_db.refresh(task)

    response = test_client.put(
        f"/api/tasks/{task.id}",
        json={"title": "Updated"},
        headers=auth_headers,
    )

    assert response.status_code == 200

    # Verify response schema
    data = response.json()
    required_fields = ["id", "title", "completed", "user_id", "created_at", "updated_at"]
    for field in required_fields:
        assert field in data, f"Missing required field: {field}"


def test_task_delete_contract(test_client: TestClient, test_db: Session, auth_headers: dict, test_user: User):
    """Test DELETE /api/tasks/{id} matches OpenAPI spec (T073)."""
    task = Task(title="To Delete", user_id=test_user.id)
    test_db.add(task)
    test_db.commit()
    test_db.refresh(task)

    response = test_client.delete(f"/api/tasks/{task.id}", headers=auth_headers)

    # Should return 204 No Content
    assert response.status_code == 204
    assert response.text == ""


def test_task_error_responses(test_client: TestClient, test_db: Session, test_user: User, second_user: User):
    """Test task error responses match OpenAPI spec (T073)."""
    task = Task(title="User 2 Task", user_id=second_user.id)
    test_db.add(task)
    test_db.commit()
    test_db.refresh(task)

    # Test 403 Forbidden (accessing another user's task)
    from app.auth import create_access_token

    token = create_access_token(test_user.id)
    response = test_client.get(
        f"/api/tasks/{task.id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403
    assert "detail" in response.json()

    # Test 404 Not Found
    response = test_client.get(
        "/api/tasks/00000000-0000-0000-0000-000000000000",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 404
    assert "detail" in response.json()

    # Test 422 Validation Error
    response = test_client.post(
        "/api/tasks",
        json={"title": ""},  # Empty title (min_length=1)
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 422
