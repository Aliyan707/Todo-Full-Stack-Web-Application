# Data Model: Phase II Todo Application

**Version**: 1.0.0
**Created**: 2026-01-07
**Feature**: `001-phase-ii-specs`
**Related Documents**: `specs/database/schema.md`, `specs/api/rest-endpoints.md`, `specs/001-phase-ii-specs/spec.md`

---

## Overview

This document defines the complete data model for the Phase II Todo Application, including all entities, attributes, relationships, and data flow across the three-layer architecture (Database, API, Frontend). It serves as the single source of truth for understanding how data is structured, transformed, and exchanged throughout the system.

**Architecture Layers**:
- **Database Layer**: PostgreSQL tables with UUIDs, constraints, and relationships
- **API Layer**: Pydantic models for request/response validation and serialization
- **Frontend Layer**: TypeScript interfaces for type-safe client-side data handling

**Design Principles**:
- **Single Source of Truth**: Database schema defines canonical field names and types
- **Zero Drift**: Field names and types must match exactly across all layers
- **Type Safety**: Strong typing at every layer (PostgreSQL types → Pydantic → TypeScript)
- **Validation Hierarchy**: Database constraints → API validation → Frontend validation

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      PHASE II DATA MODEL                     │
└─────────────────────────────────────────────────────────────┘

Database Layer (PostgreSQL)
────────────────────────────────────────────────────────────────

┌──────────────────┐                    ┌──────────────────────┐
│      users       │                    │       tasks          │
├──────────────────┤                    ├──────────────────────┤
│ id (UUID) PK     │◄───────────────────│ id (UUID) PK         │
│ email (VARCHAR)  │        1:N         │ title (VARCHAR(200)) │
│ password_hash    │                    │ description (TEXT)   │
│ created_at       │                    │ completed (BOOLEAN)  │
│ updated_at       │                    │ user_id (UUID) FK    │
└──────────────────┘                    │ created_at           │
                                        │ updated_at           │
                                        └──────────────────────┘

API Layer (Pydantic Models)
────────────────────────────────────────────────────────────────

┌─────────────────────┐     ┌──────────────────────┐
│   UserCreate        │     │   TaskCreate         │
│   - email           │     │   - title            │
│   - password        │     │   - description?     │
└─────────────────────┘     │   - completed        │
                            └──────────────────────┘
┌─────────────────────┐
│   UserResponse      │     ┌──────────────────────┐
│   - id              │     │   TaskResponse       │
│   - email           │     │   - id               │
│   - created_at      │     │   - title            │
│   - updated_at      │     │   - description?     │
└─────────────────────┘     │   - completed        │
                            │   - user_id          │
┌─────────────────────┐     │   - created_at       │
│   AuthResponse      │     │   - updated_at       │
│   - access_token    │     └──────────────────────┘
│   - token_type      │
│   - user            │     ┌──────────────────────┐
└─────────────────────┘     │   TaskUpdate         │
                            │   - title?           │
                            │   - description?     │
                            │   - completed?       │
                            └──────────────────────┘

Frontend Layer (TypeScript Interfaces)
────────────────────────────────────────────────────────────────

┌─────────────────────┐     ┌──────────────────────┐
│   User              │     │   Task               │
│   - id: string      │     │   - id: string       │
│   - email: string   │     │   - title: string    │
│   - createdAt: Date │     │   - description?: st │
│   - updatedAt: Date │     │   - completed: bool  │
└─────────────────────┘     │   - userId: string   │
                            │   - createdAt: Date  │
┌─────────────────────┐     │   - updatedAt: Date  │
│   AuthState         │     └──────────────────────┘
│   - user: User?     │
│   - token: string?  │     ┌──────────────────────┐
│   - loading: bool   │     │   TaskFormData       │
│   - error: string?  │     │   - title: string    │
└─────────────────────┘     │   - description: str │
                            │   - completed: bool  │
                            └──────────────────────┘
```

---

## Core Entities

### 1. User Entity

**Purpose**: Represents an authenticated user account with email-based credentials.

**Lifecycle**: Created during registration → Updated when profile modified → Deleted when account removed (cascades to tasks)

#### Database Representation (PostgreSQL)

**Table**: `users`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier (auto-generated) |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | User's email address (login identifier) |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt/Argon2 hashed password (never plaintext) |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Account creation timestamp (immutable) |
| `updated_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Last modification timestamp (auto-updated via trigger) |

**Indexes**:
- `idx_users_email` (UNIQUE) - For fast email lookups during login
- `idx_users_created_at` - For registration analytics

**Triggers**:
- `update_users_updated_at` - Automatically updates `updated_at` on row modification

#### API Representation (Pydantic Models)

**Backend File**: `backend/app/models/user.py`

```python
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# Database model (SQLModel)
class User(SQLModel, table=True):
    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(max_length=255, unique=True, index=True)
    password_hash: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    tasks: list["Task"] = Relationship(back_populates="user", cascade_delete=True)

# Request models
class UserCreateRequest(BaseModel):
    """POST /api/auth/register request body"""
    email: EmailStr  # Validates email format
    password: str = Field(min_length=8, max_length=100)

class UserLoginRequest(BaseModel):
    """POST /api/auth/login request body"""
    email: EmailStr
    password: str

# Response models
class UserResponse(BaseModel):
    """User data returned to client (NO password_hash!)"""
    id: UUID
    email: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Allow ORM mode

class AuthResponse(BaseModel):
    """POST /api/auth/login and /api/auth/register response"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
```

#### Frontend Representation (TypeScript Interfaces)

**Frontend File**: `frontend/lib/types.ts`

```typescript
// Core user entity
export interface User {
  id: string              // UUID as string
  email: string
  createdAt: Date         // Converted from ISO string via Date constructor
  updatedAt: Date
}

// Authentication state management
export interface AuthState {
  user: User | null       // Null when not authenticated
  token: string | null    // JWT token
  loading: boolean        // During login/register/session load
  error: string | null    // Error message from auth operations
}

// Authentication response from API
export interface AuthResponse {
  access_token: string
  token_type: string      // "bearer"
  user: User
}

// Form data interfaces
export interface LoginFormData {
  email: string
  password: string
}

export interface SignupFormData {
  email: string
  password: string
  confirmPassword: string  // Frontend-only validation
}
```

#### Field Mapping Across Layers

| Database | API (Pydantic) | Frontend (TypeScript) | Notes |
|----------|----------------|-----------------------|-------|
| `id` (UUID) | `id` (UUID) | `id` (string) | UUID serialized as string for JSON |
| `email` (VARCHAR) | `email` (str) | `email` (string) | Email format validated at API layer |
| `password_hash` (VARCHAR) | `password_hash` (str) | N/A | **NEVER sent to frontend** |
| N/A | `password` (str) | `password` (string) | Request-only field, hashed before DB storage |
| `created_at` (TIMESTAMP) | `created_at` (datetime) | `createdAt` (Date) | ISO 8601 string in JSON, converted to Date |
| `updated_at` (TIMESTAMP) | `updated_at` (datetime) | `updatedAt` (Date) | ISO 8601 string in JSON, converted to Date |

**Case Convention**:
- Database: `snake_case` (PostgreSQL convention)
- API (Pydantic): `snake_case` (Python convention)
- Frontend (TypeScript): `camelCase` (JavaScript/TypeScript convention)

**Conversion Happens At**: API response serialization (Pydantic model → JSON) and frontend deserialization (JSON → TypeScript object)

---

### 2. Task Entity

**Purpose**: Represents a todo item owned by a specific user.

**Lifecycle**: Created via POST /api/tasks → Updated via PUT /api/tasks/:id → Deleted via DELETE /api/tasks/:id OR cascading delete when user removed

#### Database Representation (PostgreSQL)

**Table**: `tasks`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier (auto-generated) |
| `title` | VARCHAR(200) | NOT NULL | Task title (1-200 characters) |
| `description` | TEXT | NULLABLE | Optional detailed description |
| `completed` | BOOLEAN | NOT NULL, DEFAULT FALSE | Completion status (true = done, false = pending) |
| `user_id` | UUID | NOT NULL, FOREIGN KEY → users(id), ON DELETE CASCADE | Owner reference (task belongs to user) |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Task creation timestamp |
| `updated_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Last modification timestamp (auto-updated) |

**Indexes**:
- `idx_tasks_user_id` - For filtering tasks by user (most common query)
- `idx_tasks_user_id_completed` - Composite index for filtering incomplete tasks by user
- `idx_tasks_created_at` - For chronological sorting
- `idx_tasks_completed` - For global completion status filtering

**Foreign Keys**:
- `fk_tasks_user_id` → `users(id)` with `ON DELETE CASCADE`

**Triggers**:
- `update_tasks_updated_at` - Automatically updates `updated_at` on row modification

#### API Representation (Pydantic Models)

**Backend File**: `backend/app/models/task.py`

```python
from uuid import UUID, uuid4
from datetime import datetime
from pydantic import BaseModel, Field
from sqlmodel import SQLModel, Relationship

# Database model (SQLModel)
class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str = Field(max_length=200)
    description: str | None = Field(default=None)
    completed: bool = Field(default=False)
    user_id: UUID = Field(foreign_key="users.id", ondelete="CASCADE")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    user: "User" = Relationship(back_populates="tasks")

# Request models
class TaskCreateRequest(BaseModel):
    """POST /api/tasks request body"""
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    completed: bool = False

class TaskUpdateRequest(BaseModel):
    """PUT /api/tasks/:id request body (all fields optional for partial updates)"""
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    completed: bool | None = None

# Response models
class TaskResponse(BaseModel):
    """Task data returned to client"""
    id: UUID
    title: str
    description: str | None
    completed: bool
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TaskListResponse(BaseModel):
    """GET /api/tasks response (paginated)"""
    tasks: list[TaskResponse]
    total: int
    limit: int
    offset: int
```

#### Frontend Representation (TypeScript Interfaces)

**Frontend File**: `frontend/lib/types.ts`

```typescript
// Core task entity
export interface Task {
  id: string              // UUID as string
  title: string           // 1-200 characters
  description?: string    // Optional detailed description
  completed: boolean      // Completion status
  userId: string          // Owner's UUID as string
  createdAt: Date         // Converted from ISO string
  updatedAt: Date
}

// Task state management
export interface TaskState {
  tasks: Task[]           // List of all user's tasks
  activeTask: Task | null // Currently editing task
  loading: boolean        // During API calls
  error: string | null    // Error message from operations
  filter: 'all' | 'active' | 'completed'  // UI filter state
}

// Form data interfaces
export interface TaskFormData {
  title: string
  description: string     // Empty string if not provided
  completed: boolean
}

// API response interfaces
export interface TaskListResponse {
  tasks: Task[]
  total: number
  limit: number
  offset: number
}
```

#### Field Mapping Across Layers

| Database | API (Pydantic) | Frontend (TypeScript) | Notes |
|----------|----------------|-----------------------|-------|
| `id` (UUID) | `id` (UUID) | `id` (string) | UUID serialized as string for JSON |
| `title` (VARCHAR(200)) | `title` (str) | `title` (string) | Max 200 chars validated at all layers |
| `description` (TEXT) | `description` (str \| None) | `description?` (string) | Optional field (nullable) |
| `completed` (BOOLEAN) | `completed` (bool) | `completed` (boolean) | Defaults to false |
| `user_id` (UUID) | `user_id` (UUID) | `userId` (string) | **NOT in create request** (extracted from JWT token) |
| `created_at` (TIMESTAMP) | `created_at` (datetime) | `createdAt` (Date) | ISO 8601 string in JSON |
| `updated_at` (TIMESTAMP) | `updated_at` (datetime) | `updatedAt` (Date) | ISO 8601 string in JSON |

**Important Security Note**: `user_id` is NEVER provided by the client in create/update requests. It is always extracted from the JWT token's `sub` claim in the backend using the `get_current_user()` dependency.

---

### 3. Authentication Token (JWT)

**Purpose**: Stateless authentication token that proves user identity and carries user context across requests.

**Lifecycle**: Generated during login → Validated on every protected endpoint request → Expires after 24 hours → Deleted on logout (client-side)

#### Token Structure (JWT)

**Format**: `header.payload.signature` (Base64URL encoded)

```json
// Header
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload (Claims)
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",  // User ID (UUID string)
  "exp": 1704820800,                               // Expiration (Unix timestamp)
  "iat": 1704734400                                // Issued at (Unix timestamp)
}

// Signature
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  BETTER_AUTH_SECRET  // Shared secret between frontend and backend
)
```

#### API Representation

**Backend File**: `backend/app/auth.py`

```python
from jose import jwt
from datetime import datetime, timedelta
from uuid import UUID

def create_access_token(user_id: UUID, expires_delta: timedelta = timedelta(hours=24)) -> str:
    """Generate JWT token for user authentication"""
    expire = datetime.utcnow() + expires_delta
    to_encode = {
        "sub": str(user_id),  # Subject claim (user ID)
        "exp": int(expire.timestamp()),
        "iat": int(datetime.utcnow().timestamp())
    }
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")

async def get_current_user(credentials: HTTPAuthorizationCredentials) -> UUID:
    """Extract user_id from JWT token (dependency injection)"""
    token = credentials.credentials
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    user_id_str = payload.get("sub")
    return UUID(user_id_str)
```

#### Frontend Representation

**Frontend File**: `frontend/lib/auth-utils.ts`

```typescript
// Token stored in httpOnly cookie (managed by Better Auth)
// Frontend extracts token for API requests

export async function getAuthToken(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await cookies() })
  return session?.token ?? null
}

// Decode JWT payload (client-side, no verification)
export function decodeJWT(token: string): { sub: string; exp: number; iat: number } | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload
  } catch {
    return null
  }
}
```

---

## Relationships

### User-Task Relationship (1:N)

**Cardinality**: One user can have many tasks. Each task belongs to exactly one user.

**Database Enforcement**:
```sql
-- Foreign key constraint
ALTER TABLE tasks
ADD CONSTRAINT fk_tasks_user_id
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;
```

**Implications**:
- Deleting a user automatically deletes all their tasks (cascade)
- Tasks cannot exist without an owning user (user_id NOT NULL)
- User cannot be deleted if referenced by tasks (unless using CASCADE)

**API Enforcement**:
```python
# Task creation automatically sets user_id from JWT token
@router.post("/api/tasks", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreateRequest,
    user_id: UUID = Depends(get_current_user),  # Extracted from JWT
    session: Session = Depends(get_session)
):
    task = Task(**task_data.dict(), user_id=user_id)  # user_id from token
    session.add(task)
    session.commit()
    return task
```

**Frontend Usage**:
```typescript
// Tasks are always scoped to the authenticated user
const tasks = await apiClient<TaskListResponse>('/api/tasks')
// Backend automatically filters by user_id from JWT token
```

---

## Data Flow Diagrams

### 1. User Registration Flow

```
┌──────────┐  POST /api/auth/register        ┌──────────┐
│ Frontend │  { email, password }             │ Backend  │
│          ├──────────────────────────────────►          │
│          │                                  │          │
│          │                                  │  1. Validate email/password
│          │                                  │  2. Hash password (bcrypt)
│          │                                  │  3. INSERT INTO users (email, password_hash)
│          │                                  │  4. Generate JWT token (user_id in 'sub')
│          │                                  │
│          │  { access_token, user }          │          │
│          │◄─────────────────────────────────┤          │
│          │                                  └──────────┘
│  5. Store token (httpOnly cookie)
│  6. Update AuthState { user, token }
└──────────┘

Database: users table
┌────────────────────────────────────────────────────┐
│ id: UUID | email: string | password_hash: string  │
└────────────────────────────────────────────────────┘
```

### 2. Task Creation Flow

```
┌──────────┐  POST /api/tasks                ┌──────────┐
│ Frontend │  Authorization: Bearer <token>  │ Backend  │
│          │  { title, description }          │          │
│          ├──────────────────────────────────►          │
│          │                                  │          │
│          │                                  │  1. Verify JWT token signature
│          │                                  │  2. Extract user_id from 'sub' claim
│          │                                  │  3. Validate title (1-200 chars)
│          │                                  │  4. INSERT INTO tasks (title, description, user_id)
│          │                                  │
│          │  { id, title, description,       │          │
│          │    completed, user_id,           │          │
│          │    created_at, updated_at }      │          │
│          │◄─────────────────────────────────┤          │
│          │                                  └──────────┘
│  5. Add task to TaskState.tasks array
│  6. Re-render TaskList component
└──────────┘

Database: tasks table
┌──────────────────────────────────────────────────────────────┐
│ id: UUID | title: string | user_id: UUID (FK to users.id)  │
└──────────────────────────────────────────────────────────────┘
```

### 3. Task Retrieval Flow (with User Scoping)

```
┌──────────┐  GET /api/tasks                 ┌──────────┐
│ Frontend │  Authorization: Bearer <token>  │ Backend  │
│          ├──────────────────────────────────►          │
│          │                                  │          │
│          │                                  │  1. Verify JWT token
│          │                                  │  2. Extract user_id from 'sub' claim
│          │                                  │  3. SELECT * FROM tasks WHERE user_id = $1
│          │                                  │  4. Serialize to TaskResponse models
│          │                                  │
│          │  { tasks: [...], total, limit }  │          │
│          │◄─────────────────────────────────┤          │
│          │                                  └──────────┘
│  5. Convert JSON to Task[] (camelCase)
│  6. Update TaskState.tasks
│  7. Render TaskList component
└──────────┘

Database Query (user_id scoping):
┌──────────────────────────────────────────────────────────────┐
│ SELECT * FROM tasks WHERE user_id = '550e8400...' ──uses idx_│
└──────────────────────────────────────────────────────────────┘
```

---

## Data Validation Strategy

### Multi-Layer Validation

#### Layer 1: Frontend (TypeScript + React)

**Purpose**: Immediate user feedback, prevent unnecessary API calls

**Validation Rules**:
- Email format (regex: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
- Password length (8-100 characters)
- Task title length (1-200 characters)
- Required field checks

**Implementation**:
```typescript
// frontend/components/auth/LoginForm.tsx
const validateEmail = (email: string): string | null => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return regex.test(email) ? null : "Invalid email format"
}

const validateTitle = (title: string): string | null => {
  if (title.length === 0) return "Title is required"
  if (title.length > 200) return "Title must be 200 characters or less"
  return null
}
```

#### Layer 2: API (Pydantic)

**Purpose**: Enforce business rules, sanitize input, prevent malicious data

**Validation Rules**:
- Email format validation (via `EmailStr` type)
- Field length constraints (via `Field(min_length, max_length)`)
- Type coercion and validation (via Pydantic type system)
- Required vs optional fields

**Implementation**:
```python
# backend/app/models/requests.py
class TaskCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    completed: bool = False

    @validator('title')
    def title_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Title cannot be empty or whitespace')
        return v.strip()
```

**Error Response Format**:
```json
// 422 Unprocessable Entity
{
  "error": "Validation error",
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "ensure this value has at least 1 characters",
      "type": "value_error.any_str.min_length"
    }
  ]
}
```

#### Layer 3: Database (PostgreSQL Constraints)

**Purpose**: Final enforcement, data integrity, prevent corruption

**Validation Rules**:
- NOT NULL constraints (required fields)
- UNIQUE constraints (email uniqueness)
- FOREIGN KEY constraints (referential integrity)
- CHECK constraints (enum values, ranges)
- Data type constraints (UUID format, VARCHAR length, BOOLEAN values)

**Implementation**:
```sql
-- Constraints defined in schema
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
ALTER TABLE tasks ADD CONSTRAINT tasks_title_length CHECK (char_length(title) <= 200);
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_user_id FOREIGN KEY (user_id) REFERENCES users(id);
```

**Error Response Example**:
```
ERROR:  duplicate key value violates unique constraint "users_email_unique"
DETAIL:  Key (email)=(user@example.com) already exists.
```

### Validation Error Propagation

```
Frontend Validation Fails
  ↓
  Display inline error message
  Do NOT call API

Frontend Validation Passes
  ↓
  Call API with validated data
  ↓
API Validation Fails (Pydantic)
  ↓
  Return 422 Unprocessable Entity
  Frontend displays API error message

API Validation Passes
  ↓
  Execute database operation
  ↓
Database Constraint Violation
  ↓
  Catch exception in API layer
  Return 400 Bad Request or 409 Conflict
  Frontend displays error message

Database Operation Succeeds
  ↓
  Return 200/201 success response
  Frontend updates UI state
```

---

## Data Transformation Rules

### Case Conversion

**Database → API**: No conversion (both use `snake_case`)

```python
# Database column: created_at
# Pydantic field: created_at
class UserResponse(BaseModel):
    created_at: datetime  # Matches database column name
```

**API → Frontend**: `snake_case` → `camelCase`

```typescript
// API response: { created_at: "2026-01-07T12:00:00Z" }
// Frontend interface: { createdAt: Date }

// Transformation function
function transformUser(apiUser: any): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    createdAt: new Date(apiUser.created_at),  // snake_case → camelCase + Date conversion
    updatedAt: new Date(apiUser.updated_at)
  }
}
```

**Recommended Approach**: Use a centralized transformation utility or API client wrapper

```typescript
// frontend/lib/api-client.ts
export async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  })

  const data = await response.json()

  // Automatically convert snake_case to camelCase
  return transformKeys(data, toCamelCase)
}
```

### Timestamp Conversion

**Database → API**: PostgreSQL `TIMESTAMP WITH TIME ZONE` → Python `datetime`

```python
# Pydantic automatically serializes datetime to ISO 8601 string
class TaskResponse(BaseModel):
    created_at: datetime  # Serialized as "2026-01-07T12:00:00Z"
```

**API → Frontend**: ISO 8601 string → JavaScript `Date` object

```typescript
// Manual conversion
const task: Task = {
  ...apiTask,
  createdAt: new Date(apiTask.created_at),  // "2026-01-07T12:00:00Z" → Date object
  updatedAt: new Date(apiTask.updated_at)
}

// Or use a transformation utility
import { parseISO } from 'date-fns'
const createdAt = parseISO(apiTask.created_at)
```

### UUID Conversion

**Database → API**: PostgreSQL `UUID` → Python `uuid.UUID` object

```python
from uuid import UUID

# SQLModel automatically handles UUID type
class Task(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
```

**API → Frontend**: `uuid.UUID` → string (via JSON serialization)

```typescript
// UUID is serialized as string in JSON
interface Task {
  id: string  // "550e8400-e29b-41d4-a716-446655440000"
}
```

### Nullable Field Handling

**Database `NULL` → API `None` → Frontend `undefined` or `null`**

```python
# Pydantic allows None for optional fields
class TaskResponse(BaseModel):
    description: str | None  # None if NULL in database
```

```typescript
// TypeScript optional property
interface Task {
  description?: string  // undefined if null/None in API response
}

// Or explicit null
interface Task {
  description: string | null  // null if None in API response
}
```

---

## Consistency Guarantees

### Zero Drift Enforcement

**Automated Field Name Validation** (recommended):

```python
# backend/tests/test_model_sync.py
import pytest
from app.models.task import Task, TaskResponse

def test_task_response_matches_database_model():
    """Ensure TaskResponse fields match Task model (database) fields"""
    db_fields = set(Task.__fields__.keys())
    response_fields = set(TaskResponse.__fields__.keys())

    assert db_fields == response_fields, (
        f"Field mismatch: DB has {db_fields - response_fields}, "
        f"Response has {response_fields - db_fields}"
    )
```

**Frontend-Backend Contract Testing**:

```typescript
// frontend/tests/api-contracts.test.ts
import { Task } from '@/lib/types'

test('Task interface matches API response schema', async () => {
  const response = await fetch('/api/tasks')
  const { tasks } = await response.json()

  const task = tasks[0]

  // Verify all expected fields are present
  expect(task).toHaveProperty('id')
  expect(task).toHaveProperty('title')
  expect(task).toHaveProperty('description')
  expect(task).toHaveProperty('completed')
  expect(task).toHaveProperty('user_id')
  expect(task).toHaveProperty('created_at')
  expect(task).toHaveProperty('updated_at')
})
```

### Database-First Development

**Principle**: The database schema is the single source of truth. All other layers derive from it.

**Workflow**:
1. Define database schema in `specs/database/schema.md`
2. Generate SQLModel classes from schema
3. Generate Pydantic request/response models from SQLModel
4. Generate TypeScript interfaces from Pydantic models (or OpenAPI spec)

**Recommended Tools**:
- **datamodel-code-generator**: Generate Pydantic models from OpenAPI spec
- **quicktype**: Generate TypeScript from JSON schema or examples
- **Manual synchronization**: For small projects, manually ensure field names match

---

## Summary: Field Name Reference Table

### User Entity

| Database (PostgreSQL) | API (Pydantic) | Frontend (TypeScript) | Type Conversion |
|-----------------------|----------------|-----------------------|-----------------|
| `id` | `id` | `id` | UUID → str |
| `email` | `email` | `email` | str → str |
| `password_hash` | `password_hash` | N/A (never sent) | - |
| `created_at` | `created_at` | `createdAt` | datetime → ISO 8601 → Date |
| `updated_at` | `updated_at` | `updatedAt` | datetime → ISO 8601 → Date |

### Task Entity

| Database (PostgreSQL) | API (Pydantic) | Frontend (TypeScript) | Type Conversion |
|-----------------------|----------------|-----------------------|-----------------|
| `id` | `id` | `id` | UUID → str |
| `title` | `title` | `title` | str → str |
| `description` | `description` | `description` | str \| None → str? |
| `completed` | `completed` | `completed` | bool → bool |
| `user_id` | `user_id` | `userId` | UUID → str |
| `created_at` | `created_at` | `createdAt` | datetime → ISO 8601 → Date |
| `updated_at` | `updated_at` | `updatedAt` | datetime → ISO 8601 → Date |

---

## Appendix: Sample Data Examples

### User Record (All Layers)

**Database**:
```sql
SELECT * FROM users WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Result:
-- id                                    | email              | password_hash                                      | created_at                 | updated_at
-- 550e8400-e29b-41d4-a716-446655440000  | user@example.com   | $2b$12$LQv3c1yqBWVHxkd0LHAkCO...  | 2026-01-07 12:00:00+00     | 2026-01-07 12:00:00+00
```

**API Response** (UserResponse):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "created_at": "2026-01-07T12:00:00Z",
  "updated_at": "2026-01-07T12:00:00Z"
}
```

**Frontend** (User interface):
```typescript
const user: User = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "user@example.com",
  createdAt: new Date("2026-01-07T12:00:00Z"),
  updatedAt: new Date("2026-01-07T12:00:00Z")
}
```

### Task Record (All Layers)

**Database**:
```sql
SELECT * FROM tasks WHERE id = '650e8400-e29b-41d4-a716-446655440001';

-- Result:
-- id                                    | title          | description              | completed | user_id                               | created_at                 | updated_at
-- 650e8400-e29b-41d4-a716-446655440001  | Buy groceries  | Milk, eggs, bread        | false     | 550e8400-e29b-41d4-a716-446655440000 | 2026-01-07 14:30:00+00     | 2026-01-07 14:30:00+00
```

**API Response** (TaskResponse):
```json
{
  "id": "650e8400-e29b-41d4-a716-446655440001",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-01-07T14:30:00Z",
  "updated_at": "2026-01-07T14:30:00Z"
}
```

**Frontend** (Task interface):
```typescript
const task: Task = {
  id: "650e8400-e29b-41d4-a716-446655440001",
  title: "Buy groceries",
  description: "Milk, eggs, bread",
  completed: false,
  userId: "550e8400-e29b-41d4-a716-446655440000",
  createdAt: new Date("2026-01-07T14:30:00Z"),
  updatedAt: new Date("2026-01-07T14:30:00Z")
}
```

---

**End of Data Model Specification**

**Related Documents**:
- `specs/database/schema.md` - PostgreSQL schema definition
- `specs/api/rest-endpoints.md` - API request/response schemas
- `specs/skills/auth-bridge.md` - JWT token structure
- `specs/ui/components.md` - Frontend component interfaces
- `specs/001-phase-ii-specs/spec.md` - Master specification document
- `specs/001-phase-ii-specs/plan.md` - Implementation plan

**Change Log**:
- 2026-01-07: v1.0.0 - Initial data model for Phase II (User and Task entities)
