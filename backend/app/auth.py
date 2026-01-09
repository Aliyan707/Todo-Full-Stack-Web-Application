"""
Authentication module for JWT token handling and password security.

This module implements the auth-bridge between Better Auth (frontend) and FastAPI (backend)
following the specifications in specs/skills/auth-bridge.md.

Key components:
- JWT token generation and verification (HS256 algorithm)
- Password hashing with bcrypt (cost factor 12)
- FastAPI dependency for extracting current user from JWT
"""

import os
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# JWT Configuration
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET")
if not SECRET_KEY:
    raise ValueError(
        "BETTER_AUTH_SECRET environment variable is not set. "
        "This MUST be set and MUST match the frontend secret."
    )

# Validate secret key length (minimum 32 characters for security)
if len(SECRET_KEY) < 32:
    raise ValueError(
        f"BETTER_AUTH_SECRET must be at least 32 characters long. "
        f"Current length: {len(SECRET_KEY)}. "
        f"Generate a secure secret with: openssl rand -base64 64"
    )

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# Password hashing configuration
# Using bcrypt with cost factor 12 (minimum recommended for 2024+)
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12,
    bcrypt__default_ident="2b"
)

# HTTP Bearer token security scheme
security = HTTPBearer()


def hash_password(password: str) -> str:
    """
    Hash a plaintext password using bcrypt.

    Args:
        password: Plaintext password to hash

    Returns:
        str: Bcrypt hashed password (safe to store in database)

    Security:
        - Uses bcrypt algorithm with cost factor 12
        - Never stores plaintext passwords
        - Hashes are salted automatically by bcrypt
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plaintext password against a hashed password.

    Args:
        plain_password: User-provided password (from login form)
        hashed_password: Stored bcrypt hash from database

    Returns:
        bool: True if password matches, False otherwise

    Security:
        - Timing-safe comparison (prevents timing attacks)
        - Automatically handles salt extraction from hash
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: UUID, expires_delta: Optional[timedelta] = None) -> str:
    """
    Generate a JWT access token for user authentication.

    Args:
        user_id: User's UUID (will be stored in 'sub' claim)
        expires_delta: Optional custom expiration time (defaults to 24 hours)

    Returns:
        str: Signed JWT token

    Token Structure:
        Header: {"alg": "HS256", "typ": "JWT"}
        Payload: {"sub": "<user_id>", "exp": <timestamp>, "iat": <timestamp>}
        Signature: HMACSHA256(header + payload, BETTER_AUTH_SECRET)

    Security:
        - Tokens expire after 24 hours by default
        - Signed with HS256 (HMAC-SHA256)
        - User ID stored in 'sub' (subject) claim per JWT standard
    """
    if expires_delta is None:
        expires_delta = timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)

    expire = datetime.utcnow() + expires_delta
    to_encode = {
        "sub": str(user_id),  # Subject claim: user ID as string
        "exp": expire,  # Expiration time
        "iat": datetime.utcnow(),  # Issued at time
    }

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> UUID:
    """
    FastAPI dependency for extracting and verifying JWT tokens.

    This function:
    1. Extracts JWT token from Authorization: Bearer header
    2. Verifies token signature using BETTER_AUTH_SECRET
    3. Checks token expiration
    4. Extracts user_id from 'sub' claim
    5. Returns user_id for use in protected endpoints

    Args:
        credentials: HTTP Bearer credentials (automatically injected by FastAPI)

    Returns:
        UUID: User ID extracted from JWT token

    Raises:
        HTTPException(401): If token is missing, invalid, expired, or malformed

    Usage in routes:
        @app.get("/protected")
        async def protected_route(user_id: UUID = Depends(get_current_user)):
            # user_id is automatically extracted from JWT
            return {"user_id": user_id}

    Security:
        - Validates token signature (prevents tampering)
        - Checks expiration (prevents token reuse)
        - Type-safe user_id extraction
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Extract token from credentials
        token = credentials.credentials

        # Decode and verify JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # Extract user ID from 'sub' claim
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception

        # Convert string to UUID
        user_id = UUID(user_id_str)

    except JWTError as e:
        # Handle JWT-specific errors (expired, invalid signature, etc.)
        error_msg = str(e).lower()

        if "expired" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        elif "signature" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token signature",
                headers={"WWW-Authenticate": "Bearer"},
            )
        else:
            raise credentials_exception

    except ValueError:
        # Handle invalid UUID format
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format (malformed user ID)",
            headers={"WWW-Authenticate": "Bearer"},
        )

    except Exception:
        # Catch-all for any other unexpected errors
        raise credentials_exception

    return user_id
