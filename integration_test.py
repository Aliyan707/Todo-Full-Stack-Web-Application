"""
End-to-End Integration Test for Phase II Todo App
Tests the complete user journey: Register → Login → CRUD Tasks → Logout
"""
import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
TEST_EMAIL = f"test+{datetime.now().timestamp()}@example.com"
TEST_PASSWORD = "password123"

# Global variables
access_token = None
user_id = None
task_id = None

def print_test(name: str):
    print(f"\n{'='*60}")
    print(f"TEST: {name}")
    print('='*60)

def print_success(message: str):
    print(f"[PASS] {message}")

def print_error(message: str):
    print(f"[FAIL] {message}")

def test_1_register():
    """Test user registration"""
    print_test("1. User Registration")

    response = requests.post(
        f"{BASE_URL}/api/auth/register",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )

    assert response.status_code == 201, f"Expected 201, got {response.status_code}"
    data = response.json()

    assert "id" in data, "Response missing 'id' field"
    assert "email" in data, "Response missing 'email' field"
    assert data["email"] == TEST_EMAIL, f"Email mismatch: {data['email']} != {TEST_EMAIL}"

    global user_id
    user_id = data["id"]

    print_success(f"User registered successfully: {user_id}")
    print_success(f"Email: {TEST_EMAIL}")
    return True

def test_2_login():
    """Test user login"""
    print_test("2. User Login")

    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )

    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()

    assert "access_token" in data, "Response missing 'access_token' field"
    assert "token_type" in data, "Response missing 'token_type' field"
    assert data["token_type"] == "bearer", f"Token type mismatch: {data['token_type']}"
    assert "user" in data, "Response missing 'user' field"

    global access_token
    access_token = data["access_token"]

    print_success(f"Login successful")
    print_success(f"Token: {access_token[:20]}...")
    print_success(f"User: {data['user']['email']}")
    return True

def test_3_get_me():
    """Test get current user"""
    print_test("3. Get Current User (/api/auth/me)")

    response = requests.get(
        f"{BASE_URL}/api/auth/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )

    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()

    assert data["id"] == user_id, f"User ID mismatch: {data['id']} != {user_id}"
    assert data["email"] == TEST_EMAIL, f"Email mismatch: {data['email']} != {TEST_EMAIL}"

    print_success(f"Current user fetched successfully")
    print_success(f"User ID: {data['id']}")
    print_success(f"Email: {data['email']}")
    return True

def test_4_create_task():
    """Test task creation"""
    print_test("4. Create Task")

    response = requests.post(
        f"{BASE_URL}/api/tasks",
        headers={"Authorization": f"Bearer {access_token}"},
        json={
            "title": "Integration Test Task",
            "description": "This task was created by the integration test script",
            "completed": False
        }
    )

    assert response.status_code == 201, f"Expected 201, got {response.status_code}"
    data = response.json()

    assert "id" in data, "Response missing 'id' field"
    assert data["title"] == "Integration Test Task", f"Title mismatch"
    assert data["user_id"] == user_id, f"User ID mismatch"
    assert data["completed"] == False, f"Completed should be False"

    global task_id
    task_id = data["id"]

    print_success(f"Task created successfully: {task_id}")
    print_success(f"Title: {data['title']}")
    print_success(f"User ID: {data['user_id']}")
    return True

def test_5_list_tasks():
    """Test listing tasks"""
    print_test("5. List Tasks")

    response = requests.get(
        f"{BASE_URL}/api/tasks",
        headers={"Authorization": f"Bearer {access_token}"}
    )

    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()

    assert "tasks" in data, "Response missing 'tasks' field"
    assert "total" in data, "Response missing 'total' field"
    assert len(data["tasks"]) > 0, "No tasks found"
    assert data["total"] >= 1, "Total count should be at least 1"

    # Verify our task is in the list
    task_found = any(t["id"] == task_id for t in data["tasks"])
    assert task_found, f"Created task {task_id} not found in list"

    print_success(f"Tasks listed successfully")
    print_success(f"Total tasks: {data['total']}")
    print_success(f"Tasks in response: {len(data['tasks'])}")
    return True

def test_6_get_task():
    """Test getting single task"""
    print_test("6. Get Single Task")

    response = requests.get(
        f"{BASE_URL}/api/tasks/{task_id}",
        headers={"Authorization": f"Bearer {access_token}"}
    )

    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()

    assert data["id"] == task_id, f"Task ID mismatch"
    assert data["user_id"] == user_id, f"User ID mismatch"

    print_success(f"Task fetched successfully: {task_id}")
    print_success(f"Title: {data['title']}")
    return True

def test_7_update_task():
    """Test updating task"""
    print_test("7. Update Task")

    response = requests.put(
        f"{BASE_URL}/api/tasks/{task_id}",
        headers={"Authorization": f"Bearer {access_token}"},
        json={
            "title": "Updated Integration Test Task",
            "completed": True
        }
    )

    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()

    assert data["id"] == task_id, f"Task ID mismatch"
    assert data["title"] == "Updated Integration Test Task", f"Title not updated"
    assert data["completed"] == True, f"Completed should be True"

    print_success(f"Task updated successfully")
    print_success(f"New title: {data['title']}")
    print_success(f"Completed: {data['completed']}")
    return True

def test_8_delete_task():
    """Test deleting task"""
    print_test("8. Delete Task")

    response = requests.delete(
        f"{BASE_URL}/api/tasks/{task_id}",
        headers={"Authorization": f"Bearer {access_token}"}
    )

    assert response.status_code == 204, f"Expected 204, got {response.status_code}"

    # Verify task is deleted (should return 404)
    verify_response = requests.get(
        f"{BASE_URL}/api/tasks/{task_id}",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert verify_response.status_code == 404, f"Task should be deleted (404)"

    print_success(f"Task deleted successfully: {task_id}")
    print_success(f"Verification: Task no longer exists (404)")
    return True

def test_9_auth_protection():
    """Test that endpoints require authentication"""
    print_test("9. Authentication Protection")

    # Test without token
    response = requests.get(f"{BASE_URL}/api/tasks")
    assert response.status_code == 401, f"Expected 401 for unauthenticated request"

    print_success(f"Unauthenticated request blocked (401)")

    # Test with invalid token
    response = requests.get(
        f"{BASE_URL}/api/tasks",
        headers={"Authorization": "Bearer invalid-token"}
    )
    assert response.status_code == 401, f"Expected 401 for invalid token"

    print_success(f"Invalid token rejected (401)")
    return True

def run_all_tests():
    """Run all integration tests"""
    tests = [
        test_1_register,
        test_2_login,
        test_3_get_me,
        test_4_create_task,
        test_5_list_tasks,
        test_6_get_task,
        test_7_update_task,
        test_8_delete_task,
        test_9_auth_protection,
    ]

    passed = 0
    failed = 0

    print("\n" + "="*60)
    print("PHASE II - END-TO-END INTEGRATION TESTS")
    print("="*60)
    print(f"Backend: {BASE_URL}")
    print(f"Test Email: {TEST_EMAIL}")
    print("="*60)

    for test in tests:
        try:
            result = test()
            if result:
                passed += 1
        except AssertionError as e:
            print_error(f"Test failed: {str(e)}")
            failed += 1
        except Exception as e:
            print_error(f"Test error: {str(e)}")
            failed += 1

    print("\n" + "="*60)
    print("TEST RESULTS")
    print("="*60)
    print(f"Passed: {passed}/{len(tests)}")
    print(f"Failed: {failed}/{len(tests)}")

    if failed == 0:
        print("\n[SUCCESS] ALL TESTS PASSED!")
        print("="*60)
        return 0
    else:
        print(f"\n[FAILURE] {failed} TEST(S) FAILED")
        print("="*60)
        return 1

if __name__ == "__main__":
    import sys
    exit_code = run_all_tests()
    sys.exit(exit_code)
