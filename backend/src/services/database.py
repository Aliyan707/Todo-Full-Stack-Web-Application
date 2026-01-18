from typing import List, Optional, Dict, Any
from sqlmodel import Session, select, func
from datetime import datetime
from uuid import UUID
from ..models import (
    Task, Conversation, Message,
    TaskStatus, TaskPriority,
    SenderType, MessageRole, ProcessStatus
)


class DatabaseService:
    """Service class to handle all database operations"""

    @staticmethod
    def create_task(session: Session, user_id: UUID, title: str, description: Optional[str] = None,
                    priority: TaskPriority = TaskPriority.medium, due_date: Optional[datetime] = None) -> Task:
        """Create a new task for a user"""
        task = Task(
            user_id=user_id,
            title=title,
            description=description,
            priority=priority,
            due_date=due_date
        )
        session.add(task)
        session.commit()
        session.refresh(task)
        return task

    @staticmethod
    def get_user_tasks(session: Session, user_id: UUID, status_filter: Optional[TaskStatus] = None,
                       priority_filter: Optional[TaskPriority] = None, limit: int = 50) -> List[Task]:
        """Get all tasks for a specific user with optional filters"""
        query = select(Task).where(Task.user_id == user_id)

        if status_filter:
            query = query.where(Task.status == status_filter)

        if priority_filter:
            query = query.where(Task.priority == priority_filter)

        query = query.limit(limit).order_by(Task.created_at.desc())

        return session.exec(query).all()

    @staticmethod
    def get_task_by_id(session: Session, task_id: UUID, user_id: UUID) -> Optional[Task]:
        """Get a specific task by ID for a user (ensuring data isolation)"""
        query = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        return session.exec(query).first()

    @staticmethod
    def update_task(session: Session, task_id: UUID, user_id: UUID,
                    title: Optional[str] = None, description: Optional[str] = None,
                    status: Optional[TaskStatus] = None, priority: Optional[TaskPriority] = None,
                    due_date: Optional[datetime] = None) -> Optional[Task]:
        """Update a specific task for a user"""
        task = DatabaseService.get_task_by_id(session, task_id, user_id)
        if not task:
            return None

        if title is not None:
            task.title = title
        if description is not None:
            task.description = description
        if status is not None:
            task.status = status
            if status == TaskStatus.completed and task.completed_at is None:
                task.completed_at = datetime.utcnow()
            elif status != TaskStatus.completed:
                task.completed_at = None
        if priority is not None:
            task.priority = priority
        if due_date is not None:
            task.due_date = due_date

        task.updated_at = datetime.utcnow()
        session.add(task)
        session.commit()
        session.refresh(task)
        return task

    @staticmethod
    def delete_task(session: Session, task_id: UUID, user_id: UUID) -> bool:
        """Delete a specific task for a user"""
        task = DatabaseService.get_task_by_id(session, task_id, user_id)
        if not task:
            return False

        session.delete(task)
        session.commit()
        return True

    @staticmethod
    def create_conversation(session: Session, user_id: UUID, title: Optional[str] = None) -> Conversation:
        """Create a new conversation for a user"""
        conversation = Conversation(
            user_id=user_id,
            title=title
        )
        session.add(conversation)
        session.commit()
        session.refresh(conversation)
        return conversation

    @staticmethod
    def get_conversation_by_id(session: Session, conversation_id: UUID, user_id: UUID) -> Optional[Conversation]:
        """Get a specific conversation by ID for a user"""
        query = select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
        )
        return session.exec(query).first()

    @staticmethod
    def create_message(session: Session, conversation_id: UUID, user_id: UUID,
                      content: str, sender_type: SenderType, role: MessageRole,
                      processed_status: ProcessStatus = ProcessStatus.pending) -> Message:
        """Create a new message in a conversation"""
        # Verify the conversation belongs to the user
        conversation = DatabaseService.get_conversation_by_id(session, conversation_id, user_id)
        if not conversation:
            raise ValueError("Conversation does not belong to user")

        sender_id = user_id if sender_type == SenderType.user else None

        message = Message(
            conversation_id=conversation_id,
            sender_type=sender_type,
            sender_id=sender_id,
            role=role,
            content=content,
            processed_status=processed_status
        )
        session.add(message)
        session.commit()
        session.refresh(message)
        return message

    @staticmethod
    def get_messages_for_conversation(session: Session, conversation_id: UUID, user_id: UUID) -> List[Message]:
        """Get all messages for a conversation that belongs to the user"""
        # Verify conversation belongs to user
        conversation = DatabaseService.get_conversation_by_id(session, conversation_id, user_id)
        if not conversation:
            return []

        query = select(Message).where(Message.conversation_id == conversation_id).order_by(Message.created_at.asc())
        return session.exec(query).all()

    @staticmethod
    def get_recent_messages(session: Session, conversation_id: UUID, user_id: UUID, limit: int = 10) -> List[Message]:
        """Get recent messages for a conversation"""
        # Verify conversation belongs to user
        conversation = DatabaseService.get_conversation_by_id(session, conversation_id, user_id)
        if not conversation:
            return []

        query = select(Message).where(Message.conversation_id == conversation_id).order_by(Message.created_at.desc()).limit(limit)
        return session.exec(query).all()[::-1]  # Reverse to get chronological order