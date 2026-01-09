# Auth-Bridge Specification: Better Auth (Next.js) ↔ FastAPI (Python) JWT Handshake

**Version**: 1.0.0
**Created**: 2026-01-07
**Related Feature**: `001-phase-ii-specs`

---

## Overview

This document specifies the authentication handshake between the Next.js frontend (using Better Auth) and the FastAPI backend (using PyJWT), enabling secure, stateless authentication via JWT tokens.

**Architecture**:
- **Frontend**: Better Auth issues JWT tokens after successful login
- **Backend**: FastAPI verifies JWT tokens and extracts user context
- **Shared Secret**: `BETTER_AUTH_SECRET` environment variable (symmetric key for HS256)

---

## JWT Token Structure

### Token Components

A JWT token consists of three parts: `header.payload.signature`

**Header**:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload (Claims)**:
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "exp": 1704820800,
  "iat": 1704734400
}
```

**Signature**: HMAC-SHA256(base64(header) + "." + base64(payload), BETTER_AUTH_SECRET)

### Claim Specifications

| Claim | Name | Type | Required | Description |
|-------|------|------|----------|-------------|
| `sub` | Subject | string (UUID) | Yes | User ID (primary key from users table) |
| `exp` | Expiration | integer (Unix timestamp) | Yes | Token expiration time (24 hours from issuance) |
| `iat` | Issued At | integer (Unix timestamp) | Yes | Token creation time |

**Encoding**: Base64URL encoding (JWT standard)
**Algorithm**: HS256 (HMAC with SHA-256)

---

## Frontend Implementation (Next.js + Better Auth)

### 1. Better Auth Configuration

**File**: `frontend/lib/auth.ts`

```typescript
import { betterAuth } from 'better-auth'
import { jwtPlugin } from 'better-auth/plugins'

export const auth = betterAuth({
  database: {
    // Better Auth can manage its own user table or sync with backend
    provider: 'postgres',  // Or 'none' if backend manages users
    url: process.env.DATABASE_URL
  },

  secret: process.env.BETTER_AUTH_SECRET,  // Shared with backend!

  jwt: {
    algorithm: 'HS256',
    expiresIn: '24h',  // 24 hours
    issuer: 'todo-app',
    audience: 'todo-app-api'
  },

  session: {
    cookieName: 'todo-app-session',
    maxAge: 60 * 60 * 24,  // 24 hours in seconds
    updateAge: 60 * 60,  // Refresh every hour
    httpOnly: true,  // Prevent XSS access
    secure: process.env.NODE_ENV === 'production',  // HTTPS only in prod
    sameSite: 'lax'  // CSRF protection
  }
})
```

### 2. Token Generation Flow

**Login Endpoint** (handled by Better Auth):

```typescript
// frontend/app/api/auth/[...all]/route.ts
import { auth } from '@/lib/auth'

export const { GET, POST } = auth.handler()
```

**After Successful Login**:
1. Better Auth validates credentials against database
2. Creates JWT token with user_id in 'sub' claim
3. Signs token with `BETTER_AUTH_SECRET`
4. Sets httpOnly cookie with token
5. Returns token to client (also stored in session)

### 3. Token Extraction Helper

**File**: `frontend/lib/auth-utils.ts`

```typescript
import { cookies } from 'next/headers'
import { auth } from './auth'

export async function getAuthToken(): Promise<string | null> {
  try {
    // Get session from Better Auth
    const session = await auth.api.getSession({
      headers: await cookies()
    })

    if (!session) {
      return null
    }

    // Extract JWT token from session
    return session.token
  } catch (error) {
    console.error('Failed to get auth token:', error)
    return null
  }
}

export async function getCurrentUserId(): Promise<string | null> {
  const token = await getAuthToken()
  if (!token) return null

  try {
    // Decode JWT (client-side, no verification)
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sub
  } catch {
    return null
  }
}
```

### 4. API Client Integration

**File**: `frontend/lib/api-client.ts`

```typescript
import { getAuthToken } from './auth-utils'

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = await getAuthToken()

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options?.headers,
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid - redirect to login
      window.location.href = '/login'
    }

    const error = await response.json()
    throw new Error(error.error || 'API request failed')
  }

  if (response.status === 204) {
    return null as T  // No content for DELETE operations
  }

  return response.json()
}
```

---

## Backend Implementation (FastAPI + PyJWT)

### 1. Dependencies Installation

```bash
# In backend directory
uv add pyjwt python-jose passlib[bcrypt]
```

### 2. JWT Verification Module

**File**: `backend/app/auth.py`

```python
import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from uuid import UUID

# Security scheme
security = HTTPBearer()

# Secret key (shared with Next.js Better Auth)
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET")
if not SECRET_KEY:
    raise ValueError("BETTER_AUTH_SECRET environment variable must be set")

ALGORITHM = "HS256"

def create_access_token(user_id: UUID, expires_delta: timedelta = timedelta(hours=24)) -> str:
    """
    Create a new JWT token for a user.

    Args:
        user_id: User's UUID from database
        expires_delta: Token expiration duration (default 24 hours)

    Returns:
        Encoded JWT token string
    """
    expire = datetime.utcnow() + expires_delta
    to_encode = {
        "sub": str(user_id),  # Convert UUID to string
        "exp": int(expire.timestamp()),
        "iat": int(datetime.utcnow().timestamp())
    }

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> UUID:
    """
    FastAPI dependency injection function to extract user_id from JWT token.

    Usage:
        @app.get("/api/tasks")
        async def get_tasks(user_id: UUID = Depends(get_current_user)):
            # user_id is automatically extracted from JWT token
            tasks = session.exec(select(Task).where(Task.user_id == user_id)).all()
            return tasks

    Args:
        credentials: HTTP Authorization header with Bearer token

    Returns:
        User's UUID extracted from token 'sub' claim

    Raises:
        HTTPException 401: If token is missing, invalid, or expired
    """
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token: missing user ID"
            )

        # Convert string back to UUID
        user_id = UUID(user_id_str)
        return user_id

    except JWTError as e:
        error_msg = str(e)

        if "expired" in error_msg.lower():
            raise HTTPException(
                status_code=401,
                detail="Token expired"
            )
        else:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )
    except ValueError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token: malformed user ID"
        )
```

### 3. Protected Endpoint Example

**File**: `backend/app/routes/tasks.py`

```python
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from uuid import UUID

from app.auth import get_current_user
from app.database import get_session
from app.models import Task, TaskCreateRequest, TaskResponse

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

@router.get("", response_model=list[TaskResponse])
async def get_tasks(
    user_id: UUID = Depends(get_current_user),  # JWT verification happens here!
    session: Session = Depends(get_session)
):
    """
    List all tasks for the authenticated user.

    User ID is automatically extracted from JWT token via get_current_user dependency.
    """
    tasks = session.exec(
        select(Task).where(Task.user_id == user_id)
    ).all()

    return tasks

@router.post("", response_model=TaskResponse, status_code=201)
async def create_task(
    task_data: TaskCreateRequest,
    user_id: UUID = Depends(get_current_user),  # JWT verification + user_id extraction
    session: Session = Depends(get_session)
):
    """
    Create a new task for the authenticated user.

    User ID is automatically set from JWT token (NOT from request body).
    """
    task = Task(
        title=task_data.title,
        description=task_data.description,
        completed=task_data.completed,
        user_id=user_id  # From JWT token, not request!
    )

    session.add(task)
    session.commit()
    session.refresh(task)

    return task
```

---

## Secret Management

### Shared Secret (`BETTER_AUTH_SECRET`)

**Requirements**:
- Minimum 32 characters (recommended 64+ for production)
- Cryptographically random (use `openssl rand -base64 64`)
- MUST be identical in both frontend and backend
- NEVER committed to version control
- Stored in deployment platform secrets

**Generation**:
```bash
# Generate a secure random secret
openssl rand -base64 64 | tr -d '\n'
```

**Example Output**:
```
A8g4JtZ2mN9xP5wQ7rS3uV6yC8eH1kL4oP9qR2tU5xA7yB9zA1cD3fE6gH8jK0mN2pQ4sT6vX9zB1dF3gJ5lM7nP
```

### Environment Variable Configuration

**Frontend (.env.local)**:
```bash
BETTER_AUTH_SECRET="A8g4JtZ2mN9xP5wQ7rS3uV6yC8eH1kL4oP9qR2tU5xA7yB9zA1cD3fE6gH8jK0mN2pQ4sT6vX9zB1dF3gJ5lM7nP"
DATABASE_URL="postgresql://user:pass@host/db"
NEXT_PUBLIC_API_URL="http://localhost:8000"  # Backend URL
```

**Backend (.env)**:
```bash
BETTER_AUTH_SECRET="A8g4JtZ2mN9xP5wQ7rS3uV6yC8eH1kL4oP9qR2tU5xA7yB9zA1cD3fE6gH8jK0mN2pQ4sT6vX9zB1dF3gJ5lM7nP"
DATABASE_URL="postgresql://user:pass@host/db"
```

**Deployment (Vercel + Render)**:

Frontend (Vercel):
```
Settings → Environment Variables → Add:
BETTER_AUTH_SECRET=<secret>
DATABASE_URL=<neon-url>
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

Backend (Render/Railway):
```
Environment → Add Secret:
BETTER_AUTH_SECRET=<secret>
DATABASE_URL=<neon-url>
```

### Secret Rotation

**When to Rotate**:
- Suspected compromise
- Employee offboarding (if they had access)
- Scheduled rotation (recommended: quarterly)

**Rotation Process**:
1. Generate new secret
2. Deploy backend with new secret first (supports both old and new temporarily)
3. Deploy frontend with new secret
4. Remove old secret from backend after 24 hours (token expiration)
5. All users forced to re-login

---

## Error Handling

### Frontend Error Scenarios

| Scenario | Detection | Action |
|----------|-----------|--------|
| Token expired | API returns 401 | Redirect to /login, clear local session |
| Token invalid | API returns 401 | Redirect to /login, clear local session |
| No token | getAuthToken() returns null | Redirect to /login or show login form |
| Network error | fetch() throws | Show error message, retry option |

**Example Error Handling (Frontend)**:

```typescript
// frontend/lib/api-client.ts
if (response.status === 401) {
  // Clear Better Auth session
  await auth.api.signOut()

  // Redirect to login (preserve intended destination)
  const returnUrl = encodeURIComponent(window.location.pathname)
  window.location.href = `/login?returnUrl=${returnUrl}`

  throw new Error('Authentication required')
}
```

### Backend Error Scenarios

| Scenario | Detection | HTTP Status | Response |
|----------|-----------|-------------|----------|
| Missing Authorization header | credentials is None | 401 | `{"error": "Authorization header required"}` |
| Invalid token format | JWT decode fails | 401 | `{"error": "Invalid token"}` |
| Expired token | exp claim < current time | 401 | `{"error": "Token expired"}` |
| Invalid signature | Signature verification fails | 401 | `{"error": "Invalid token"}` |
| Missing sub claim | payload["sub"] is None | 401 | `{"error": "Invalid token: missing user ID"}` |

---

## Testing the Auth Flow

### End-to-End Test

```bash
# 1. Register a user (backend direct or via frontend)
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "SecurePass123!"}'

# 2. Login to get JWT token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "SecurePass123!"}'

# Response:
# {"access_token": "eyJ...", "token_type": "bearer", "user": {...}}

# 3. Use token to access protected endpoint
TOKEN="eyJ..."  # Copy from login response

curl -X GET http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN"

# Should return: {"tasks": [], "total": 0, "limit": 100, "offset": 0}

# 4. Create a task
curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test task", "description": "Testing auth"}'

# Should return: {"id": "...", "title": "Test task", ...}
```

### Verification Checklist

- [ ] Frontend can obtain JWT token after login
- [ ] Token includes user_id in 'sub' claim
- [ ] Backend successfully verifies token signature
- [ ] Backend extracts user_id from token
- [ ] Protected endpoints reject requests without token (401)
- [ ] Protected endpoints reject requests with invalid token (401)
- [ ] Protected endpoints reject requests with expired token (401)
- [ ] User can only access their own data (user_id scoping works)
- [ ] Token refresh/re-login flow works after expiration
- [ ] Logout clears token from frontend storage

---

## Security Best Practices

### Do's ✅

1. **Use HTTPS in production**: Prevents token interception
2. **Set httpOnly cookies**: Prevents XSS token theft
3. **Validate tokens on every request**: No caching, always verify signature
4. **Use strong secrets**: 64+ character random strings
5. **Rotate secrets periodically**: Quarterly or after suspected compromise
6. **Log failed auth attempts**: Monitor for brute-force attacks
7. **Use secure token storage**: httpOnly cookies or secure localStorage wrapper
8. **Implement token expiration**: 24 hours maximum
9. **Verify user exists in database**: Even if token is valid
10. **Filter all queries by user_id**: Enforce data isolation

### Don'ts ❌

1. **Don't store JWT in localStorage without XSS protection**
2. **Don't include sensitive data in JWT payload** (it's base64, not encrypted)
3. **Don't trust client-provided user_id** (always use token's 'sub' claim)
4. **Don't skip signature verification** (validate on every request)
5. **Don't use weak secrets** (< 32 characters, predictable patterns)
6. **Don't commit secrets to version control** (.env must be in .gitignore)
7. **Don't implement custom crypto** (use proven libraries: PyJWT, jose)
8. **Don't allow unlimited token lifetimes** (enforce expiration)
9. **Don't leak user data in error messages** (generic "Invalid token" only)
10. **Don't use asymmetric algorithms (RS256) unless needed** (HS256 is simpler for single backend)

---

**End of Auth-Bridge Specification**

**Related Documents**:
- `specs/database/schema.md` - Users table (authentication data storage)
- `specs/api/rest-endpoints.md` - Protected endpoints (JWT consumers)
- `specs/ui/components.md` - Login/signup components (JWT generators)
- `specs/001-phase-ii-specs/spec.md` - Master specification document
- `.claude/skills/auth-bridge.md` - Skill reference (implementation guidance)

**Change Log**:
- 2026-01-07: v1.0.0 - Initial auth-bridge specification for Phase II
