# Database Schema Specification: Phase II PostgreSQL

**Version**: 1.0.0
**Database**: Neon Serverless PostgreSQL
**Created**: 2026-01-07
**Related Feature**: `001-phase-ii-specs`

---

## Overview

This document defines the complete database schema for the Phase II Todo Application, including user authentication and task management. The schema establishes a 1:N relationship between users and tasks, with proper constraints, indexes, and PostgreSQL-specific optimizations for the Neon Serverless environment.

**Design Principles**:
- **Data Integrity**: Foreign keys, NOT NULL constraints, and cascading deletes ensure referential integrity
- **Performance**: Indexes on frequently queried columns (user_id, email, created_at, completed)
- **Security**: Password storage uses hashed values only (never plaintext)
- **Scalability**: UUID primary keys support distributed architecture and avoid collision risks
- **Auditability**: Timestamps (created_at, updated_at) track all data lifecycle events

---

## Tables

### 1. `users` Table

Stores authenticated user accounts with email-based credentials.

#### Schema Definition

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

#### Column Specifications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for the user. Auto-generated UUID prevents collision in distributed systems. |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | User's email address. Used for login and must be unique across all users. |
| `password_hash` | VARCHAR(255) | NOT NULL | Hashed password using bcrypt or argon2. Never stores plaintext passwords. |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT CURRENT_TIMESTAMP | When the user account was created. Immutable after creation. |
| `updated_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT CURRENT_TIMESTAMP | When the user account was last modified. Updated automatically via trigger. |

#### Indexes

```sql
-- Unique index on email (enforces constraint + speeds up login queries)
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Index on created_at for user registration analytics
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

#### Triggers

```sql
-- Automatically update updated_at timestamp on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Validation Rules

- **Email Format**: Must match standard email regex pattern (enforced at application layer via Pydantic/TypeScript validation)
- **Password Hash**: Must be generated using bcrypt with minimum cost factor 12 or argon2id (enforced at application layer)
- **Email Case**: Stored in lowercase to ensure case-insensitive uniqueness (normalized at application layer before insert)

#### Sample Data

```sql
-- Example user record (for testing/documentation only)
INSERT INTO users (id, email, password_hash) VALUES
(
    '550e8400-e29b-41d4-a716-446655440000',
    'user@example.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lw5qN0zZ4yH8P0Q5G'  -- bcrypt hash of 'password123'
);
```

---

### 2. `tasks` Table

Stores todo tasks owned by individual users.

#### Schema Definition

```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

#### Column Specifications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for the task. Auto-generated UUID. |
| `title` | VARCHAR(200) | NOT NULL | Task title. Limited to 200 characters for user-visible task names. |
| `description` | TEXT | NULLABLE | Optional detailed description of the task. No length limit. |
| `completed` | BOOLEAN | NOT NULL, DEFAULT FALSE | Completion status. True if task is done, false if pending. |
| `user_id` | UUID | NOT NULL, FOREIGN KEY | References users.id. Establishes task ownership. CASCADE delete when user deleted. |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT CURRENT_TIMESTAMP | When the task was created. Immutable. |
| `updated_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT CURRENT_TIMESTAMP | When the task was last modified. Updated automatically via trigger. |

#### Foreign Keys

```sql
-- Foreign key constraint with cascading delete
ALTER TABLE tasks
ADD CONSTRAINT fk_tasks_user_id
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;
```

**Cascading Delete Behavior**: When a user is deleted, ALL of their tasks are automatically deleted. This ensures no orphaned tasks exist in the database.

#### Indexes

```sql
-- Index on user_id for efficient user-scoped queries (most common query pattern)
CREATE INDEX idx_tasks_user_id ON tasks(user_id);

-- Composite index for filtering completed tasks by user
CREATE INDEX idx_tasks_user_id_completed ON tasks(user_id, completed);

-- Index on created_at for chronological sorting
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

-- Index on completed for filtering all tasks by status (admin/analytics)
CREATE INDEX idx_tasks_completed ON tasks(completed);
```

#### Triggers

```sql
-- Automatically update updated_at timestamp on row modification
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Validation Rules

- **Title Length**: Must be 1-200 characters (enforced at application layer AND database constraint)
- **Description**: Optional, no length limit (NULL allowed)
- **User ID**: Must reference an existing user (enforced by foreign key constraint)
- **Completed**: Must be boolean (true/false), defaults to false

#### Sample Data

```sql
-- Example task records (for testing/documentation only)
INSERT INTO tasks (id, title, description, completed, user_id) VALUES
(
    '650e8400-e29b-41d4-a716-446655440001',
    'Buy groceries',
    'Milk, eggs, bread, and coffee',
    FALSE,
    '550e8400-e29b-41d4-a716-446655440000'  -- References user above
),
(
    '650e8400-e29b-41d4-a716-446655440002',
    'Finish project report',
    NULL,  -- No description
    TRUE,
    '550e8400-e29b-41d4-a716-446655440000'
);
```

---

## Relationships

### User-Task Relationship (1:N)

```
┌─────────────┐         ┌──────────────┐
│    users    │         │    tasks     │
├─────────────┤         ├──────────────┤
│ id (PK)     │◄───────┤│ id (PK)      │
│ email       │    1:N  │ title        │
│ password_   │         │ description  │
│  _hash      │         │ completed    │
│ created_at  │         │ user_id (FK) │
│ updated_at  │         │ created_at   │
└─────────────┘         │ updated_at   │
                        └──────────────┘
```

**Cardinality**: One user can have many tasks (1:N). A task belongs to exactly one user.

**Constraints**:
- `tasks.user_id` MUST reference a valid `users.id` (enforced by foreign key)
- Deleting a user cascades to delete all their tasks (ON DELETE CASCADE)
- Tasks cannot exist without an owning user (user_id NOT NULL)

---

## Migration Strategy

### Initial Schema Creation (Migration 001)

**File**: `migrations/001_initial_schema.sql`

```sql
-- Migration: 001_initial_schema
-- Description: Create users and tasks tables with relationships
-- Date: 2026-01-07

BEGIN;

-- Enable UUID extension (required for gen_random_uuid())
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create update trigger function (used by both tables)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for users table
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_tasks_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for tasks table
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_user_id_completed ON tasks(user_id, completed);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX idx_tasks_completed ON tasks(completed);

-- Create trigger for tasks table
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
```

### Rollback Script (Migration 001 Rollback)

**File**: `migrations/001_initial_schema_rollback.sql`

```sql
-- Rollback Migration: 001_initial_schema
-- Description: Drop users and tasks tables and related objects
-- Date: 2026-01-07

BEGIN;

-- Drop triggers
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Drop tables (CASCADE drops foreign key constraints)
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop trigger function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Note: We do NOT drop the pgcrypto extension as it may be used by other schemas

COMMIT;
```

### Applying Migrations to Neon Serverless PostgreSQL

#### Prerequisites

1. **Neon Account**: Create account at https://neon.tech
2. **Database Connection String**: Obtain from Neon dashboard
   ```
   postgresql://[user]:[password]@[host]/[dbname]?sslmode=require
   ```
3. **Migration Tool**: Use `psql`, `SQLModel.metadata.create_all()`, or migration tool like Alembic

#### Manual Application (psql)

```bash
# Set environment variable
export DATABASE_URL="postgresql://user:pass@ep-xyz.neon.tech/dbname?sslmode=require"

# Apply forward migration
psql $DATABASE_URL -f migrations/001_initial_schema.sql

# Verify tables created
psql $DATABASE_URL -c "\dt"

# If rollback needed
psql $DATABASE_URL -f migrations/001_initial_schema_rollback.sql
```

#### Application-Managed (SQLModel)

```python
# backend/app/database.py
from sqlmodel import SQLModel, create_engine
import os

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL, echo=True)

def init_db():
    """Create all tables defined in SQLModel models."""
    SQLModel.metadata.create_all(engine)
    print("Database initialized successfully")
```

**Note**: SQLModel will automatically create tables based on model definitions. Ensure models match this schema specification exactly.

---

## Query Patterns and Performance

### Common Queries

#### 1. List All Tasks for a User (Most Common)

```sql
-- Get all tasks for user, ordered by creation date (newest first)
SELECT id, title, description, completed, created_at, updated_at
FROM tasks
WHERE user_id = $1
ORDER BY created_at DESC;
```

**Performance**: Uses `idx_tasks_user_id` index. Expected ~1-5ms for typical user with <1000 tasks.

#### 2. List Incomplete Tasks for a User

```sql
-- Get only incomplete tasks
SELECT id, title, description, created_at, updated_at
FROM tasks
WHERE user_id = $1 AND completed = FALSE
ORDER BY created_at DESC;
```

**Performance**: Uses `idx_tasks_user_id_completed` composite index for optimal filtering.

#### 3. Get Single Task (with User Verification)

```sql
-- Get task by ID, ensuring it belongs to the user
SELECT id, title, description, completed, created_at, updated_at
FROM tasks
WHERE id = $1 AND user_id = $2;
```

**Performance**: Primary key lookup + user_id filter. Expected <1ms.

#### 4. User Login (Email Lookup)

```sql
-- Find user by email for authentication
SELECT id, email, password_hash
FROM users
WHERE email = $1;
```

**Performance**: Uses `idx_users_email` unique index. Expected <1ms.

### Index Usage Analysis

| Query Pattern | Index Used | Estimated Rows | Expected Time |
|---------------|------------|----------------|---------------|
| List user's tasks | idx_tasks_user_id | 10-1000 | 1-5ms |
| List incomplete tasks | idx_tasks_user_id_completed | 5-500 | 1-3ms |
| Get task by ID | Primary key (id) | 1 | <1ms |
| User login | idx_users_email | 1 | <1ms |
| List recent tasks (global) | idx_tasks_created_at | 1000+ | 5-20ms |

### Connection Pooling for Neon Serverless

Neon Serverless supports connection pooling via PgBouncer. Configuration:

```python
# Recommended connection string format
DATABASE_URL = "postgresql://user:pass@host/db?sslmode=require&pool_timeout=10&connect_timeout=10"

# SQLModel engine configuration
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Set to True for debugging
    pool_size=5,  # Number of persistent connections
    max_overflow=10,  # Additional connections when pool exhausted
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=3600  # Recycle connections after 1 hour
)
```

---

## Data Integrity Rules

### Constraints Summary

| Table | Constraint Type | Column(s) | Rule |
|-------|----------------|-----------|------|
| users | PRIMARY KEY | id | Must be unique UUID |
| users | UNIQUE | email | No duplicate emails |
| users | NOT NULL | email, password_hash, created_at, updated_at | Required fields |
| tasks | PRIMARY KEY | id | Must be unique UUID |
| tasks | FOREIGN KEY | user_id | Must reference valid users.id |
| tasks | NOT NULL | title, completed, user_id, created_at, updated_at | Required fields |
| tasks | CHECK (implicit) | completed | Must be TRUE or FALSE |
| tasks | ON DELETE CASCADE | user_id | Delete tasks when user deleted |

### Referential Integrity

- **Orphaned Tasks Prevention**: Foreign key constraint ensures tasks always belong to an existing user
- **Cascading Deletes**: When a user is deleted, all their tasks are automatically removed
- **User Deletion Safety**: Application layer should confirm user deletion intent before executing (irreversible)

### Data Validation Layers

1. **Database Layer** (this spec):
   - Primary keys, foreign keys, NOT NULL constraints
   - Data type enforcement (UUID, VARCHAR, BOOLEAN, TIMESTAMP)
   - Default values (gen_random_uuid(), CURRENT_TIMESTAMP, FALSE)

2. **Application Layer** (backend - FastAPI/SQLModel):
   - Email format validation (regex pattern)
   - Password strength validation (minimum length, complexity)
   - Title length validation (1-200 characters)
   - User authorization (user can only access their own tasks)

3. **Frontend Layer** (Next.js/TypeScript):
   - Real-time input validation (email format, password strength)
   - Character count for title (200 max)
   - Form submission validation before API call

---

## Security Considerations

### Password Storage

**CRITICAL**: Passwords MUST NEVER be stored in plaintext.

**Recommended Algorithms** (in order of preference):

1. **Argon2id** (best): Memory-hard, resistant to GPU/ASIC attacks
   ```python
   from passlib.hash import argon2
   hashed = argon2.hash("user_password")
   ```

2. **bcrypt** (good): Widely supported, industry standard
   ```python
   from passlib.hash import bcrypt
   hashed = bcrypt.hash("user_password", rounds=12)  # Min cost factor 12
   ```

**Storage Format**: Hash output is ~60-100 characters. VARCHAR(255) provides safe buffer.

### User ID Exposure

- **UUIDs are public**: Unlike auto-incrementing integers, UUIDs can be exposed in URLs/APIs without leaking user count
- **Still enforce authorization**: Even with UUIDs, always verify user_id from JWT token matches resource owner

### SQL Injection Prevention

- **Parameterized Queries**: ALWAYS use query parameters (never string concatenation)
  ```python
  # GOOD: Parameterized query
  session.exec(select(Task).where(Task.user_id == user_id))

  # BAD: String concatenation (vulnerable to SQL injection)
  session.exec(f"SELECT * FROM tasks WHERE user_id = '{user_id}'")  # NEVER DO THIS
  ```

- **SQLModel/SQLAlchemy ORM**: Automatically uses parameterized queries when used correctly

### Data Access Control

- **Row-Level Security (Optional)**: PostgreSQL supports RLS policies for additional enforcement
  ```sql
  -- Example: Enforce user_id filtering at database level
  ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

  CREATE POLICY user_tasks_policy ON tasks
    USING (user_id = current_setting('app.current_user_id')::UUID);
  ```

  **Note**: This is optional. Application-layer filtering (in FastAPI) is the primary enforcement mechanism.

---

## Maintenance and Operations

### Backup Strategy

**Neon Serverless** provides automatic backups:
- Point-in-time recovery (PITR) up to 7 days (default)
- Automatic daily backups retained based on plan
- Manual backups via Neon dashboard or API

**Recommended Practices**:
1. Enable PITR for production databases
2. Test restore procedures quarterly
3. Export critical user data to external backup (weekly)

### Monitoring Queries

```sql
-- Check table sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan AS index_scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Check slow queries (if pg_stat_statements enabled)
SELECT
    query,
    calls,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
WHERE query LIKE '%tasks%' OR query LIKE '%users%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Schema Evolution

When modifying the schema in future iterations:

1. **Create Versioned Migration**: e.g., `002_add_task_priority.sql`
2. **Include Rollback Script**: e.g., `002_add_task_priority_rollback.sql`
3. **Test Migration**: Apply to staging environment first
4. **Document Changes**: Update this spec document with new schema
5. **Apply to Production**: Use transaction (BEGIN/COMMIT) for atomicity

**Example Future Migration** (adding task priority):

```sql
-- Migration: 002_add_task_priority
BEGIN;

ALTER TABLE tasks ADD COLUMN priority VARCHAR(10) DEFAULT 'medium' NOT NULL;
ALTER TABLE tasks ADD CONSTRAINT check_priority CHECK (priority IN ('low', 'medium', 'high'));
CREATE INDEX idx_tasks_priority ON tasks(priority);

COMMIT;

-- Rollback: 002_add_task_priority_rollback
BEGIN;

DROP INDEX IF EXISTS idx_tasks_priority;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS check_priority;
ALTER TABLE tasks DROP COLUMN IF EXISTS priority;

COMMIT;
```

---

## Appendix: Complete Schema DDL

```sql
-- Complete Phase II Database Schema
-- Version: 1.0.0
-- Date: 2026-01-07

BEGIN;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create trigger function for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_tasks_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_user_id_completed ON tasks(user_id, completed);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX idx_tasks_completed ON tasks(completed);

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
```

---

**End of Database Schema Specification**

**Related Documents**:
- `specs/api/rest-endpoints.md` - REST API specification (uses this schema)
- `specs/skills/auth-bridge.md` - JWT authentication (validates against users table)
- `specs/ui/components.md` - Frontend components (display data from this schema)
- `specs/001-phase-ii-specs/spec.md` - Master specification document

**Change Log**:
- 2026-01-07: v1.0.0 - Initial schema for Phase II (users + tasks tables)
