# Data Model: AI-Powered Natural Language Todo Interface

## Overview
This document defines the data models for the AI-powered todo interface, including entity relationships, validation rules, and state transitions.

## Entity Models

### Task Entity
**Purpose**: Represents a user's todo item with natural language processing capabilities

```python
class Task(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", nullable=False)

    title: str = Field(min_length=1, max_length=255, nullable=False)
    description: Optional[str] = Field(max_length=1000)
    status: TaskStatus = Field(default=TaskStatus.pending, nullable=False)
    priority: TaskPriority = Field(default=TaskPriority.medium, nullable=False)
    due_date: Optional[datetime] = None

    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    completed_at: Optional[datetime] = None
```

**Validation Rules**:
- Title must be 1-255 characters
- User ID must reference a valid user
- Status must be one of: pending, in_progress, completed
- Priority must be one of: low, medium, high
- Due date cannot be in the past (business logic validation)

**State Transitions**:
- pending → in_progress (when user starts working on task)
- in_progress → pending (when user pauses task)
- pending → completed (when user marks as complete)
- in_progress → completed (when user finishes task)
- completed → pending (when user reopens task)

### Conversation Entity
**Purpose**: Represents a conversation thread between a user and the AI assistant

```python
class Conversation(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", nullable=False)

    title: str = Field(max_length=255, nullable=True)
    is_active: bool = Field(default=True, nullable=False)

    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
```

**Validation Rules**:
- User ID must reference a valid user
- Title must be 1-255 characters if provided
- Created_at must be before updated_at

**State Transitions**:
- active → inactive (when conversation is archived)
- inactive → active (when conversation is reopened)

### Message Entity
**Purpose**: Represents individual messages within a conversation between user and AI

```python
class Message(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    conversation_id: UUID = Field(foreign_key="conversation.id", nullable=False)

    sender_type: SenderType = Field(nullable=False)  # "user" or "assistant"
    sender_id: Optional[UUID] = Field(foreign_key="user.id")  # NULL for assistant messages
    role: MessageRole = Field(nullable=False)  # "user", "assistant", or "system"
    content: str = Field(nullable=False)
    processed_status: ProcessStatus = Field(default=ProcessStatus.pending, nullable=False)
    natural_language_intent: Optional[str] = Field(max_length=100)

    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
```

**Validation Rules**:
- Conversation ID must reference a valid conversation
- Sender type must be one of: user, assistant
- Content must not be empty
- Role must be one of: user, assistant, system
- Processed status must be one of: pending, processed, error

### User Entity (Referenced)
**Purpose**: Represents an authenticated user in the system

```python
class User(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
```

## Relationships

### One-to-Many Relationships
- User (1) : (Many) Task - One user can have many tasks
- User (1) : (Many) Conversation - One user can have many conversations
- Conversation (1) : (Many) Message - One conversation can have many messages

### Foreign Key Constraints
- Task.user_id → User.id
- Conversation.user_id → User.id
- Message.conversation_id → Conversation.id
- Message.sender_id → User.id (nullable)

## Database Indexes

### Task Indexes
- `idx_task_user_id`: Index on user_id for efficient user-based queries
- `idx_task_status`: Index on status for filtering by completion status
- `idx_task_user_status`: Composite index on user_id and status for combined queries
- `idx_task_due_date`: Index on due_date for date-based queries

### Conversation Indexes
- `idx_conversation_user_id`: Index on user_id for efficient user-based queries
- `idx_conversation_is_active`: Index on is_active for filtering active conversations

### Message Indexes
- `idx_message_conversation_id`: Index on conversation_id for efficient conversation-based queries
- `idx_message_created_at`: Index on created_at for chronological ordering
- `idx_message_conv_created`: Composite index on conversation_id and created_at for ordered retrieval

## Access Patterns

### User Task Retrieval
**Query**: SELECT * FROM task WHERE user_id = ? AND [status_filter]
**Frequency**: High - Primary user interaction
**Optimization**: User ID index with optional status filter

### Conversation History
**Query**: SELECT * FROM conversation WHERE user_id = ? ORDER BY updated_at DESC
**Frequency**: Medium - Navigation between conversations
**Optimization**: User ID index with date ordering

### Message Thread
**Query**: SELECT * FROM message WHERE conversation_id = ? ORDER BY created_at ASC
**Frequency**: High - Conversation display
**Optimization**: Conversation ID index with chronological ordering

### Natural Language Processing
**Query**: SELECT * FROM message WHERE conversation_id = ? AND created_at > ? ORDER BY created_at DESC LIMIT ?
**Frequency**: Medium - AI context building
**Optimization**: Composite index on conversation_id and created_at

## Security Considerations

### Data Isolation
- All queries must be filtered by user_id to ensure data isolation
- Foreign key constraints enforced at database level
- No direct access to other users' data through these models

### Validation
- All user inputs validated at application layer before database insertion
- Field-level constraints enforced by SQLModel
- Business logic validation applied during operations

### Audit Trail
- Created_at and updated_at timestamps on all entities
- Message entity tracks all conversation history
- Immutable records for audit purposes

## Performance Guidelines

### Query Optimization
- Use indexes appropriately for common query patterns
- Limit result sets with pagination where appropriate
- Avoid N+1 query problems with proper JOIN usage

### Storage Efficiency
- Appropriate data types for each field
- Nullable fields where appropriate to save space
- Proper indexing without over-indexing

## Migration Considerations

### Schema Evolution
- Use Alembic for controlled schema changes
- Backward-compatible changes preferred
- Data migration scripts for structural changes