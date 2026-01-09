# Database Migrations

This directory contains SQL migration scripts for the Neon PostgreSQL database.

## Migration Files

### 001_initial_schema.sql
- **Purpose**: Initial database schema setup
- **Creates**: users and tasks tables with relationships
- **Includes**: Indexes, triggers, foreign keys
- **Date**: 2026-01-07

### 001_initial_schema_rollback.sql
- **Purpose**: Rollback initial schema if needed
- **Drops**: All tables, triggers, and functions created by 001_initial_schema.sql

## Running Migrations

### Prerequisites

1. **Neon PostgreSQL Database**:
   - Sign up at https://neon.tech
   - Create a new project
   - Get your connection string from the dashboard

2. **Set DATABASE_URL**:
   ```bash
   export DATABASE_URL="postgresql://user:pass@host.neon.tech/dbname?sslmode=require"
   ```

### Method 1: Using psql (Manual)

```bash
# Apply forward migration
psql $DATABASE_URL -f migrations/001_initial_schema.sql

# Verify tables created
psql $DATABASE_URL -c "\dt"

# If rollback needed
psql $DATABASE_URL -f migrations/001_initial_schema_rollback.sql
```

### Method 2: Using SQLModel (Automatic)

The application automatically creates tables on startup using `SQLModel.metadata.create_all()`.

```bash
# Just run the application
cd backend
python -m app.main
```

The startup event in `app/main.py` calls `init_db()` which creates all tables defined in SQLModel models.

## Verifying Schema

After running migrations, verify the schema:

```sql
-- List all tables
\dt

-- Describe users table
\d users

-- Describe tasks table
\d tasks

-- List all indexes
\di

-- Test cascade delete
INSERT INTO users (email, password_hash) VALUES ('test@example.com', 'hash');
INSERT INTO tasks (title, user_id) VALUES ('Test Task', (SELECT id FROM users WHERE email = 'test@example.com'));
DELETE FROM users WHERE email = 'test@example.com';
-- Task should be automatically deleted due to CASCADE
```

## Migration Best Practices

1. **Always test migrations** in a development database first
2. **Create rollback scripts** for every forward migration
3. **Use transactions** (BEGIN/COMMIT) for atomicity
4. **Version migrations** sequentially (001, 002, 003, etc.)
5. **Document changes** in migration file comments
6. **Never modify existing migrations** - create new ones instead

## Schema Evolution

When modifying the schema in future:

1. Create new migration file (e.g., `002_add_task_priority.sql`)
2. Create corresponding rollback (e.g., `002_add_task_priority_rollback.sql`)
3. Update SQLModel models to match
4. Test in staging before production
5. Document changes in this README
