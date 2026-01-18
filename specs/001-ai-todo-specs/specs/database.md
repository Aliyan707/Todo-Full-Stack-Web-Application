# Database Schema Specification: AI-Powered Todo Interface

**Created**: 2026-01-17
**Feature**: AI-Powered Natural Language Todo Interface
**Branch**: 001-ai-todo-specs

## Overview

This specification defines the SQLModel schemas for the core data entities required for the AI-powered todo interface: Task, Conversation, and Message. All data must persist in Neon PostgreSQL as per the stateless architecture requirement.

## Entity Specifications

### Task Entity

**Purpose**: Represents a user's todo item with natural language processing capabilities

**Fields**:
- `id`: UUID (Primary Key) - Unique identifier for the task
- `user_id`: UUID (Foreign Key) - Links to the user who owns the task
- `title`: String (255 characters max) - The title of the task
- `description`: Text (optional) - Detailed description of the task
- `status`: Enum (pending, in_progress, completed) - Current status of the task
- `priority`: Enum (low, medium, high) - Priority level of the task
- `due_date`: DateTime (optional) - When the task is due
- `created_at`: DateTime - Timestamp when the task was created
- `updated_at`: DateTime - Timestamp when the task was last updated
- `completed_at`: DateTime (optional) - Timestamp when the task was completed

**Constraints**:
- Title must be 1-255 characters
- User ID must reference a valid user
- Status must be one of the allowed enum values
- Due date cannot be in the past (validation rule)

**Indexes**:
- Index on user_id for efficient user-based queries
- Index on status for filtering by completion status
- Composite index on user_id and status for combined queries

### Conversation Entity

**Purpose**: Represents a conversation thread between a user and the AI assistant

**Fields**:
- `id`: UUID (Primary Key) - Unique identifier for the conversation
- `user_id`: UUID (Foreign Key) - Links to the user who initiated the conversation
- `title`: String (255 characters max) - Auto-generated or user-defined title
- `created_at`: DateTime - Timestamp when the conversation started
- `updated_at`: DateTime - Timestamp when the conversation was last updated
- `is_active`: Boolean - Whether the conversation is currently active

**Constraints**:
- User ID must reference a valid user
- Title must be 1-255 characters if provided
- Created_at must be before updated_at

**Indexes**:
- Index on user_id for efficient user-based queries
- Index on is_active for filtering active conversations

### Message Entity

**Purpose**: Represents individual messages within a conversation between user and AI

**Fields**:
- `id`: UUID (Primary Key) - Unique identifier for the message
- `conversation_id`: UUID (Foreign Key) - Links to the conversation this message belongs to
- `sender_type`: Enum (user, assistant) - Identifies who sent the message
- `sender_id`: UUID (optional) - Links to the actual user or system identifier
- `content`: Text - The content of the message
- `role`: Enum (user, assistant, system) - Role in the conversation context
- `created_at`: DateTime - Timestamp when the message was sent
- `processed_status`: Enum (pending, processed, error) - Processing status of the message
- `natural_language_intent`: String (optional) - Parsed intent from natural language processing

**Constraints**:
- Conversation ID must reference a valid conversation
- Sender type must be one of the allowed enum values
- Content must not be empty
- Role must be one of the allowed enum values

**Indexes**:
- Index on conversation_id for efficient conversation-based queries
- Index on created_at for chronological ordering
- Composite index on conversation_id and created_at for ordered retrieval

## Relationships

- User (1) : (Many) Task - One user can have many tasks
- User (1) : (Many) Conversation - One user can have many conversations
- Conversation (1) : (Many) Message - One conversation can have many messages

## Data Access Patterns

1. **User Task Retrieval**: Query tasks filtered by user_id with optional status filtering
2. **Conversation History**: Retrieve conversations for a user ordered by last activity
3. **Message Thread**: Retrieve messages in a conversation ordered chronologically
4. **Natural Language Processing**: Access messages for intent analysis and task extraction

## Security Considerations

- All data access must be filtered by user_id to ensure data isolation
- Foreign key constraints must be enforced at the database level
- No direct access to other users' data is allowed through these schemas