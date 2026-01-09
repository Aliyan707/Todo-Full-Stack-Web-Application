"""
Authentication endpoint integration tests.

Tests all 4 authentication endpoints:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

Verifies JWT token generation, validation, error handling, and security constraints.
"""

from datetime import datetime, timedelta

from fastapi.testclient import TestClient
from jose import jwt
from sqlmodel import Session, select

from app.auth import ALGORITHM, SECRET_KEY, hash_password
from app.models.user import User


def test_user_registration(test_client: TestClient, test_db: Session):
    """
    Test user registration (T057).

    Verifies that POST /api/auth/register creates a user
    with hashed password and returns UserResponse.
    """
    response = test_client.post(
        "/api/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "securepass123",
        },
    )

    assert response.status_code == 201, f"Expected 201, got {response.status_code}"

    data = response.json()

    assert "id" in data, "Response should include user ID"
    assert data["email"] == "newuser@example.com", "Email should match request"
    assert "created_at" in data, "Response should include created_at"
    assert "password_hash" not in data, "Response should NOT include password_hash"

    # Verify user exists in database with hashed password
    statement = select(User).where(User.email == "newuser@example.com")
    user = test_db.exec(statement).first()

    assert user is not None, "User should exist in database"
    assert user.password_hash != "securepass123", "Password should be hashed"
    assert user.password_hash.startswith("$2b$"), "Should use bcrypt hash"


def test_duplicate_email_registration(test_client: TestClient, test_user: User):
    """
    Test duplicate email registration (T058).

    Verifies that attempting to register with an existing email
    returns 409 Conflict error.
    """
    response = test_client.post(
        "/api/auth/register",
        json={
            "email": test_user.email,  # Existing email
            "password": "anotherpass123",
        },
    )

    assert response.status_code == 409, f"Expected 409, got {response.status_code}"

    data = response.json()
    assert "detail" in data, "Error response should include detail"
    assert "already registered" in data["detail"].lower(), "Error should mention email already registered"


def test_login_with_valid_credentials(test_client: TestClient, test_user: User):
    """
    Test login with valid credentials (T059).

    Verifies that POST /api/auth/login returns JWT token in AuthResponse format.
    """
    response = test_client.post(
        "/api/auth/login",
        json={
            "email": test_user.email,
            "password": "testpass123",  # Password set in test_user fixture
        },
    )

    assert response.status_code == 200, f"Expected 200, got {response.status_code}"

    data = response.json()

    assert "access_token" in data, "Response should include access_token"
    assert "token_type" in data, "Response should include token_type"
    assert "user" in data, "Response should include user object"
    assert data["token_type"] == "bearer", "Token type should be 'bearer'"

    # Verify user object
    assert data["user"]["id"] == str(test_user.id), "User ID should match"
    assert data["user"]["email"] == test_user.email, "User email should match"
    assert "password_hash" not in data["user"], "User object should NOT include password_hash"

    # Verify JWT token structure
    token = data["access_token"]
    decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    assert "sub" in decoded, "JWT should have 'sub' claim (user ID)"
    assert decoded["sub"] == str(test_user.id), "JWT 'sub' should match user ID"
    assert "exp" in decoded, "JWT should have 'exp' claim (expiration)"
    assert "iat" in decoded, "JWT should have 'iat' claim (issued at)"


def test_login_with_invalid_credentials(test_client: TestClient, test_user: User):
    """
    Test login with invalid credentials (T060).

    Verifies that login with wrong password returns 401 Unauthorized.
    """
    # Test wrong password
    response = test_client.post(
        "/api/auth/login",
        json={
            "email": test_user.email,
            "password": "wrongpassword",
        },
    )

    assert response.status_code == 401, f"Expected 401, got {response.status_code}"

    data = response.json()
    assert "detail" in data, "Error response should include detail"
    assert "invalid" in data["detail"].lower(), "Error should mention invalid credentials"

    # Test non-existent email
    response = test_client.post(
        "/api/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "anypassword",
        },
    )

    assert response.status_code == 401, f"Expected 401, got {response.status_code}"


def test_get_me_with_valid_token(test_client: TestClient, test_user: User, auth_headers: dict):
    """
    Test GET /api/auth/me with valid token (T061).

    Verifies that authenticated request returns UserResponse.
    """
    response = test_client.get("/api/auth/me", headers=auth_headers)

    assert response.status_code == 200, f"Expected 200, got {response.status_code}"

    data = response.json()

    assert data["id"] == str(test_user.id), "User ID should match"
    assert data["email"] == test_user.email, "User email should match"
    assert "created_at" in data, "Response should include created_at"
    assert "password_hash" not in data, "Response should NOT include password_hash"


def test_get_me_with_expired_token(test_client: TestClient, test_user: User):
    """
    Test GET /api/auth/me with expired token (T062).

    Verifies that expired JWT token returns 401 with "Token expired" message.
    """
    # Create an expired token (expiration 1 hour ago)
    expired_time = datetime.utcnow() - timedelta(hours=1)
    token_data = {
        "sub": str(test_user.id),
        "exp": expired_time,
        "iat": datetime.utcnow() - timedelta(hours=2),
    }
    expired_token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

    response = test_client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {expired_token}"},
    )

    assert response.status_code == 401, f"Expected 401, got {response.status_code}"

    data = response.json()
    assert "detail" in data, "Error response should include detail"
    assert "expired" in data["detail"].lower(), "Error should mention token expired"


def test_get_me_with_invalid_token(test_client: TestClient):
    """
    Test GET /api/auth/me with invalid token (T063).

    Verifies that invalid JWT token returns 401 with "Invalid token" message.
    """
    # Test with completely invalid token
    response = test_client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer invalid.token.here"},
    )

    assert response.status_code == 401, f"Expected 401, got {response.status_code}"

    data = response.json()
    assert "detail" in data, "Error response should include detail"

    # Test with token signed with wrong secret
    token_data = {
        "sub": "some-user-id",
        "exp": datetime.utcnow() + timedelta(hours=1),
        "iat": datetime.utcnow(),
    }
    wrong_secret_token = jwt.encode(token_data, "wrong-secret-key", algorithm=ALGORITHM)

    response = test_client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {wrong_secret_token}"},
    )

    assert response.status_code == 401, f"Expected 401, got {response.status_code}"

    data = response.json()
    assert "signature" in data["detail"].lower(), "Error should mention invalid signature"


def test_get_me_without_token(test_client: TestClient):
    """
    Test GET /api/auth/me without Authorization header.

    Verifies that missing token returns 401 or 403.
    """
    response = test_client.get("/api/auth/me")

    assert response.status_code in [401, 403], f"Expected 401 or 403, got {response.status_code}"


def test_logout_endpoint(test_client: TestClient, auth_headers: dict):
    """
    Test POST /api/auth/logout endpoint.

    Verifies that logout returns success message (stateless logout).
    """
    response = test_client.post("/api/auth/logout", headers=auth_headers)

    assert response.status_code == 200, f"Expected 200, got {response.status_code}"

    data = response.json()
    assert "message" in data, "Response should include message"


def test_registration_validation_errors(test_client: TestClient):
    """
    Test registration input validation (422 errors).

    Verifies that invalid input returns validation errors.
    """
    # Test password too short
    response = test_client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "password": "short",  # Less than 8 characters
        },
    )

    assert response.status_code == 422, f"Expected 422, got {response.status_code}"

    # Test invalid email format
    response = test_client.post(
        "/api/auth/register",
        json={
            "email": "not-an-email",
            "password": "securepass123",
        },
    )

    assert response.status_code == 422, f"Expected 422, got {response.status_code}"

    # Test missing fields
    response = test_client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            # Missing password field
        },
    )

    assert response.status_code == 422, f"Expected 422, got {response.status_code}"
