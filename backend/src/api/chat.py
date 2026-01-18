from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Header
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from uuid import UUID, uuid4
import os
import re
import json
from datetime import datetime
from .tasks import tasks_db, get_user_id_from_token

router = APIRouter()


# In-memory conversation storage (for demo purposes)
conversations: Dict[str, List[Dict[str, Any]]] = {}


def create_task_for_user(user_id: str, title: str, description: str = None) -> dict:
    """Create a task directly in the tasks database"""
    task_id = str(uuid4())
    now = datetime.utcnow().isoformat()

    task = {
        "id": task_id,
        "user_id": user_id,
        "title": title.strip(),
        "description": description.strip() if description else None,
        "is_completed": False,
        "completed_at": None,
        "created_at": now,
        "updated_at": now
    }

    tasks_db[task_id] = task
    return task


def complete_task_for_user(user_id: str, task_identifier: str) -> dict:
    """Mark a task as complete by ID or index"""
    # Get user's tasks
    user_tasks = [t for t in tasks_db.values() if t["user_id"] == user_id and not t["is_completed"]]
    user_tasks.sort(key=lambda x: x["created_at"])

    task = None

    # Check if it's a number (index)
    if task_identifier.isdigit():
        idx = int(task_identifier) - 1  # 1-based index
        if 0 <= idx < len(user_tasks):
            task = user_tasks[idx]
    else:
        # Try to find by ID
        task = tasks_db.get(task_identifier)
        if task and task["user_id"] != user_id:
            task = None

    if task:
        task["is_completed"] = True
        task["completed_at"] = datetime.utcnow().isoformat()
        task["updated_at"] = datetime.utcnow().isoformat()
        tasks_db[task["id"]] = task
        return task

    return None


def delete_task_for_user(user_id: str, task_identifier: str) -> bool:
    """Delete a task by ID or index"""
    user_tasks = [t for t in tasks_db.values() if t["user_id"] == user_id]
    user_tasks.sort(key=lambda x: x["created_at"])

    task = None

    if task_identifier.isdigit():
        idx = int(task_identifier) - 1
        if 0 <= idx < len(user_tasks):
            task = user_tasks[idx]
    else:
        task = tasks_db.get(task_identifier)
        if task and task["user_id"] != user_id:
            task = None

    if task:
        del tasks_db[task["id"]]
        return True

    return False


def get_tasks_for_user(user_id: str) -> List[dict]:
    """Get all tasks for a user"""
    user_tasks = [t for t in tasks_db.values() if t["user_id"] == user_id]
    user_tasks.sort(key=lambda x: x["created_at"], reverse=True)
    return user_tasks


# Request/Response models
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000)
    conversation_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class ActionResult(BaseModel):
    action: str
    details: Dict[str, Any]


class ChatResponse(BaseModel):
    success: bool
    conversation_id: Optional[str] = None
    response: Optional[str] = None
    actions_taken: List[ActionResult] = []
    timestamp: Optional[str] = None
    error: Optional[str] = None
    error_code: Optional[str] = None


def extract_task_from_message(message: str) -> str:
    """Extract task title from a message like 'add a task to buy groceries'"""
    message_lower = message.lower()

    # Common patterns to remove
    patterns_to_remove = [
        r'^(please\s+)?',
        r'(add|create|make|new)\s+(a\s+)?(new\s+)?(task|todo|item)\s+(to\s+|for\s+|called\s+|named\s+)?',
        r'(i\s+need\s+to|i\s+have\s+to|i\s+want\s+to|remind\s+me\s+to)\s+',
    ]

    result = message
    for pattern in patterns_to_remove:
        result = re.sub(pattern, '', result, flags=re.IGNORECASE)

    return result.strip()


def get_ai_response(message: str, user_id: str, conversation_history: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Get AI response - tries Cohere if available, otherwise uses smart fallback
    """
    from dotenv import load_dotenv
    load_dotenv()  # Ensure .env is loaded

    cohere_api_key = os.getenv("COHERE_API_KEY")
    message_lower = message.lower()
    actions_taken = []

    # First, detect and execute task operations regardless of AI availability
    # ADD TASK
    if any(word in message_lower for word in ["add", "create", "new", "remind"]) and \
       any(word in message_lower for word in ["task", "todo", "item"]) or \
       message_lower.startswith("remind me to") or message_lower.startswith("i need to"):

        task_title = extract_task_from_message(message)
        if task_title and len(task_title) > 2:
            task = create_task_for_user(user_id, task_title)
            actions_taken.append({
                "action": "task_created",
                "details": {"task_id": task["id"], "title": task["title"]}
            })
            return {
                "success": True,
                "response": f"Done! I've added '{task['title']}' to your task list. Check the Tasks panel on the right to see it!",
                "actions_taken": actions_taken
            }

    # COMPLETE TASK
    if any(word in message_lower for word in ["complete", "done", "finish", "mark"]):
        # Try to find a task number or reference
        numbers = re.findall(r'\d+', message)
        if numbers:
            task = complete_task_for_user(user_id, numbers[0])
            if task:
                actions_taken.append({
                    "action": "task_completed",
                    "details": {"task_id": task["id"], "title": task["title"]}
                })
                return {
                    "success": True,
                    "response": f"Great job! I've marked '{task['title']}' as complete!",
                    "actions_taken": actions_taken
                }
            else:
                return {
                    "success": True,
                    "response": f"I couldn't find task #{numbers[0]}. Check the Tasks panel to see your current tasks.",
                    "actions_taken": []
                }

    # DELETE TASK
    if any(word in message_lower for word in ["delete", "remove", "clear"]):
        numbers = re.findall(r'\d+', message)
        if numbers:
            # Get task title before deletion
            user_tasks = get_tasks_for_user(user_id)
            user_tasks.sort(key=lambda x: x["created_at"])
            idx = int(numbers[0]) - 1
            task_title = user_tasks[idx]["title"] if 0 <= idx < len(user_tasks) else "unknown"

            if delete_task_for_user(user_id, numbers[0]):
                actions_taken.append({
                    "action": "task_deleted",
                    "details": {"title": task_title}
                })
                return {
                    "success": True,
                    "response": f"Done! I've deleted '{task_title}' from your list.",
                    "actions_taken": actions_taken
                }
            else:
                return {
                    "success": True,
                    "response": f"I couldn't find task #{numbers[0]} to delete.",
                    "actions_taken": []
                }

    # LIST TASKS
    if any(word in message_lower for word in ["show", "list", "display", "what", "my tasks", "my todo"]):
        tasks = get_tasks_for_user(user_id)
        if tasks:
            pending = [t for t in tasks if not t["is_completed"]]
            completed = [t for t in tasks if t["is_completed"]]

            task_list = ""
            if pending:
                task_list += "**Your pending tasks:**\n"
                for i, t in enumerate(pending, 1):
                    task_list += f"{i}. {t['title']}\n"

            if completed:
                task_list += f"\n**Completed:** {len(completed)} task(s)"

            return {
                "success": True,
                "response": task_list if task_list else "You have no tasks yet!",
                "actions_taken": []
            }
        else:
            return {
                "success": True,
                "response": "You don't have any tasks yet. Try saying 'add a task to buy groceries' to create one!",
                "actions_taken": []
            }

    # Use Cohere for general conversation
    if cohere_api_key and cohere_api_key not in ["your-api-key-here", ""]:
        try:
            import cohere
            client = cohere.ClientV2(cohere_api_key)

            # Get current tasks for context
            tasks = get_tasks_for_user(user_id)
            task_context = ""
            if tasks:
                pending = [t["title"] for t in tasks if not t["is_completed"]]
                if pending:
                    task_context = f"\n\nUser's current tasks: {', '.join(pending[:5])}"

            # Build messages for Cohere v2 API
            messages = [
                {
                    "role": "system",
                    "content": f"""You are a helpful AI assistant that manages todo lists through natural language.
You help users add, list, complete, and delete tasks.
When users want to add a task, tell them to say something like "add a task to [description]".
When users want to complete a task, tell them to say "mark task 1 as done".
When users want to delete, tell them to say "delete task 1".
Keep responses concise and friendly.{task_context}"""
                }
            ]

            # Add conversation history
            for msg in conversation_history[-10:]:
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })

            messages.append({"role": "user", "content": message})

            response = client.chat(
                model="command-a-03-2025",
                messages=messages,
            )

            return {
                "success": True,
                "response": response.message.content[0].text.strip(),
                "actions_taken": actions_taken
            }
        except Exception as e:
            print(f"Cohere error: {e}")

    # Fallback for greetings and help
    if any(word in message_lower for word in ["hello", "hi", "hey"]):
        return {
            "success": True,
            "response": "Hello! I'm your AI todo assistant. Try saying:\n• 'Add a task to buy groceries'\n• 'Show my tasks'\n• 'Mark task 1 as done'\n• 'Delete task 2'",
            "actions_taken": []
        }

    if any(word in message_lower for word in ["help", "how", "what can"]):
        return {
            "success": True,
            "response": """I can help you manage your tasks! Try:

• **Add**: "Add a task to buy milk"
• **View**: "Show my tasks"
• **Complete**: "Mark task 1 as done"
• **Delete**: "Delete task 2"

Your tasks appear in the panel on the right!""",
            "actions_taken": []
        }

    return {
        "success": True,
        "response": f"I'm your todo assistant! Try commands like 'add a task to {message}' or 'show my tasks'.",
        "actions_taken": []
    }


@router.post("/api/{user_id}/chat", response_model=ChatResponse)
async def chat_endpoint(
    user_id: str,
    request: ChatRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Main chat endpoint that processes natural language requests and returns AI-generated responses
    """
    try:
        # Get the actual user_id from the authorization token (same as tasks API)
        # This ensures tasks are created for the same user
        actual_user_id = get_user_id_from_token(authorization)

        # Get or create conversation
        conv_id = request.conversation_id or str(uuid4())

        # Get conversation history
        if conv_id not in conversations:
            conversations[conv_id] = []

        conversation_history = conversations[conv_id]

        # Get AI response - use actual_user_id for task operations
        result = get_ai_response(request.message, actual_user_id, conversation_history)

        # Store messages in conversation history
        conversations[conv_id].append({
            "role": "user",
            "content": request.message,
            "timestamp": datetime.utcnow().isoformat()
        })

        if result.get("response"):
            conversations[conv_id].append({
                "role": "assistant",
                "content": result["response"],
                "timestamp": datetime.utcnow().isoformat()
            })

        # Build response
        response = ChatResponse(
            success=result.get("success", True),
            conversation_id=conv_id,
            response=result.get("response"),
            actions_taken=result.get("actions_taken", []),
            timestamp=datetime.utcnow().isoformat(),
            error=result.get("error"),
            error_code=result.get("error_code")
        )

        return response

    except Exception as e:
        # Handle any errors gracefully
        print(f"Chat error: {e}")
        return ChatResponse(
            success=True,
            conversation_id=request.conversation_id or str(uuid4()),
            response=f"I encountered a small issue, but I'm still here to help! Try asking me to add a task or show your tasks.",
            actions_taken=[],
            timestamp=datetime.utcnow().isoformat()
        )


# Health check endpoint
@router.get("/health")
async def health_check():
    """
    Health check endpoint to verify the service is running
    """
    return {"status": "healthy", "service": "todo-chat-api"}