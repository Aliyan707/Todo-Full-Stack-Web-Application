"""
Integration tests for the AI-Powered Todo Interface
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
from uuid import uuid4
from src.main import app
from src.models import TaskStatus, TaskPriority


@pytest.fixture
def client():
    """Create a test client for the FastAPI app"""
    return TestClient(app)


def test_chat_endpoint_add_task(client):
    """Test adding a task through the chat interface"""
    user_id = str(uuid4())
    message = "Add a task to buy milk"

    # Mock the OpenAI client to avoid actual API calls
    with patch('src.agents.todo_agent.TodoAgentWithMCPTools.process_request_with_tools') as mock_process:
        mock_process.return_value = {
            "success": True,
            "conversation_id": str(uuid4()),
            "response": "I've added the task 'buy milk' to your list.",
            "actions_taken": [
                {
                    "action": "task_created",
                    "details": {
                        "task_id": str(uuid4()),
                        "title": "buy milk"
                    }
                }
            ],
            "timestamp": "2026-01-17T15:30:45.123Z"
        }

        response = client.post(
            f"/api/{user_id}/chat",
            json={"message": message}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "buy milk" in data["response"]
        assert len(data["actions_taken"]) == 1
        assert data["actions_taken"][0]["action"] == "task_created"


def test_chat_endpoint_list_tasks(client):
    """Test listing tasks through the chat interface"""
    user_id = str(uuid4())
    message = "Show my tasks"

    # Mock the OpenAI client to avoid actual API calls
    with patch('src.agents.todo_agent.TodoAgentWithMCPTools.process_request_with_tools') as mock_process:
        mock_process.return_value = {
            "success": True,
            "conversation_id": str(uuid4()),
            "response": "Here are your tasks:\n1. Buy milk (pending)\n2. Call John (completed)",
            "actions_taken": [
                {
                    "action": "list_returned",
                    "details": {
                        "task_count": 2,
                        "tasks": [
                            {"id": str(uuid4()), "title": "Buy milk", "status": "pending"},
                            {"id": str(uuid4()), "title": "Call John", "status": "completed"}
                        ]
                    }
                }
            ],
            "timestamp": "2026-01-17T15:30:45.123Z"
        }

        response = client.post(
            f"/api/{user_id}/chat",
            json={"message": message}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "Buy milk" in data["response"]
        assert len(data["actions_taken"]) == 1
        assert data["actions_taken"][0]["action"] == "list_returned"


def test_chat_endpoint_complete_task(client):
    """Test completing a task through the chat interface"""
    user_id = str(uuid4())
    message = "Mark task 1 as done"

    # Mock the OpenAI client to avoid actual API calls
    with patch('src.agents.todo_agent.TodoAgentWithMCPTools.process_request_with_tools') as mock_process:
        mock_process.return_value = {
            "success": True,
            "conversation_id": str(uuid4()),
            "response": "I've marked task 'Buy milk' as completed.",
            "actions_taken": [
                {
                    "action": "task_completed",
                    "details": {
                        "task_id": str(uuid4()),
                        "title": "Buy milk"
                    }
                }
            ],
            "timestamp": "2026-01-17T15:30:45.123Z"
        }

        response = client.post(
            f"/api/{user_id}/chat",
            json={"message": message}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "marked task" in data["response"].lower()
        assert len(data["actions_taken"]) == 1
        assert data["actions_taken"][0]["action"] == "task_completed"


def test_health_check(client):
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "todo-chat-api"


def test_invalid_user_id_format(client):
    """Test that invalid user ID formats return an error"""
    invalid_user_id = "invalid-uuid-format"
    message = "Add a task to buy milk"

    response = client.post(
        f"/api/{invalid_user_id}/chat",
        json={"message": message}
    )

    assert response.status_code == 422  # Validation error


if __name__ == "__main__":
    pytest.main([__file__])