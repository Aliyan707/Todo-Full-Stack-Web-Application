"""
SQLModel models for database tables.

This package contains all database models:
- User: User authentication and profile data
- Task: Todo task data with user ownership
"""

from app.models.user import User
from app.models.task import Task

__all__ = ["User", "Task"]
