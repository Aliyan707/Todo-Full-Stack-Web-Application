"""
Pydantic request models for API endpoints.

These models define and validate the structure of incoming API requests.
"""

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    """
    Request body for user registration (POST /api/auth/register).

    Validates:
    - Email format (must be valid email)
    - Password length (minimum 8 characters)
    """

    email: EmailStr = Field(
        ...,
        description="User's email address (must be valid email format)",
        example="user@example.com",
    )

    password: str = Field(
        ...,
        min_length=8,
        max_length=100,
        description="User's password (minimum 8 characters)",
        example="SecurePass123!",
    )


class LoginRequest(BaseModel):
    """
    Request body for user login (POST /api/auth/login).

    Validates:
    - Email format
    - Password presence (no length validation on login)
    """

    email: EmailStr = Field(
        ...,
        description="Registered email address",
        example="user@example.com",
    )

    password: str = Field(
        ...,
        description="User's password",
        example="SecurePass123!",
    )


class TaskCreateRequest(BaseModel):
    """
    Request body for creating a new task (POST /api/tasks).

    Validates:
    - Title length (1-200 characters)
    - Description is optional
    - Completed defaults to false

    Note: user_id is NOT in request body - it's extracted from JWT token
    """

    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Task title (1-200 characters)",
        example="Buy groceries",
    )

    description: str | None = Field(
        default=None,
        description="Optional detailed description",
        example="Milk, eggs, bread, and coffee",
    )

    completed: bool = Field(
        default=False,
        description="Completion status (defaults to false)",
        example=False,
    )


class TaskUpdateRequest(BaseModel):
    """
    Request body for updating a task (PUT /api/tasks/:id).

    All fields are optional for partial updates.
    Only provided fields will be updated.
    """

    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
        description="Updated task title (1-200 characters)",
        example="Buy groceries (updated)",
    )

    description: str | None = Field(
        default=None,
        description="Updated task description",
        example="Milk, eggs, bread, chicken, rice",
    )

    completed: bool | None = Field(
        default=None,
        description="Updated completion status",
        example=True,
    )
