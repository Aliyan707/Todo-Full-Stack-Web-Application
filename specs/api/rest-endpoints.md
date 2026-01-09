# REST API Specification: Phase II Endpoints

**Version**: 1.0.0
**Framework**: FastAPI (Python)
**Created**: 2026-01-07
**Related Feature**: `001-phase-ii-specs`

---

## Overview

This document defines all REST API endpoints for the Phase II Todo Application, including authentication and task management. All endpoints follow REST conventions, use JSON for request/response bodies, and require JWT authentication where specified.

**Base URL**: `/api` (relative to backend server root)

**API Principles**:
- **RESTful Design**: Resource-based URLs, standard HTTP verbs
- **JSON Only**: All requests and responses use `application/json` content type
- **Stateless**: No server-side sessions; JWT tokens carry user context
- **Consistent Errors**: Uniform error response structure across all endpoints
- **User-Scoped Data**: All task operations filtered by authenticated user_id

---

## Authentication Endpoints

### POST /api/auth/register

Register a new user account.

#### Request

**Method**: `POST`
**Path**: `/api/auth/register`
**Authentication**: None (public endpoint)
**Content-Type**: `application/json`

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Request Schema**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `email` | string | Yes | Valid email format, max 255 chars, unique | User's email address (used for login) |
| `password` | string | Yes | Min 8 chars, max 128 chars | Plaintext password (hashed before storage) |

**Validation Rules**:
- Email must match regex: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
- Email is case-insensitive (converted to lowercase before storage)
- Password must be at least 8 characters
- Password strength recommended (but not enforced): uppercase, lowercase, digit, special char

#### Response

**Success** (201 Created):

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "created_at": "2026-01-07T12:00:00Z"
}
```

**Response Schema**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Unique user identifier |
| `email` | string | User's email (lowercase) |
| `created_at` | string (ISO 8601) | Account creation timestamp |

**Note**: Password hash is NEVER returned in any response.

**Errors**:

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 Bad Request | `{"error": "Invalid email format"}` | Email doesn't match validation regex |
| 400 Bad Request | `{"error": "Password must be at least 8 characters"}` | Password too short |
| 409 Conflict | `{"error": "Email already registered"}` | Email already exists in database |
| 422 Unprocessable Entity | `{"error": "Validation failed", "detail": {...}}` | Pydantic validation errors |

---

### POST /api/auth/login

Authenticate user and receive JWT token.

#### Request

**Method**: `POST`
**Path**: `/api/auth/login`
**Authentication**: None (public endpoint)
**Content-Type**: `application/json`

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Request Schema**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | User's registered email |
| `password` | string | Yes | User's password |

#### Response

**Success** (200 OK):

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com"
  }
}
```

**Response Schema**:

| Field | Type | Description |
|-------|------|-------------|
| `access_token` | string | JWT token (valid for 24 hours) |
| `token_type` | string | Always "bearer" |
| `user.id` | string (UUID) | User's unique identifier |
| `user.email` | string | User's email |

**Errors**:

| Status Code | Error | Description |
|-------------|-------|-------------|
| 401 Unauthorized | `{"error": "Invalid email or password"}` | Credentials don't match any user |
| 422 Unprocessable Entity | `{"error": "Validation failed", "detail": {...}}` | Missing or invalid fields |

---

### POST /api/auth/logout

Logout user (client-side token invalidation).

#### Request

**Method**: `POST`
**Path**: `/api/auth/logout`
**Authentication**: Required (Bearer token)
**Content-Type**: `application/json`

**Request Body**: None (empty body or `{}`)

**Headers**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response

**Success** (200 OK):

```json
{
  "message": "Logged out successfully"
}
```

**Note**: Logout is primarily client-side (frontend deletes token from storage). Backend confirms token was valid.

**Errors**:

| Status Code | Error | Description |
|-------------|-------|-------------|
| 401 Unauthorized | `{"error": "Authorization header required"}` | No Bearer token provided |
| 401 Unauthorized | `{"error": "Invalid token"}` | Token is malformed or signature invalid |
| 401 Unauthorized | `{"error": "Token expired"}` | Token expiration time has passed |

---

### GET /api/auth/me

Get current authenticated user's profile.

#### Request

**Method**: `GET`
**Path**: `/api/auth/me`
**Authentication**: Required (Bearer token)

**Headers**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters**: None

#### Response

**Success** (200 OK):

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "created_at": "2026-01-07T12:00:00Z"
}
```

**Response Schema**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | User's unique identifier |
| `email` | string | User's email |
| `created_at` | string (ISO 8601) | Account creation timestamp |

**Errors**:

| Status Code | Error | Description |
|-------------|-------|-------------|
| 401 Unauthorized | `{"error": "Authorization header required"}` | No Bearer token provided |
| 401 Unauthorized | `{"error": "Invalid token"}` | Token is malformed or signature invalid |
| 401 Unauthorized | `{"error": "Token expired"}` | Token expiration time has passed |
| 404 Not Found | `{"error": "User not found"}` | User ID from token doesn't exist in database |

---

## Task Management Endpoints

**Authentication Required**: All task endpoints require a valid JWT Bearer token in the `Authorization` header.

**User Scoping**: All task operations automatically filter by the authenticated user's ID (extracted from JWT token). Users can ONLY access their own tasks.

---

### GET /api/tasks

List all tasks for the authenticated user.

#### Request

**Method**: `GET`
**Path**: `/api/tasks`
**Authentication**: Required (Bearer token)

**Headers**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters** (all optional):

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `completed` | boolean | (none) | Filter by completion status. `true` = only completed, `false` = only incomplete, omit = all tasks |
| `limit` | integer | 100 | Maximum number of tasks to return (1-1000) |
| `offset` | integer | 0 | Number of tasks to skip (for pagination) |

**Example**: `GET /api/tasks?completed=false&limit=50&offset=0`

#### Response

**Success** (200 OK):

```json
{
  "tasks": [
    {
      "id": "650e8400-e29b-41d4-a716-446655440001",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": false,
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2026-01-07T12:00:00Z",
      "updated_at": "2026-01-07T12:00:00Z"
    },
    {
      "id": "650e8400-e29b-41d4-a716-446655440002",
      "title": "Finish report",
      "description": null,
      "completed": true,
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2026-01-06T10:30:00Z",
      "updated_at": "2026-01-07T09:15:00Z"
    }
  ],
  "total": 2,
  "limit": 100,
  "offset": 0
}
```

**Response Schema**:

| Field | Type | Description |
|-------|------|-------------|
| `tasks` | array | List of task objects |
| `tasks[].id` | string (UUID) | Task unique identifier |
| `tasks[].title` | string | Task title (1-200 chars) |
| `tasks[].description` | string or null | Task description (optional) |
| `tasks[].completed` | boolean | Completion status |
| `tasks[].user_id` | string (UUID) | Owner user ID (always matches authenticated user) |
| `tasks[].created_at` | string (ISO 8601) | Task creation timestamp |
| `tasks[].updated_at` | string (ISO 8601) | Last modification timestamp |
| `total` | integer | Total number of tasks matching filters (for pagination) |
| `limit` | integer | Limit applied to this query |
| `offset` | integer | Offset applied to this query |

**Errors**:

| Status Code | Error | Description |
|-------------|-------|-------------|
| 401 Unauthorized | `{"error": "Authorization header required"}` | No Bearer token provided |
| 401 Unauthorized | `{"error": "Invalid token"}` | Token is malformed or signature invalid |
| 400 Bad Request | `{"error": "Invalid query parameter", "detail": "limit must be between 1 and 1000"}` | Invalid pagination parameters |

---

### POST /api/tasks

Create a new task for the authenticated user.

#### Request

**Method**: `POST`
**Path**: `/api/tasks`
**Authentication**: Required (Bearer token)
**Content-Type**: `application/json`

**Headers**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body**:

```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false
}
```

**Request Schema**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `title` | string | Yes | 1-200 chars, non-empty | Task title |
| `description` | string | No | Max 10000 chars | Task description (optional) |
| `completed` | boolean | No | Default: false | Initial completion status |

**Note**: `user_id` is automatically set from authenticated user's JWT token (NOT in request body).

#### Response

**Success** (201 Created):

```json
{
  "id": "650e8400-e29b-41d4-a716-446655440001",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-01-07T12:00:00Z",
  "updated_at": "2026-01-07T12:00:00Z"
}
```

**Response Schema**: Same as task object in GET /api/tasks

**Errors**:

| Status Code | Error | Description |
|-------------|-------|-------------|
| 401 Unauthorized | `{"error": "Authorization header required"}` | No Bearer token provided |
| 401 Unauthorized | `{"error": "Invalid token"}` | Token is malformed or signature invalid |
| 400 Bad Request | `{"error": "Title is required"}` | Missing or empty title field |
| 400 Bad Request | `{"error": "Title must be 1-200 characters"}` | Title exceeds length limit |
| 422 Unprocessable Entity | `{"error": "Validation failed", "detail": {...}}` | Pydantic validation errors |

---

### GET /api/tasks/:id

Get a single task by ID (must belong to authenticated user).

#### Request

**Method**: `GET`
**Path**: `/api/tasks/{task_id}`
**Authentication**: Required (Bearer token)

**Headers**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `task_id` | string (UUID) | Task unique identifier |

**Example**: `GET /api/tasks/650e8400-e29b-41d4-a716-446655440001`

#### Response

**Success** (200 OK):

```json
{
  "id": "650e8400-e29b-41d4-a716-446655440001",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-01-07T12:00:00Z",
  "updated_at": "2026-01-07T12:00:00Z"
}
```

**Response Schema**: Same as task object in GET /api/tasks

**Errors**:

| Status Code | Error | Description |
|-------------|-------|-------------|
| 401 Unauthorized | `{"error": "Authorization header required"}` | No Bearer token provided |
| 401 Unauthorized | `{"error": "Invalid token"}` | Token is malformed or signature invalid |
| 404 Not Found | `{"error": "Task not found"}` | Task ID doesn't exist OR belongs to different user |
| 400 Bad Request | `{"error": "Invalid task ID format"}` | task_id is not a valid UUID |

**Security Note**: 404 is returned for both "task doesn't exist" and "task belongs to another user" to prevent information leakage.

---

### PUT /api/tasks/:id

Update an existing task (must belong to authenticated user).

#### Request

**Method**: `PUT`
**Path**: `/api/tasks/{task_id}`
**Authentication**: Required (Bearer token)
**Content-Type**: `application/json`

**Headers**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `task_id` | string (UUID) | Task unique identifier |

**Request Body**:

```json
{
  "title": "Buy groceries (updated)",
  "description": "Milk, eggs, bread, coffee",
  "completed": true
}
```

**Request Schema**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `title` | string | Yes | 1-200 chars, non-empty | Updated task title |
| `description` | string | No | Max 10000 chars, nullable | Updated description (can be null to clear) |
| `completed` | boolean | No | Default: unchanged | Updated completion status |

**Partial Updates**: All fields are optional in the request body. Only provided fields are updated.

#### Response

**Success** (200 OK):

```json
{
  "id": "650e8400-e29b-41d4-a716-446655440001",
  "title": "Buy groceries (updated)",
  "description": "Milk, eggs, bread, coffee",
  "completed": true,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-01-07T12:00:00Z",
  "updated_at": "2026-01-07T12:30:00Z"
}
```

**Response Schema**: Same as task object in GET /api/tasks

**Note**: `updated_at` timestamp is automatically updated by database trigger.

**Errors**:

| Status Code | Error | Description |
|-------------|-------|-------------|
| 401 Unauthorized | `{"error": "Authorization header required"}` | No Bearer token provided |
| 401 Unauthorized | `{"error": "Invalid token"}` | Token is malformed or signature invalid |
| 404 Not Found | `{"error": "Task not found"}` | Task ID doesn't exist OR belongs to different user |
| 400 Bad Request | `{"error": "Title is required"}` | Missing or empty title field |
| 400 Bad Request | `{"error": "Title must be 1-200 characters"}` | Title exceeds length limit |
| 400 Bad Request | `{"error": "Invalid task ID format"}` | task_id is not a valid UUID |
| 422 Unprocessable Entity | `{"error": "Validation failed", "detail": {...}}` | Pydantic validation errors |

---

### DELETE /api/tasks/:id

Delete a task (must belong to authenticated user).

#### Request

**Method**: `DELETE`
**Path**: `/api/tasks/{task_id}`
**Authentication**: Required (Bearer token)

**Headers**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `task_id` | string (UUID) | Task unique identifier |

**Request Body**: None

#### Response

**Success** (204 No Content):

No response body. Status code 204 indicates successful deletion.

**Errors**:

| Status Code | Error | Description |
|-------------|-------|-------------|
| 401 Unauthorized | `{"error": "Authorization header required"}` | No Bearer token provided |
| 401 Unauthorized | `{"error": "Invalid token"}` | Token is malformed or signature invalid |
| 404 Not Found | `{"error": "Task not found"}` | Task ID doesn't exist OR belongs to different user |
| 400 Bad Request | `{"error": "Invalid task ID format"}` | task_id is not a valid UUID |

---

## Error Response Structure

All error responses follow this consistent format:

### Standard Error Response

```json
{
  "error": "Human-readable error message",
  "detail": {
    "field_name": "Specific validation error for this field"
  }
}
```

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `error` | string | Yes | High-level error message (user-friendly) |
| `detail` | object or string | No | Additional error details (field-level validation errors, stack trace in dev mode) |

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 OK | Success | Successful GET, PUT, POST /api/auth/logout |
| 201 Created | Resource Created | Successful POST /api/auth/register, POST /api/tasks |
| 204 No Content | Success (no body) | Successful DELETE /api/tasks/:id |
| 400 Bad Request | Client Error | Invalid input, validation errors, malformed requests |
| 401 Unauthorized | Authentication Required | Missing, invalid, or expired JWT token |
| 403 Forbidden | Authorization Denied | Valid token but insufficient permissions (rare in this API) |
| 404 Not Found | Resource Not Found | Task/user doesn't exist or doesn't belong to user |
| 409 Conflict | Resource Conflict | Email already registered |
| 422 Unprocessable Entity | Validation Failed | Pydantic schema validation errors |
| 500 Internal Server Error | Server Error | Unexpected backend error (database down, etc.) |

---

## Request/Response Examples

### Complete Flow: Register → Login → Create Task → List Tasks → Update Task → Delete Task

#### Step 1: Register

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "SecurePass123!"
}

# Response: 201 Created
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "alice@example.com",
  "created_at": "2026-01-07T12:00:00Z"
}
```

#### Step 2: Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "SecurePass123!"
}

# Response: 200 OK
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJleHAiOjE3MDQ4MjA4MDB9.signature",
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "alice@example.com"
  }
}
```

#### Step 3: Create Task

```bash
POST /api/tasks
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}

# Response: 201 Created
{
  "id": "650e8400-e29b-41d4-a716-446655440001",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-01-07T12:00:00Z",
  "updated_at": "2026-01-07T12:00:00Z"
}
```

#### Step 4: List Tasks

```bash
GET /api/tasks
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Response: 200 OK
{
  "tasks": [
    {
      "id": "650e8400-e29b-41d4-a716-446655440001",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": false,
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2026-01-07T12:00:00Z",
      "updated_at": "2026-01-07T12:00:00Z"
    }
  ],
  "total": 1,
  "limit": 100,
  "offset": 0
}
```

#### Step 5: Update Task

```bash
PUT /api/tasks/650e8400-e29b-41d4-a716-446655440001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "completed": true
}

# Response: 200 OK
{
  "id": "650e8400-e29b-41d4-a716-446655440001",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": true,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-01-07T12:00:00Z",
  "updated_at": "2026-01-07T12:15:00Z"
}
```

#### Step 6: Delete Task

```bash
DELETE /api/tasks/650e8400-e29b-41d4-a716-446655440001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Response: 204 No Content
(empty body)
```

---

## Security Considerations

### JWT Token Requirements

1. **Include in Authorization Header**: `Authorization: Bearer <token>`
2. **Token Validation**: Backend MUST verify signature, expiration, and extract user_id from 'sub' claim
3. **User ID Extraction**: Always use user_id from JWT token, NEVER from request body or query params
4. **Token Expiration**: Tokens expire after 24 hours. Frontend must handle 401 errors and refresh/re-login

### Data Isolation (User Scoping)

**CRITICAL SECURITY REQUIREMENT**: All task queries MUST filter by `user_id` extracted from JWT token.

```python
# CORRECT: User-scoped query
tasks = session.exec(
    select(Task).where(Task.user_id == current_user_id)
).all()

# WRONG: No user filtering (security vulnerability!)
tasks = session.exec(select(Task)).all()  # NEVER DO THIS
```

### Input Validation

1. **SQL Injection Prevention**: Use parameterized queries (SQLModel/SQLAlchemy ORM handles this)
2. **XSS Prevention**: Sanitize inputs (FastAPI/Pydantic handles basic sanitization)
3. **Field-Level Validation**: Pydantic models enforce type safety and constraints
4. **Length Limits**: Title max 200 chars, email max 255 chars (database constraints)

### Error Messages (Security)

- **DO NOT** leak sensitive information in error messages
- **DO** return generic "Task not found" for both non-existent and unauthorized access
- **DO NOT** expose stack traces in production (use `debug=False` in FastAPI)
- **DO** log detailed errors server-side for debugging

**Example**:

```python
# GOOD: Generic error (doesn't leak if task exists for another user)
raise HTTPException(status_code=404, detail="Task not found")

# BAD: Leaks information
raise HTTPException(status_code=403, detail="Task belongs to user XYZ")  # NEVER DO THIS
```

---

## CORS Configuration

For development (Next.js frontend on different port):

```python
# backend/app/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

For production:

```python
# Only allow production frontend domain
allow_origins=["https://yourdomain.com"]
```

---

## Rate Limiting (Future Enhancement)

**Not implemented in Phase II MVP**, but recommended for production:

```python
# Example rate limiting (using slowapi or similar)
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/auth/login")
@limiter.limit("5/minute")  # Max 5 login attempts per minute per IP
async def login(request: Request, ...):
    ...
```

---

## Appendix: Pydantic Models (Backend)

### Request Models

```python
# app/models/requests.py
from pydantic import BaseModel, EmailStr, constr

class RegisterRequest(BaseModel):
    email: EmailStr
    password: constr(min_length=8, max_length=128)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TaskCreateRequest(BaseModel):
    title: constr(min_length=1, max_length=200)
    description: str | None = None
    completed: bool = False

class TaskUpdateRequest(BaseModel):
    title: constr(min_length=1, max_length=200) | None = None
    description: str | None = None
    completed: bool | None = None
```

### Response Models

```python
# app/models/responses.py
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class UserResponse(BaseModel):
    id: UUID
    email: str
    created_at: datetime

class TaskResponse(BaseModel):
    id: UUID
    title: str
    description: str | None
    completed: bool
    user_id: UUID
    created_at: datetime
    updated_at: datetime

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TaskListResponse(BaseModel):
    tasks: list[TaskResponse]
    total: int
    limit: int
    offset: int
```

---

**End of REST API Specification**

**Related Documents**:
- `specs/database/schema.md` - Database schema (defines data structure)
- `specs/skills/auth-bridge.md` - JWT authentication (token verification)
- `specs/ui/components.md` - Frontend components (API consumers)
- `specs/001-phase-ii-specs/spec.md` - Master specification document

**Change Log**:
- 2026-01-07: v1.0.0 - Initial API specification for Phase II
