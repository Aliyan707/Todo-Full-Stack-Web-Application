"""
SQLModel database model tests.

Tests User and Task models, relationships, and database constraints.
Verifies schema correctness and cascade delete behavior.
"""

from uuid import UUID

from sqlmodel import Session, select

from app.auth import hash_password
from app.models.task import Task
from app.models.user import User


def test_user_model_creation(test_db: Session):
    """
    Test User model creation (T054).

    Verifies that users table exists with correct columns
    and can store user data properly.
    """
    # Create a user
    user = User(
        email="model-test@example.com",
        password_hash=hash_password("password123"),
    )

    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)

    # Verify user was created
    assert isinstance(user.id, UUID), "User ID should be a UUID"
    assert user.email == "model-test@example.com", "Email should match"
    assert user.password_hash != "password123", "Password should be hashed"
    assert user.created_at is not None, "created_at should be set"
    assert user.updated_at is not None, "updated_at should be set"

    # Verify user can be queried from database
    statement = select(User).where(User.email == "model-test@example.com")
    queried_user = test_db.exec(statement).first()

    assert queried_user is not None, "User should be queryable"
    assert queried_user.id == user.id, "IDs should match"


def test_task_model_creation(test_db: Session, test_user: User):
    """
    Test Task model creation (T055).

    Verifies that tasks table exists with correct columns,
    foreign key relationship works, and task data is stored properly.
    """
    # Create a task
    task = Task(
        title="Test Task Model",
        description="Testing task model creation",
        completed=False,
        user_id=test_user.id,
    )

    test_db.add(task)
    test_db.commit()
    test_db.refresh(task)

    # Verify task was created
    assert isinstance(task.id, UUID), "Task ID should be a UUID"
    assert task.title == "Test Task Model", "Title should match"
    assert task.description == "Testing task model creation", "Description should match"
    assert task.completed is False, "Completed should be False"
    assert task.user_id == test_user.id, "user_id should match test user"
    assert task.created_at is not None, "created_at should be set"
    assert task.updated_at is not None, "updated_at should be set"

    # Verify task can be queried from database
    statement = select(Task).where(Task.id == task.id)
    queried_task = test_db.exec(statement).first()

    assert queried_task is not None, "Task should be queryable"
    assert queried_task.user_id == test_user.id, "user_id should match"

    # Verify relationship (task.user should return the user)
    assert task.user.id == test_user.id, "Relationship should load user"
    assert task.user.email == test_user.email, "User email should match"


def test_cascade_delete(test_db: Session):
    """
    Test cascade delete behavior (T056).

    Verifies that when a user is deleted, all their tasks
    are automatically deleted (ON DELETE CASCADE).
    """
    # Create a user
    user = User(
        email="cascade-test@example.com",
        password_hash=hash_password("password123"),
    )

    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)

    user_id = user.id

    # Create multiple tasks for the user
    task1 = Task(title="Task 1", user_id=user_id)
    task2 = Task(title="Task 2", user_id=user_id)
    task3 = Task(title="Task 3", user_id=user_id)

    test_db.add(task1)
    test_db.add(task2)
    test_db.add(task3)
    test_db.commit()

    # Verify tasks exist
    statement = select(Task).where(Task.user_id == user_id)
    tasks_before = test_db.exec(statement).all()
    assert len(tasks_before) == 3, "Should have 3 tasks before delete"

    # Delete the user
    test_db.delete(user)
    test_db.commit()

    # Verify user is deleted
    statement = select(User).where(User.id == user_id)
    deleted_user = test_db.exec(statement).first()
    assert deleted_user is None, "User should be deleted"

    # Verify all tasks are automatically deleted (CASCADE)
    statement = select(Task).where(Task.user_id == user_id)
    tasks_after = test_db.exec(statement).all()
    assert len(tasks_after) == 0, "All tasks should be deleted automatically (CASCADE)"


def test_task_user_relationship(test_db: Session, test_user: User):
    """
    Test bidirectional relationship between User and Task models.

    Verifies that:
    - task.user returns the owning user
    - user.tasks returns all tasks belonging to the user
    """
    # Create tasks for the user
    task1 = Task(title="Relationship Test 1", user_id=test_user.id)
    task2 = Task(title="Relationship Test 2", user_id=test_user.id)

    test_db.add(task1)
    test_db.add(task2)
    test_db.commit()
    test_db.refresh(task1)
    test_db.refresh(task2)
    test_db.refresh(test_user)

    # Test task -> user relationship
    assert task1.user.id == test_user.id, "task.user should return the owning user"
    assert task2.user.email == test_user.email, "task.user should have correct email"

    # Test user -> tasks relationship
    assert len(test_user.tasks) >= 2, "user.tasks should return all user's tasks"

    task_titles = [task.title for task in test_user.tasks]
    assert "Relationship Test 1" in task_titles, "User's tasks should include task1"
    assert "Relationship Test 2" in task_titles, "User's tasks should include task2"


def test_email_uniqueness_constraint(test_db: Session):
    """
    Test that email uniqueness constraint is enforced.

    Verifies that attempting to create two users with the same
    email raises an error.
    """
    # Create first user
    user1 = User(
        email="unique@example.com",
        password_hash=hash_password("password1"),
    )

    test_db.add(user1)
    test_db.commit()

    # Attempt to create second user with same email
    user2 = User(
        email="unique@example.com",
        password_hash=hash_password("password2"),
    )

    test_db.add(user2)

    # This should raise an integrity error
    try:
        test_db.commit()
        assert False, "Should have raised an integrity error for duplicate email"
    except Exception as e:
        # Rollback the transaction
        test_db.rollback()
        # Verify it's an integrity/unique constraint error
        error_msg = str(e).lower()
        assert (
            "unique" in error_msg or "integrity" in error_msg
        ), f"Expected uniqueness error, got: {e}"
