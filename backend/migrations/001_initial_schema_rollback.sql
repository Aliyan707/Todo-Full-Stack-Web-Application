-- Rollback Migration: 001_initial_schema
-- Description: Drop users and tasks tables and related objects
-- Date: 2026-01-07
-- Database: Neon Serverless PostgreSQL

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

-- ============================================================================
-- ROLLBACK COMPLETE
-- ============================================================================
-- Tables dropped: users, tasks
-- Triggers dropped: 2
-- Functions dropped: update_updated_at_column
-- ============================================================================
