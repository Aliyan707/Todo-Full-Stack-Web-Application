import asyncio
from typing import Dict, Any, Optional
from uuid import UUID
from datetime import datetime
from mcp.server import Server
from mcp.types import Notification, Request
from pydantic import BaseModel
from sqlmodel import create_engine, Session
from ..models import TaskStatus, TaskPriority
from .database import DatabaseService


# Define Pydantic models for MCP tool parameters
class AddTaskParams(BaseModel):
    user_id: str
    title: str
    description: Optional[str] = None
    due_date: Optional[str] = None
    priority: Optional[str] = "medium"


class ListTasksParams(BaseModel):
    user_id: str
    status_filter: Optional[str] = "all"
    priority_filter: Optional[str] = "all"
    limit: Optional[int] = 50


class CompleteTaskParams(BaseModel):
    user_id: str
    task_id: str


class DeleteTaskParams(BaseModel):
    user_id: str
    task_id: str


class UpdateTaskParams(BaseModel):
    user_id: str
    task_id: str
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None


class MCPTaskServer:
    """
    MCP Server that exposes task management tools for AI agents
    """

    def __init__(self, database_url: str):
        self.server = Server("todo-task-manager")
        self.engine = create_engine(database_url)

        # Register MCP tools
        self._register_tools()

    def _register_tools(self):
        """Register all MCP tools"""
        self.server.tool_calls.register(self.add_task, "add_task", {
            "title": "Add Task",
            "description": "Creates a new task in the user's todo list",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "string", "description": "Unique identifier of the user"},
                    "title": {"type": "string", "description": "Title of the task (1-255 characters)"},
                    "description": {"type": "string", "description": "Detailed description of the task (optional)"},
                    "due_date": {"type": "string", "format": "date-time", "description": "Due date for the task in ISO 8601 format (optional)"},
                    "priority": {"type": "string", "enum": ["low", "medium", "high"], "description": "Priority level of the task (default: medium)"}
                },
                "required": ["user_id", "title"]
            }
        })

        self.server.tool_calls.register(self.list_tasks, "list_tasks", {
            "title": "List Tasks",
            "description": "Retrieves a list of tasks for the specified user with optional filtering",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "string", "description": "Unique identifier of the user whose tasks to retrieve"},
                    "status_filter": {"type": "string", "enum": ["all", "pending", "in_progress", "completed"], "description": "Filter tasks by status (default: all)"},
                    "priority_filter": {"type": "string", "enum": ["all", "low", "medium", "high"], "description": "Filter tasks by priority (default: all)"},
                    "limit": {"type": "integer", "minimum": 1, "maximum": 100, "description": "Maximum number of tasks to return (default: 50)"}
                },
                "required": ["user_id"]
            }
        })

        self.server.tool_calls.register(self.complete_task, "complete_task", {
            "title": "Complete Task",
            "description": "Marks a specific task as completed",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "string", "description": "Unique identifier of the user who owns the task"},
                    "task_id": {"type": "string", "description": "ID of the task to mark as completed"}
                },
                "required": ["user_id", "task_id"]
            }
        })

        self.server.tool_calls.register(self.delete_task, "delete_task", {
            "title": "Delete Task",
            "description": "Removes a task from the user's todo list",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "string", "description": "Unique identifier of the user who owns the task"},
                    "task_id": {"type": "string", "description": "ID of the task to delete"}
                },
                "required": ["user_id", "task_id"]
            }
        })

        self.server.tool_calls.register(self.update_task, "update_task", {
            "title": "Update Task",
            "description": "Modifies an existing task's details",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "string", "description": "Unique identifier of the user who owns the task"},
                    "task_id": {"type": "string", "description": "ID of the task to update"},
                    "title": {"type": "string", "description": "New title for the task (optional)"},
                    "description": {"type": "string", "description": "New description for the task (optional)"},
                    "status": {"type": "string", "enum": ["pending", "in_progress", "completed"], "description": "New status for the task (optional)"},
                    "priority": {"type": "string", "enum": ["low", "medium", "high"], "description": "New priority for the task (optional)"},
                    "due_date": {"type": "string", "format": "date-time", "description": "New due date for the task (optional)"}
                },
                "required": ["user_id", "task_id"]
            }
        })

    def _validate_user_access(self, user_id_str: str, task_or_conversation_id_str: str, entity_type: str) -> tuple[UUID, UUID]:
        """Validate that the user can access the specified entity"""
        from uuid import UUID

        try:
            user_id = UUID(user_id_str)
            entity_id = UUID(task_or_conversation_id_str)
            return user_id, entity_id
        except ValueError:
            raise ValueError(f"Invalid {entity_type} ID format")

    async def add_task(self, params: AddTaskParams) -> Dict[str, Any]:
        """Add a new task to the user's list"""
        try:
            user_id = UUID(params.user_id)

            # Convert priority string to enum
            priority_enum = TaskPriority(params.priority)

            # Convert due_date string to datetime if provided
            due_date = None
            if params.due_date:
                from datetime import datetime
                due_date = datetime.fromisoformat(params.due_date.replace('Z', '+00:00'))

            with Session(self.engine) as session:
                task = DatabaseService.create_task(
                    session=session,
                    user_id=user_id,
                    title=params.title,
                    description=params.description,
                    priority=priority_enum,
                    due_date=due_date
                )

                return {
                    "success": True,
                    "task_id": str(task.id),
                    "message": f"Task '{task.title}' created successfully"
                }
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to create task: {str(e)}"
            }

    async def list_tasks(self, params: ListTasksParams) -> Dict[str, Any]:
        """List tasks for a user with optional filtering"""
        try:
            user_id = UUID(params.user_id)

            # Convert filters to enums if not 'all'
            status_filter = None
            if params.status_filter != "all":
                status_filter = TaskStatus(params.status_filter)

            priority_filter = None
            if params.priority_filter != "all":
                priority_filter = TaskPriority(params.priority_filter)

            with Session(self.engine) as session:
                tasks = DatabaseService.get_user_tasks(
                    session=session,
                    user_id=user_id,
                    status_filter=status_filter,
                    priority_filter=priority_filter,
                    limit=params.limit
                )

                task_list = []
                for task in tasks:
                    task_dict = {
                        "id": str(task.id),
                        "title": task.title,
                        "description": task.description,
                        "status": task.status.value,
                        "priority": task.priority.value,
                        "due_date": task.due_date.isoformat() if task.due_date else None,
                        "created_at": task.created_at.isoformat()
                    }
                    task_list.append(task_dict)

                return {
                    "success": True,
                    "tasks": task_list,
                    "total_count": len(task_list)
                }
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to list tasks: {str(e)}"
            }

    async def complete_task(self, params: CompleteTaskParams) -> Dict[str, Any]:
        """Mark a task as completed"""
        try:
            user_id, task_id = self._validate_user_access(params.user_id, params.task_id, "task")

            with Session(self.engine) as session:
                task = DatabaseService.update_task(
                    session=session,
                    task_id=task_id,
                    user_id=user_id,
                    status=TaskStatus.completed
                )

                if task:
                    return {
                        "success": True,
                        "message": f"Task '{task.title}' marked as completed"
                    }
                else:
                    return {
                        "success": False,
                        "message": "Task not found or user not authorized"
                    }
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to complete task: {str(e)}"
            }

    async def delete_task(self, params: DeleteTaskParams) -> Dict[str, Any]:
        """Delete a task"""
        try:
            user_id, task_id = self._validate_user_access(params.user_id, params.task_id, "task")

            with Session(self.engine) as session:
                success = DatabaseService.delete_task(
                    session=session,
                    task_id=task_id,
                    user_id=user_id
                )

                if success:
                    return {
                        "success": True,
                        "message": "Task deleted successfully"
                    }
                else:
                    return {
                        "success": False,
                        "message": "Task not found or user not authorized"
                    }
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to delete task: {str(e)}"
            }

    async def update_task(self, params: UpdateTaskParams) -> Dict[str, Any]:
        """Update a task"""
        try:
            user_id, task_id = self._validate_user_access(params.user_id, params.task_id, "task")

            # Convert optional parameters to appropriate types
            status = TaskStatus(params.status) if params.status else None
            priority = TaskPriority(params.priority) if params.priority else None

            due_date = None
            if params.due_date:
                from datetime import datetime
                due_date = datetime.fromisoformat(params.due_date.replace('Z', '+00:00'))

            with Session(self.engine) as session:
                updated_task = DatabaseService.update_task(
                    session=session,
                    task_id=task_id,
                    user_id=user_id,
                    title=params.title,
                    description=params.description,
                    status=status,
                    priority=priority,
                    due_date=due_date
                )

                if updated_task:
                    return {
                        "success": True,
                        "message": f"Task '{updated_task.title}' updated successfully"
                    }
                else:
                    return {
                        "success": False,
                        "message": "Task not found or user not authorized"
                    }
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to update task: {str(e)}"
            }

    async def run(self, host: str = "127.0.0.1", port: int = 3000):
        """Start the MCP server"""
        from mcp.server.stdio import run_stdio_server

        await run_stdio_server(self.server)