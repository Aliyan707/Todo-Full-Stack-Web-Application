"""
Task CRUD endpoint integration tests.

Tests all 5 task management endpoints:
- GET /api/tasks (list with pagination and filtering)
- POST /api/tasks (create)
- GET /api/tasks/{task_id} (get single)
- PUT /api/tasks/{task_id} (update)
- DELETE /api/tasks/{task_id} (delete)

Verifies user ownership, authorization, pagination, and error handling.
"""

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.auth import create_access_token
from app.models.task import Task
from app.models.user import User


def test_create_task(test_client: TestClient, auth_headers: dict, test_user: User):
    """Test create task (T064)."""
    response = test_client.post(
        "/api/tasks",
        json={
            "title": "Test Task",
            "description": "Test Description",
            "completed": False,
        },
        headers=auth_headers,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Task"
    assert data["description"] == "Test Description"
    assert data["completed"] is False
    assert data["user_id"] == str(test_user.id)


def test_list_tasks_user_scoping(test_client: TestClient, test_db: Session, test_user: User, second_user: User):
    """Test list tasks returns only user's tasks (T065)."""
    # Create tasks for test_user
    task1 = Task(title="User 1 Task 1", user_id=test_user.id)
    task2 = Task(title="User 1 Task 2", user_id=test_user.id)

    # Create tasks for second_user
    task3 = Task(title="User 2 Task 1", user_id=second_user.id)

    test_db.add_all([task1, task2, task3])
    test_db.commit()

    # Get tasks for test_user
    token = create_access_token(test_user.id)
    response = test_client.get(
        "/api/tasks",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert len(data["tasks"]) == 2

    titles = [t["title"] for t in data["tasks"]]
    assert "User 1 Task 1" in titles
    assert "User 1 Task 2" in titles
    assert "User 2 Task 1" not in titles


def test_get_single_task(test_client: TestClient, test_db: Session, auth_headers: dict, test_user: User):
    """Test get single task (T066)."""
    task = Task(title="Get Task Test", user_id=test_user.id)
    test_db.add(task)
    test_db.commit()
    test_db.refresh(task)

    response = test_client.get(f"/api/tasks/{task.id}", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(task.id)
    assert data["title"] == "Get Task Test"


def test_get_another_users_task(test_client: TestClient, test_db: Session, test_user: User, second_user: User):
    """Test getting another user's task returns 403 (T067)."""
    # Create task for second_user
    task = Task(title="User 2 Task", user_id=second_user.id)
    test_db.add(task)
    test_db.commit()
    test_db.refresh(task)

    # Try to access with test_user token
    token = create_access_token(test_user.id)
    response = test_client.get(
        f"/api/tasks/{task.id}",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 403
    assert "another user" in response.json()["detail"].lower()


def test_update_task(test_client: TestClient, test_db: Session, auth_headers: dict, test_user: User):
    """Test update task (T068)."""
    task = Task(title="Original Title", completed=False, user_id=test_user.id)
    test_db.add(task)
    test_db.commit()
    test_db.refresh(task)

    response = test_client.put(
        f"/api/tasks/{task.id}",
        json={"title": "Updated Title", "completed": True},
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Title"
    assert data["completed"] is True


def test_delete_task(test_client: TestClient, test_db: Session, auth_headers: dict, test_user: User):
    """Test delete task (T069)."""
    task = Task(title="To Delete", user_id=test_user.id)
    test_db.add(task)
    test_db.commit()
    test_db.refresh(task)
    task_id = task.id

    response = test_client.delete(f"/api/tasks/{task_id}", headers=auth_headers)

    assert response.status_code == 204

    # Verify task is deleted
    response = test_client.get(f"/api/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 404


def test_pagination(test_client: TestClient, test_db: Session, auth_headers: dict, test_user: User):
    """Test pagination (T070)."""
    # Create 15 tasks
    tasks = [Task(title=f"Task {i}", user_id=test_user.id) for i in range(15)]
    test_db.add_all(tasks)
    test_db.commit()

    # Get first page (limit=5)
    response = test_client.get("/api/tasks?limit=5&offset=0", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 15
    assert len(data["tasks"]) == 5
    assert data["limit"] == 5
    assert data["offset"] == 0

    # Get second page
    response = test_client.get("/api/tasks?limit=5&offset=5", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data["tasks"]) == 5
    assert data["offset"] == 5


def test_completed_filter(test_client: TestClient, test_db: Session, auth_headers: dict, test_user: User):
    """Test completed filter (T071)."""
    # Create completed and incomplete tasks
    task1 = Task(title="Incomplete 1", completed=False, user_id=test_user.id)
    task2 = Task(title="Completed 1", completed=True, user_id=test_user.id)
    task3 = Task(title="Incomplete 2", completed=False, user_id=test_user.id)

    test_db.add_all([task1, task2, task3])
    test_db.commit()

    # Filter for incomplete tasks
    response = test_client.get("/api/tasks?completed=false", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    for task in data["tasks"]:
        assert task["completed"] is False

    # Filter for completed tasks
    response = test_client.get("/api/tasks?completed=true", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["tasks"][0]["completed"] is True
