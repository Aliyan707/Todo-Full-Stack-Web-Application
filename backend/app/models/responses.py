"""
Pydantic response models for API endpoints.

These models define the structure of API responses sent to clients.
They exclude sensitive fields (like password_hash) for security.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class UserResponse(BaseModel):
    """
    Response model for user data (returned by auth endpoints).

    Security:
    - NEVER includes password_hash (sensitive field)
    - Only returns public user information

    Used by:
    - POST /api/auth/register (returns created user)
    - GET /api/auth/me (returns current user)
    - Nested in AuthResponse for login
    """

    id: UUID = Field(
        ...,
        description="User's unique identifier (UUID)",
        example="550e8400-e29b-41d4-a716-446655440000",
    )

    email: str = Field(
        ...,
        description="User's email address",
        example="user@example.com",
    )

    created_at: datetime = Field(
        ...,
        description="Account creation timestamp (ISO 8601)",
        example="2026-01-07T10:30:00Z",
    )

    class Config:
        """Pydantic configuration."""

        from_attributes = True  # Enable ORM mode for SQLModel compatibility


class AuthResponse(BaseModel):
    """
    Response model for authentication (POST /api/auth/login).

    Returns JWT access token and user information.
    Frontend stores access_token in localStorage/sessionStorage.
    Frontend includes token in Authorization: Bearer <token> header for protected requests.

    Token Details:
    - Algorithm: HS256
    - Expiration: 24 hours
    - Payload: {"sub": "<user_id>", "exp": <timestamp>, "iat": <timestamp>}
    """

    access_token: str = Field(
        ...,
        description="JWT access token (include in Authorization: Bearer header)",
        example="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    )

    token_type: str = Field(
        default="bearer",
        description="Token type (always 'bearer' for JWT)",
        example="bearer",
    )

    user: UserResponse = Field(
        ...,
        description="User information for the authenticated user",
    )


class TaskResponse(BaseModel):
    """
    Response model for a single task.

    Used by:
    - POST /api/tasks (returns created task)
    - GET /api/tasks/:id (returns single task)
    - PUT /api/tasks/:id (returns updated task)
    - Nested in TaskListResponse for list endpoint
    """

    id: UUID = Field(
        ...,
        description="Task's unique identifier (UUID)",
        example="650e8400-e29b-41d4-a716-446655440001",
    )

    title: str = Field(
        ...,
        description="Task title",
        example="Buy groceries",
    )

    description: str | None = Field(
        default=None,
        description="Optional task description",
        example="Milk, eggs, bread, and coffee",
    )

    completed: bool = Field(
        ...,
        description="Task completion status",
        example=False,
    )

    user_id: UUID = Field(
        ...,
        description="ID of the user who owns this task",
        example="550e8400-e29b-41d4-a716-446655440000",
    )

    created_at: datetime = Field(
        ...,
        description="Task creation timestamp (ISO 8601)",
        example="2026-01-07T10:30:00Z",
    )

    updated_at: datetime = Field(
        ...,
        description="Task last update timestamp (ISO 8601)",
        example="2026-01-07T14:45:00Z",
    )

    class Config:
        """Pydantic configuration."""

        from_attributes = True  # Enable ORM mode for SQLModel compatibility


class TaskListResponse(BaseModel):
    """
    Response model for task list (GET /api/tasks).

    Includes pagination metadata for frontend to display page controls.
    """

    tasks: list[TaskResponse] = Field(
        ...,
        description="List of tasks (filtered by user_id from JWT)",
    )

    total: int = Field(
        ...,
        description="Total number of tasks matching the query (before pagination)",
        example=42,
    )

    limit: int = Field(
        ...,
        description="Number of tasks per page (from query param)",
        example=10,
    )

    offset: int = Field(
        ...,
        description="Number of tasks skipped (from query param)",
        example=0,
    )


class MessageResponse(BaseModel):
    """
    Generic response model for success/error messages.

    Used by:
    - POST /api/auth/logout (returns success message)
    - DELETE /api/tasks/:id (returns success message)
    """

    message: str = Field(
        ...,
        description="Human-readable message",
        example="Operation successful",
    )
