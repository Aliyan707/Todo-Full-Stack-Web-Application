from fastapi import APIRouter, HTTPException, Header
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import datetime

router = APIRouter()


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None


class TaskResponse(BaseModel):
    id: str
    userId: str
    title: str
    description: Optional[str]
    isCompleted: bool
    completedAt: Optional[str]
    createdAt: str
    updatedAt: str


# Simple in-memory task storage for demo purposes
# In production, this would be in a database
tasks_db = {}


def format_task_response(task: dict) -> dict:
    """Format task data to match frontend expectations (camelCase)"""
    return {
        "id": task["id"],
        "userId": task["user_id"],
        "title": task["title"],
        "description": task.get("description"),
        "isCompleted": task["is_completed"],
        "completedAt": task.get("completed_at"),
        "createdAt": task["created_at"],
        "updatedAt": task["updated_at"]
    }


def get_user_id_from_token(authorization: Optional[str]) -> str:
    """Extract user ID from authorization token (demo implementation)"""
    if not authorization:
        # For demo purposes, return a default user ID
        return "demo-user-123"

    # In a real implementation, you would verify the JWT token
    # For demo, we just extract the token and use it as a simple session ID
    token = authorization.replace("Bearer ", "")
    return f"user-{token[:8]}"  # Simple demo user ID from token


@router.get("/tasks")
async def get_tasks(
    authorization: Optional[str] = Header(None),
    completed: Optional[bool] = None,
    limit: int = 500,
    offset: int = 0,
    sort: str = "createdAt:desc"
):
    """Get all tasks for the authenticated user"""
    try:
        user_id = get_user_id_from_token(authorization)

        # Filter tasks by user
        user_tasks = [task for task in tasks_db.values() if task["user_id"] == user_id]

        # Filter by completion status if specified
        if completed is not None:
            user_tasks = [task for task in user_tasks if task["is_completed"] == completed]

        # Sort tasks
        reverse = sort.endswith(":desc")
        sort_field = sort.split(":")[0]

        if sort_field == "createdAt":
            user_tasks.sort(key=lambda x: x["created_at"], reverse=reverse)
        elif sort_field == "updatedAt":
            user_tasks.sort(key=lambda x: x["updated_at"], reverse=reverse)

        # Apply pagination
        total = len(user_tasks)
        user_tasks = user_tasks[offset:offset + limit]

        # Format response
        formatted_tasks = [format_task_response(task) for task in user_tasks]

        return {
            "tasks": formatted_tasks,
            "total": total
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": "Failed to fetch tasks", "detail": str(e)}
        )


@router.post("/tasks")
async def create_task(
    task_data: TaskCreate,
    authorization: Optional[str] = Header(None)
):
    """Create a new task"""
    try:
        user_id = get_user_id_from_token(authorization)

        # Validate title
        if not task_data.title or len(task_data.title.strip()) == 0:
            return JSONResponse(
                status_code=400,
                content={"error": "Title is required"}
            )

        if len(task_data.title) > 200:
            return JSONResponse(
                status_code=400,
                content={"error": "Title must be 200 characters or less"}
            )

        # Create new task
        task_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()

        task = {
            "id": task_id,
            "user_id": user_id,
            "title": task_data.title.strip(),
            "description": task_data.description.strip() if task_data.description else None,
            "is_completed": False,
            "completed_at": None,
            "created_at": now,
            "updated_at": now
        }

        tasks_db[task_id] = task

        return format_task_response(task)
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": "Failed to create task", "detail": str(e)}
        )


@router.get("/tasks/{task_id}")
async def get_task(
    task_id: str,
    authorization: Optional[str] = Header(None)
):
    """Get a single task by ID"""
    try:
        user_id = get_user_id_from_token(authorization)

        task = tasks_db.get(task_id)

        if not task:
            return JSONResponse(
                status_code=404,
                content={"error": "Task not found"}
            )

        # Verify task belongs to user
        if task["user_id"] != user_id:
            return JSONResponse(
                status_code=403,
                content={"error": "Access denied"}
            )

        return format_task_response(task)
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": "Failed to fetch task", "detail": str(e)}
        )


@router.put("/tasks/{task_id}")
async def update_task(
    task_id: str,
    updates: TaskUpdate,
    authorization: Optional[str] = Header(None)
):
    """Update an existing task"""
    try:
        user_id = get_user_id_from_token(authorization)

        task = tasks_db.get(task_id)

        if not task:
            return JSONResponse(
                status_code=404,
                content={"error": "Task not found"}
            )

        # Verify task belongs to user
        if task["user_id"] != user_id:
            return JSONResponse(
                status_code=403,
                content={"error": "Access denied"}
            )

        # Update fields
        if updates.title is not None:
            if len(updates.title.strip()) == 0:
                return JSONResponse(
                    status_code=400,
                    content={"error": "Title cannot be empty"}
                )
            task["title"] = updates.title.strip()

        if updates.description is not None:
            task["description"] = updates.description.strip() if updates.description else None

        if updates.is_completed is not None:
            task["is_completed"] = updates.is_completed
            task["completed_at"] = datetime.utcnow().isoformat() if updates.is_completed else None

        task["updated_at"] = datetime.utcnow().isoformat()

        tasks_db[task_id] = task

        return format_task_response(task)
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": "Failed to update task", "detail": str(e)}
        )


@router.delete("/tasks/{task_id}")
async def delete_task(
    task_id: str,
    authorization: Optional[str] = Header(None)
):
    """Delete a task"""
    try:
        user_id = get_user_id_from_token(authorization)

        task = tasks_db.get(task_id)

        if not task:
            return JSONResponse(
                status_code=404,
                content={"error": "Task not found"}
            )

        # Verify task belongs to user
        if task["user_id"] != user_id:
            return JSONResponse(
                status_code=403,
                content={"error": "Access denied"}
            )

        del tasks_db[task_id]

        return {"success": True, "message": "Task deleted successfully"}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": "Failed to delete task", "detail": str(e)}
        )
