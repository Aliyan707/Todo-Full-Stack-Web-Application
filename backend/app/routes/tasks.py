"""
Task CRUD API endpoints.

Implements 5 core task management endpoints with JWT authentication and user-scoped queries:
- GET /api/tasks: List tasks with pagination and filtering
- POST /api/tasks: Create a new task
- GET /api/tasks/{task_id}: Get a single task
- PUT /api/tasks/{task_id}: Update a task
- DELETE /api/tasks/{task_id}: Delete a task

All endpoints are protected by JWT authentication and enforce user ownership.
Tasks are automatically scoped to the authenticated user (user_id from JWT token).

Security:
- All endpoints require valid JWT token (Authorization: Bearer header)
- User can only access/modify their own tasks (user_id scoping)
- 403 Forbidden when attempting to access another user's task
- 404 Not Found when task doesn't exist for the authenticated user
"""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, func, select

from app.auth import get_current_user
from app.database import get_session
from app.models.requests import TaskCreateRequest, TaskUpdateRequest
from app.models.responses import MessageResponse, TaskListResponse, TaskResponse
from app.models.task import Task

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.get(
    "",
    response_model=TaskListResponse,
    status_code=status.HTTP_200_OK,
    responses={
        200: {
            "description": "Task list retrieved successfully",
            "model": TaskListResponse,
        },
        401: {
            "description": "Unauthorized - Invalid or missing JWT token",
        },
    },
)
def list_tasks(
    current_user_id: UUID = Depends(get_current_user),
    session: Session = Depends(get_session),
    limit: int = Query(default=10, ge=1, le=100, description="Number of tasks per page"),
    offset: int = Query(default=0, ge=0, description="Number of tasks to skip"),
    completed: Optional[bool] = Query(
        default=None, description="Filter by completion status (true/false/null for all)"
    ),
) -> TaskListResponse:
    """
    List tasks for the authenticated user with pagination and filtering.

    Returns only tasks belonging to the authenticated user (user_id from JWT).
    Supports pagination and filtering by completion status.

    Security:
    - Requires valid JWT token (enforced by get_current_user dependency)
    - Automatically filters tasks by user_id from token (user cannot see other users' tasks)

    Query Parameters:
    - limit (int): Number of tasks per page (1-100, default 10)
    - offset (int): Number of tasks to skip for pagination (default 0)
    - completed (bool|null): Filter by completion status (null returns all tasks)

    Args:
        current_user_id: User ID extracted from JWT (injected by FastAPI)
        session: Database session (injected by FastAPI)
        limit: Maximum number of tasks to return
        offset: Number of tasks to skip (for pagination)
        completed: Optional filter for completion status

    Returns:
        TaskListResponse: List of tasks with pagination metadata (tasks, total, limit, offset)

    Examples:
        GET /api/tasks?limit=10&offset=0&completed=false
        Returns first 10 incomplete tasks for authenticated user
    """
    # Base query: only user's tasks
    statement = select(Task).where(Task.user_id == current_user_id)

    # Apply completed filter if provided
    if completed is not None:
        statement = statement.where(Task.completed == completed)

    # Count total matching tasks (before pagination)
    count_statement = select(func.count()).select_from(statement.subquery())
    total = session.exec(count_statement).one()

    # Apply pagination and ordering
    statement = statement.order_by(Task.created_at.desc()).limit(limit).offset(offset)

    # Execute query
    tasks = session.exec(statement).all()

    # Convert to response models
    task_responses = [TaskResponse.model_validate(task) for task in tasks]

    return TaskListResponse(
        tasks=task_responses,
        total=total,
        limit=limit,
        offset=offset,
    )


@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {
            "description": "Task created successfully",
            "model": TaskResponse,
        },
        400: {
            "description": "Bad Request - Invalid input data",
        },
        401: {
            "description": "Unauthorized - Invalid or missing JWT token",
        },
        422: {
            "description": "Unprocessable Entity - Validation error",
        },
    },
)
def create_task(
    request: TaskCreateRequest,
    current_user_id: UUID = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> TaskResponse:
    """
    Create a new task for the authenticated user.

    The user_id is automatically extracted from the JWT token, NOT from the request body.
    This ensures users can only create tasks for themselves (security by design).

    Security:
    - Requires valid JWT token (enforced by get_current_user dependency)
    - user_id set from JWT token (cannot be spoofed in request body)
    - Input validation via Pydantic (title length, etc.)

    Request Body:
    - title (str): Task title (1-200 characters, required)
    - description (str|null): Optional task description
    - completed (bool): Completion status (defaults to false)

    Args:
        request: TaskCreateRequest with task data
        current_user_id: User ID extracted from JWT (injected by FastAPI)
        session: Database session (injected by FastAPI)

    Returns:
        TaskResponse: Created task with all fields (including generated id, timestamps)

    Raises:
        HTTPException(422): Validation error (title too long, invalid data)
    """
    # Create task with user_id from JWT token
    task = Task(
        title=request.title,
        description=request.description,
        completed=request.completed,
        user_id=current_user_id,  # Set from JWT token, not request body
    )

    # Save to database
    session.add(task)
    session.commit()
    session.refresh(task)

    return TaskResponse.model_validate(task)


@router.get(
    "/{task_id}",
    response_model=TaskResponse,
    status_code=status.HTTP_200_OK,
    responses={
        200: {
            "description": "Task retrieved successfully",
            "model": TaskResponse,
        },
        401: {
            "description": "Unauthorized - Invalid or missing JWT token",
        },
        403: {
            "description": "Forbidden - Task belongs to another user",
            "content": {
                "application/json": {
                    "example": {"detail": "Access denied: task belongs to another user"}
                }
            },
        },
        404: {
            "description": "Not Found - Task does not exist",
            "content": {
                "application/json": {"example": {"detail": "Task not found"}}
            },
        },
    },
)
def get_task(
    task_id: UUID,
    current_user_id: UUID = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> TaskResponse:
    """
    Get a single task by ID.

    Returns the task only if it belongs to the authenticated user.
    Returns 404 if task doesn't exist or 403 if it belongs to another user.

    Security:
    - Requires valid JWT token (enforced by get_current_user dependency)
    - Ownership check: task.user_id must match current_user_id from JWT
    - 403 Forbidden if user tries to access another user's task

    Path Parameters:
    - task_id (UUID): Task ID to retrieve

    Args:
        task_id: UUID of the task to retrieve
        current_user_id: User ID extracted from JWT (injected by FastAPI)
        session: Database session (injected by FastAPI)

    Returns:
        TaskResponse: Task data if found and owned by user

    Raises:
        HTTPException(404): Task not found
        HTTPException(403): Task belongs to another user
    """
    # Fetch task from database
    statement = select(Task).where(Task.id == task_id)
    task = session.exec(statement).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Check ownership
    if task.user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: task belongs to another user",
        )

    return TaskResponse.model_validate(task)


@router.put(
    "/{task_id}",
    response_model=TaskResponse,
    status_code=status.HTTP_200_OK,
    responses={
        200: {
            "description": "Task updated successfully",
            "model": TaskResponse,
        },
        400: {
            "description": "Bad Request - Invalid input data",
        },
        401: {
            "description": "Unauthorized - Invalid or missing JWT token",
        },
        403: {
            "description": "Forbidden - Task belongs to another user",
        },
        404: {
            "description": "Not Found - Task does not exist",
        },
        422: {
            "description": "Unprocessable Entity - Validation error",
        },
    },
)
def update_task(
    task_id: UUID,
    request: TaskUpdateRequest,
    current_user_id: UUID = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> TaskResponse:
    """
    Update a task by ID (partial updates supported).

    Only provided fields will be updated (PATCH-style partial updates).
    Task must belong to the authenticated user.

    Security:
    - Requires valid JWT token (enforced by get_current_user dependency)
    - Ownership check: task.user_id must match current_user_id from JWT
    - user_id cannot be changed (immutable field)

    Path Parameters:
    - task_id (UUID): Task ID to update

    Request Body (all fields optional):
    - title (str|null): Updated task title (1-200 characters)
    - description (str|null): Updated task description
    - completed (bool|null): Updated completion status

    Args:
        task_id: UUID of the task to update
        request: TaskUpdateRequest with fields to update
        current_user_id: User ID extracted from JWT (injected by FastAPI)
        session: Database session (injected by FastAPI)

    Returns:
        TaskResponse: Updated task with all fields

    Raises:
        HTTPException(404): Task not found
        HTTPException(403): Task belongs to another user
        HTTPException(422): Validation error (title too long, etc.)
    """
    # Fetch task from database
    statement = select(Task).where(Task.id == task_id)
    task = session.exec(statement).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Check ownership
    if task.user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: task belongs to another user",
        )

    # Update only provided fields (partial update)
    if request.title is not None:
        task.title = request.title

    if request.description is not None:
        task.description = request.description

    if request.completed is not None:
        task.completed = request.completed

    # Save changes (updated_at will be auto-updated by PostgreSQL trigger)
    session.add(task)
    session.commit()
    session.refresh(task)

    return TaskResponse.model_validate(task)


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        204: {
            "description": "Task deleted successfully (no content returned)",
        },
        401: {
            "description": "Unauthorized - Invalid or missing JWT token",
        },
        403: {
            "description": "Forbidden - Task belongs to another user",
        },
        404: {
            "description": "Not Found - Task does not exist",
        },
    },
)
def delete_task(
    task_id: UUID,
    current_user_id: UUID = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> None:
    """
    Delete a task by ID.

    Task must belong to the authenticated user.
    Returns 204 No Content on success (no response body).

    Security:
    - Requires valid JWT token (enforced by get_current_user dependency)
    - Ownership check: task.user_id must match current_user_id from JWT
    - 403 Forbidden if user tries to delete another user's task

    Path Parameters:
    - task_id (UUID): Task ID to delete

    Args:
        task_id: UUID of the task to delete
        current_user_id: User ID extracted from JWT (injected by FastAPI)
        session: Database session (injected by FastAPI)

    Returns:
        None: 204 No Content response (no body)

    Raises:
        HTTPException(404): Task not found
        HTTPException(403): Task belongs to another user
    """
    # Fetch task from database
    statement = select(Task).where(Task.id == task_id)
    task = session.exec(statement).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Check ownership
    if task.user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: task belongs to another user",
        )

    # Delete task
    session.delete(task)
    session.commit()

    # Return 204 No Content (no response body)
    return None
