-- Migration: 001_initial_schema
-- Description: Create users and tasks tables with relationships, indexes, and triggers
-- Date: 2026-01-07
-- Database: Neon Serverless PostgreSQL

BEGIN;

-- Enable UUID extension (required for gen_random_uuid())
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create update trigger function (used by both tables)
-- This function automatically updates the updated_at column on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- USERS TABLE
-- ============================================================================

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

-- ============================================================================
-- TASKS TABLE
-- ============================================================================

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
-- idx_tasks_user_id: Essential for user-scoped queries (most common query pattern)
CREATE INDEX idx_tasks_user_id ON tasks(user_id);

-- idx_tasks_user_id_completed: Composite index for filtering completed/incomplete tasks by user
CREATE INDEX idx_tasks_user_id_completed ON tasks(user_id, completed);

-- idx_tasks_created_at: For chronological sorting
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

-- idx_tasks_completed: For filtering all tasks by status (admin/analytics)
CREATE INDEX idx_tasks_completed ON tasks(completed);

-- Create trigger for tasks table
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Tables created: users, tasks
-- Indexes created: 6 (users: 2, tasks: 4)
-- Triggers created: 2 (auto-update updated_at)
-- Foreign keys: 1 (tasks.user_id → users.id with CASCADE)
-- ============================================================================
