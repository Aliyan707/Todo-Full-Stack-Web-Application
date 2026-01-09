"""
User model for authentication and profile data.

Represents the users table in PostgreSQL with email-based authentication.
"""

from datetime import datetime
from typing import Optional, TYPE_CHECKING
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.task import Task


class User(SQLModel, table=True):
    """
    User model for authentication.

    Represents a registered user account with email-based credentials.
    One user can have many tasks (1:N relationship).

    Database table: users
    """

    __tablename__ = "users"

    # Primary key
    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        nullable=False,
        description="Unique user identifier (UUID)",
    )

    # Authentication fields
    email: str = Field(
        max_length=255,
        unique=True,
        index=True,
        nullable=False,
        description="User's email address (unique, used for login)",
    )

    password_hash: str = Field(
        max_length=255,
        nullable=False,
        description="Bcrypt hashed password (NEVER store plaintext)",
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Account creation timestamp (UTC)",
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Last update timestamp (UTC, auto-updated via trigger)",
    )

    # Relationships (back-populates with Task model)
    tasks: list["Task"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email})>"
