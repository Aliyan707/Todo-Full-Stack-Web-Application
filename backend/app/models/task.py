"""
Task model for todo items.

Represents the tasks table in PostgreSQL with user ownership.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

from app.models.user import User


class Task(SQLModel, table=True):
    """
    Task model for todo items.

    Represents a todo task owned by a specific user.
    Many tasks belong to one user (N:1 relationship).

    Database table: tasks
    """

    __tablename__ = "tasks"

    # Primary key
    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        nullable=False,
        description="Unique task identifier (UUID)",
    )

    # Task content
    title: str = Field(
        max_length=200,
        nullable=False,
        description="Task title (1-200 characters)",
    )

    description: Optional[str] = Field(
        default=None,
        nullable=True,
        description="Optional detailed description (no length limit)",
    )

    completed: bool = Field(
        default=False,
        nullable=False,
        description="Completion status (true = done, false = pending)",
    )

    # Foreign key to User (establishes ownership)
    user_id: UUID = Field(
        foreign_key="users.id",
        nullable=False,
        index=True,
        description="Owner's user ID (foreign key to users.id, ON DELETE CASCADE)",
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Task creation timestamp (UTC)",
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Last update timestamp (UTC, auto-updated via trigger)",
    )

    # Relationships (back-populates with User model)
    user: User = Relationship(back_populates="tasks")

    def __repr__(self) -> str:
        return f"<Task(id={self.id}, title={self.title!r}, completed={self.completed})>"
