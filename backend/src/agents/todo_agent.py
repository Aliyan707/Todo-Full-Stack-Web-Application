import os
from typing import Dict, Any, List, Optional
from openai import OpenAI
from sqlmodel import create_engine, Session
from uuid import UUID
from datetime import datetime
from ..models import Message, MessageRole
from ..services.database import DatabaseService


class TodoAgent:
    """
    AI Agent that processes natural language requests and uses MCP tools to manage tasks
    """

    def __init__(self, database_url: str, openai_api_key: str):
        self.engine = create_engine(database_url)
        self.client = OpenAI(api_key=openai_api_key)
        self.model = "gpt-4-turbo"  # or gpt-3.5-turbo for lower cost

    def _get_conversation_context(self, conversation_id: UUID, user_id: UUID) -> List[Dict[str, str]]:
        """
        Fetch conversation history from the database to provide context to the AI
        """
        with Session(self.engine) as session:
            messages = DatabaseService.get_messages_for_conversation(
                session=session,
                conversation_id=conversation_id,
                user_id=user_id
            )

            context = []
            for msg in messages:
                role_mapping = {
                    "user": "user",
                    "assistant": "assistant",
                    "system": "system"
                }

                context.append({
                    "role": role_mapping.get(msg.role.value, "user"),
                    "content": msg.content
                })

        return context

    def _save_message_to_db(self, conversation_id: UUID, user_id: UUID,
                           content: str, sender_type: str, role: str):
        """
        Save a message to the database
        """
        with Session(self.engine) as session:
            DatabaseService.create_message(
                session=session,
                conversation_id=conversation_id,
                user_id=user_id,
                content=content,
                sender_type=sender_type,
                role=role
            )

    def process_request(self, user_id: str, message: str, conversation_id: Optional[str] = None,
                       metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Process a natural language request from a user and return an AI-generated response
        """
        try:
            user_uuid = UUID(user_id)

            # Create or retrieve conversation
            with Session(self.engine) as session:
                if conversation_id:
                    conv_uuid = UUID(conversation_id)
                    # Verify conversation belongs to user
                    conversation = DatabaseService.get_conversation_by_id(
                        session=session,
                        conversation_id=conv_uuid,
                        user_id=user_uuid
                    )

                    if not conversation:
                        return {
                            "success": False,
                            "error": "Conversation not found or user not authorized",
                            "error_code": "FORBIDDEN_ACCESS"
                        }
                else:
                    # Create new conversation
                    conversation = DatabaseService.create_conversation(
                        session=session,
                        user_id=user_uuid,
                        title=message[:50] + "..." if len(message) > 50 else message
                    )
                    conv_uuid = conversation.id

            # Get conversation history for context
            context_messages = self._get_conversation_context(conv_uuid, user_uuid)

            # Prepare the system message with instructions for the AI
            system_message = {
                "role": "system",
                "content": f"""You are a helpful AI assistant that manages todo lists through natural language.
                You can help users add, list, update, complete, and delete tasks.
                Respond naturally to user requests and perform appropriate task management operations.
                The current user ID is {user_id}. Always ensure operations are scoped to this user only.
                Be helpful and confirm actions after performing them."""
            }

            # Add the user's message
            user_message = {
                "role": "user",
                "content": message
            }

            # Combine system message, context, and user message
            all_messages = [system_message] + context_messages + [user_message]

            # Save the user's message to the database
            self._save_message_to_db(
                conversation_id=conv_uuid,
                user_id=user_uuid,
                content=message,
                sender_type="user",
                role="user"
            )

            # Call the OpenAI API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=all_messages,
                temperature=0.7,
                max_tokens=500
            )

            ai_response = response.choices[0].message.content.strip()

            # Save the AI's response to the database
            self._save_message_to_db(
                conversation_id=conv_uuid,
                user_id=user_uuid,
                content=ai_response,
                sender_type="assistant",
                role="assistant"
            )

            # For now, return a simple response
            # In a full implementation, we would parse the AI's response to determine
            # what actions were taken and return structured information about them
            return {
                "success": True,
                "conversation_id": str(conv_uuid),
                "response": ai_response,
                "actions_taken": [],  # This would be populated based on AI parsing in a full implementation
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"Error processing request: {str(e)}",
                "error_code": "INTERNAL_ERROR"
            }


# For a more advanced implementation that integrates with MCP tools directly:
class TodoAgentWithMCPTools(TodoAgent):
    """
    Enhanced version that can integrate with MCP tools for more precise task management
    """

    def __init__(self, database_url: str, openai_api_key: str, mcp_client=None):
        super().__init__(database_url, openai_api_key)
        self.mcp_client = mcp_client  # This would be a client to communicate with the MCP server

    def process_request_with_tools(self, user_id: str, message: str, conversation_id: Optional[str] = None,
                                  metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Process request using OpenAI's function calling to invoke MCP tools
        """
        try:
            user_uuid = UUID(user_id)

            # Create or retrieve conversation
            with Session(self.engine) as session:
                if conversation_id:
                    conv_uuid = UUID(conversation_id)
                    conversation = DatabaseService.get_conversation_by_id(
                        session=session,
                        conversation_id=conv_uuid,
                        user_id=user_uuid
                    )

                    if not conversation:
                        return {
                            "success": False,
                            "error": "Conversation not found or user not authorized",
                            "error_code": "FORBIDDEN_ACCESS"
                        }
                else:
                    conversation = DatabaseService.create_conversation(
                        session=session,
                        user_id=user_uuid,
                        title=message[:50] + "..." if len(message) > 50 else message
                    )
                    conv_uuid = conversation.id

            # Get conversation history for context
            context_messages = self._get_conversation_context(conv_uuid, user_uuid)

            # Define available functions (these correspond to MCP tools)
            functions = [
                {
                    "name": "add_task",
                    "description": "Add a new task to the user's todo list",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "The user's ID"},
                            "title": {"type": "string", "description": "The title of the task"},
                            "description": {"type": "string", "description": "Optional description of the task"},
                            "due_date": {"type": "string", "format": "date-time", "description": "Optional due date in ISO format"},
                            "priority": {"type": "string", "enum": ["low", "medium", "high"], "description": "Priority level"}
                        },
                        "required": ["user_id", "title"]
                    }
                },
                {
                    "name": "list_tasks",
                    "description": "List the user's tasks with optional filtering",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "The user's ID"},
                            "status_filter": {"type": "string", "enum": ["all", "pending", "in_progress", "completed"], "description": "Filter by status"},
                            "priority_filter": {"type": "string", "enum": ["all", "low", "medium", "high"], "description": "Filter by priority"},
                            "limit": {"type": "integer", "description": "Maximum number of tasks to return"}
                        },
                        "required": ["user_id"]
                    }
                },
                {
                    "name": "complete_task",
                    "description": "Mark a task as completed",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "The user's ID"},
                            "task_id": {"type": "string", "description": "The ID of the task to complete"}
                        },
                        "required": ["user_id", "task_id"]
                    }
                },
                {
                    "name": "delete_task",
                    "description": "Delete a task from the user's list",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "The user's ID"},
                            "task_id": {"type": "string", "description": "The ID of the task to delete"}
                        },
                        "required": ["user_id", "task_id"]
                    }
                },
                {
                    "name": "update_task",
                    "description": "Update details of an existing task",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "The user's ID"},
                            "task_id": {"type": "string", "description": "The ID of the task to update"},
                            "title": {"type": "string", "description": "New title for the task"},
                            "description": {"type": "string", "description": "New description for the task"},
                            "status": {"type": "string", "enum": ["pending", "in_progress", "completed"], "description": "New status"},
                            "priority": {"type": "string", "enum": ["low", "medium", "high"], "description": "New priority"},
                            "due_date": {"type": "string", "format": "date-time", "description": "New due date in ISO format"}
                        },
                        "required": ["user_id", "task_id"]
                    }
                }
            ]

            # Prepare messages for the API call
            system_message = {
                "role": "system",
                "content": f"""You are a helpful AI assistant that manages todo lists through natural language.
                When users request to add, list, update, complete, or delete tasks, use the appropriate functions.
                The current user ID is {user_id}. Always ensure operations are scoped to this user only.
                Be helpful and confirm actions after performing them."""
            }

            user_message = {
                "role": "user",
                "content": message
            }

            all_messages = [system_message] + context_messages + [user_message]

            # Save the user's message to the database
            self._save_message_to_db(
                conversation_id=conv_uuid,
                user_id=user_uuid,
                content=message,
                sender_type="user",
                role="user"
            )

            # Call the OpenAI API with function calling
            response = self.client.chat.completions.create(
                model=self.model,
                messages=all_messages,
                functions=functions,
                function_call="auto",  # Auto-determine which function to call
                temperature=0.7,
                max_tokens=500
            )

            # Process the response
            message_response = response.choices[0].message
            actions_taken = []

            if message_response.function_call:
                # Execute the function call
                import json
                function_name = message_response.function_call.name
                function_args = json.loads(message_response.function_call.arguments)

                # In a real implementation, we would call the actual MCP tools here
                # For now, we'll simulate the result
                if function_name == "add_task":
                    # Simulate adding a task
                    result = {"success": True, "task_id": "fake-task-id", "message": f"Added task: {function_args.get('title')}"}
                    actions_taken.append({"action": "task_created", "details": {"task_id": "fake-task-id", "title": function_args.get('title')}})
                elif function_name == "list_tasks":
                    # Simulate listing tasks
                    result = {"success": True, "tasks": [{"id": "task1", "title": "Sample task", "status": "pending"}]}
                    actions_taken.append({"action": "list_returned", "details": {"task_count": 1, "tasks": [{"id": "task1", "title": "Sample task", "status": "pending"}]}})
                elif function_name == "complete_task":
                    # Simulate completing a task
                    result = {"success": True, "message": "Task completed"}
                    actions_taken.append({"action": "task_completed", "details": {"task_id": function_args.get('task_id')}})
                elif function_name == "delete_task":
                    # Simulate deleting a task
                    result = {"success": True, "message": "Task deleted"}
                    actions_taken.append({"action": "task_deleted", "details": {"task_id": function_args.get('task_id')}})
                elif function_name == "update_task":
                    # Simulate updating a task
                    result = {"success": True, "message": "Task updated"}
                    actions_taken.append({"action": "task_updated", "details": {"task_id": function_args.get('task_id')}})

                # Generate a natural language response based on the function result
                ai_response = f"I've processed your request. {result.get('message', 'Operation completed.')}"
            else:
                # No function was called, return the AI's natural response
                ai_response = message_response.content.strip()

            # Save the AI's response to the database
            self._save_message_to_db(
                conversation_id=conv_uuid,
                user_id=user_uuid,
                content=ai_response,
                sender_type="assistant",
                role="assistant"
            )

            return {
                "success": True,
                "conversation_id": str(conv_uuid),
                "response": ai_response,
                "actions_taken": actions_taken,
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"Error processing request: {str(e)}",
                "error_code": "INTERNAL_ERROR"
            }