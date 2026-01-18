from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from uuid import UUID, uuid4
from enum import Enum


class TaskStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"


class TaskPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class SenderType(str, Enum):
    user = "user"
    assistant = "assistant"


class MessageRole(str, Enum):
    user = "user"
    assistant = "assistant"
    system = "system"


class ProcessStatus(str, Enum):
    pending = "pending"
    processed = "processed"
    error = "error"


# Forward declarations for relationships
class TaskBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(max_length=1000)
    status: TaskStatus = Field(default=TaskStatus.pending)
    priority: TaskPriority = Field(default=TaskPriority.medium)
    due_date: Optional[datetime] = None


class Task(TaskBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", nullable=False)

    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    completed_at: Optional[datetime] = None


class Conversation(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", nullable=False)

    title: Optional[str] = Field(max_length=255)
    is_active: bool = Field(default=True, nullable=False)

    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


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