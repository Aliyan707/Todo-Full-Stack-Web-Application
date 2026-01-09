"""
Authentication API endpoints.

Implements 4 core auth endpoints following the auth-bridge specification:
- POST /api/auth/register: User registration with bcrypt password hashing
- POST /api/auth/login: User authentication with JWT token generation
- POST /api/auth/logout: Stateless logout (client-side token deletion)
- GET /api/auth/me: Get current user profile from JWT token

All endpoints follow OpenAPI specification in specs/001-phase-ii-specs/contracts/auth-openapi.yaml
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.auth import create_access_token, get_current_user, hash_password, verify_password
from app.database import get_session
from app.models.requests import LoginRequest, RegisterRequest
from app.models.responses import AuthResponse, MessageResponse, UserResponse
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {
            "description": "User successfully registered",
            "model": UserResponse,
        },
        400: {
            "description": "Bad Request - Invalid input data",
            "content": {
                "application/json": {
                    "example": {"detail": "Password must be at least 8 characters"}
                }
            },
        },
        409: {
            "description": "Conflict - Email already registered",
            "content": {
                "application/json": {
                    "example": {"detail": "Email already registered"}
                }
            },
        },
        422: {
            "description": "Unprocessable Entity - Validation error",
            "content": {
                "application/json": {
                    "example": {
                        "detail": [
                            {
                                "loc": ["body", "email"],
                                "msg": "value is not a valid email address",
                                "type": "value_error.email",
                            }
                        ]
                    }
                }
            },
        },
    },
)
def register(
    request: RegisterRequest,
    session: Session = Depends(get_session),
) -> UserResponse:
    """
    Register a new user account.

    Creates a new user with the provided email and password.
    Password is hashed using bcrypt (cost factor 12) before storage.

    Security:
    - Email uniqueness enforced at database level
    - Password minimum length: 8 characters (validated by Pydantic)
    - Password stored as bcrypt hash (never plaintext)

    Args:
        request: RegisterRequest containing email and password
        session: Database session (injected by FastAPI)

    Returns:
        UserResponse: Created user (id, email, created_at)

    Raises:
        HTTPException(409): Email already registered
        HTTPException(422): Validation error (invalid email, short password)
    """
    # Check if email already exists
    statement = select(User).where(User.email == request.email)
    existing_user = session.exec(statement).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Hash password using bcrypt
    password_hash = hash_password(request.password)

    # Create new user
    user = User(
        email=request.email,
        password_hash=password_hash,
    )

    # Save to database
    session.add(user)
    session.commit()
    session.refresh(user)

    # Return user response (excludes password_hash)
    return UserResponse.model_validate(user)


@router.post(
    "/login",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
    responses={
        200: {
            "description": "Login successful, JWT token returned",
            "model": AuthResponse,
        },
        401: {
            "description": "Unauthorized - Invalid credentials",
            "content": {
                "application/json": {
                    "example": {"detail": "Invalid email or password"}
                }
            },
        },
        422: {
            "description": "Unprocessable Entity - Validation error",
        },
    },
)
def login(
    request: LoginRequest,
    session: Session = Depends(get_session),
) -> AuthResponse:
    """
    Authenticate user and generate JWT access token.

    Verifies email and password, then generates a JWT token valid for 24 hours.
    Frontend stores the token and includes it in Authorization: Bearer header for protected requests.

    Security:
    - Timing-safe password comparison (prevents timing attacks)
    - JWT token expires after 24 hours
    - Token signed with HS256 (HMAC-SHA256)
    - User ID stored in 'sub' claim

    Args:
        request: LoginRequest containing email and password
        session: Database session (injected by FastAPI)

    Returns:
        AuthResponse: Contains access_token, token_type ("bearer"), and user info

    Raises:
        HTTPException(401): Invalid email or password
    """
    # Find user by email
    statement = select(User).where(User.email == request.email)
    user = session.exec(statement).first()

    # Verify user exists and password is correct
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Generate JWT token
    access_token = create_access_token(user_id=user.id)

    # Return token and user info
    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post(
    "/logout",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    responses={
        200: {
            "description": "Logout successful (client should delete token)",
            "model": MessageResponse,
        },
        401: {
            "description": "Unauthorized - Invalid or missing token",
        },
    },
)
def logout(
    current_user_id: UUID = Depends(get_current_user),
) -> MessageResponse:
    """
    Logout current user (stateless).

    This endpoint is stateless - the backend doesn't track sessions or blacklist tokens.
    The frontend is responsible for deleting the JWT token from storage.

    The endpoint requires a valid JWT token to ensure only authenticated users can logout.
    This is useful for triggering client-side cleanup and for audit logging.

    Security:
    - Requires valid JWT token (enforced by get_current_user dependency)
    - Frontend MUST delete token from localStorage/sessionStorage/cookies
    - Token remains valid until expiration (24 hours from issue time)

    Args:
        current_user_id: User ID extracted from JWT (injected by FastAPI)

    Returns:
        MessageResponse: Success message instructing client to delete token

    Note:
        For token revocation/blacklisting, implement a token blacklist table
        (out of scope for Phase II MVP)
    """
    return MessageResponse(
        message="Logout successful. Please delete the token from client storage."
    )


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    responses={
        200: {
            "description": "Current user profile retrieved",
            "model": UserResponse,
        },
        401: {
            "description": "Unauthorized - Invalid, expired, or missing token",
            "content": {
                "application/json": {
                    "examples": {
                        "expired": {"value": {"detail": "Token expired"}},
                        "invalid": {"value": {"detail": "Invalid token"}},
                        "missing": {"value": {"detail": "Not authenticated"}},
                    }
                }
            },
        },
        404: {
            "description": "Not Found - User not found (token valid but user deleted)",
            "content": {
                "application/json": {
                    "example": {"detail": "User not found"}
                }
            },
        },
    },
)
def get_me(
    current_user_id: UUID = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> UserResponse:
    """
    Get current user's profile information.

    Extracts user_id from JWT token and returns user profile data.
    Used by frontend to:
    - Display user info in UI (email, etc.)
    - Verify token validity on app startup
    - Refresh user data after profile updates

    Security:
    - Requires valid JWT token (enforced by get_current_user dependency)
    - Token must not be expired (checked in get_current_user)
    - Returns user data matching token's 'sub' claim

    Args:
        current_user_id: User ID extracted from JWT (injected by FastAPI)
        session: Database session (injected by FastAPI)

    Returns:
        UserResponse: Current user's profile (id, email, created_at)

    Raises:
        HTTPException(401): Invalid or expired token
        HTTPException(404): User not found in database
    """
    # Fetch user from database
    statement = select(User).where(User.id == current_user_id)
    user = session.exec(statement).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return UserResponse.model_validate(user)
