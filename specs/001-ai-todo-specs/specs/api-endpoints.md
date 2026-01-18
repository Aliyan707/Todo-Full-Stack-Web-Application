# API Endpoints Specification: AI-Powered Todo Interface

**Created**: 2026-01-17
**Feature**: AI-Powered Natural Language Todo Interface
**Branch**: 001-ai-todo-specs

## Overview

This specification details the stateless API endpoint for the chat functionality that integrates with the OpenAI Agents SDK. The endpoint follows the stateless architecture principle by maintaining no in-memory state between requests.

## Endpoint Definition

### POST /api/{user_id}/chat

**Purpose**: Handles natural language chat requests from users and processes them through the AI agent system

**Method**: POST

**Path Parameters**:
- `{user_id}`: UUID - The unique identifier of the authenticated user making the request

**Headers**:
- `Authorization`: Bearer {token} - JWT token for user authentication
- `Content-Type`: application/json - Required content type
- `Accept`: application/json - Expected response format

**Request Body**:
```json
{
  "type": "object",
  "properties": {
    "message": {
      "type": "string",
      "description": "The natural language message from the user",
      "minLength": 1,
      "maxLength": 10000
    },
    "conversation_id": {
      "type": "string",
      "format": "uuid",
      "description": "Optional ID of the conversation to continue (creates new if omitted)"
    },
    "metadata": {
      "type": "object",
      "description": "Additional context or metadata for the request (optional)",
      "properties": {
        "timezone": {
          "type": "string",
          "description": "User's timezone for date/time processing"
        },
        "locale": {
          "type": "string",
          "description": "User's preferred locale"
        }
      }
    }
  },
  "required": ["message"]
}
```

**Example Request**:
```json
{
  "message": "Add a task to buy groceries tomorrow",
  "metadata": {
    "timezone": "America/New_York"
  }
}
```

## Response Format

### Success Response (200 OK)
```json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean",
      "const": true
    },
    "conversation_id": {
      "type": "string",
      "format": "uuid",
      "description": "ID of the conversation (newly created or continued)"
    },
    "response": {
      "type": "string",
      "description": "The AI-generated response to the user's message"
    },
    "actions_taken": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "action": {
            "type": "string",
            "enum": ["task_created", "task_updated", "task_completed", "task_deleted", "list_returned", "none"],
            "description": "Action performed as a result of the natural language processing"
          },
          "details": {
            "type": "object",
            "description": "Specific details about the action taken"
          }
        }
      }
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "Timestamp when the response was generated"
    }
  },
  "required": ["success", "conversation_id", "response", "actions_taken", "timestamp"]
}
```

**Example Success Response**:
```json
{
  "success": true,
  "conversation_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "response": "I've added the task 'Buy groceries' to your list for tomorrow.",
  "actions_taken": [
    {
      "action": "task_created",
      "details": {
        "task_id": "f0e9d8c7-b6a5-4321-fedc-ba9876543210",
        "title": "Buy groceries",
        "due_date": "2026-01-18T00:00:00Z"
      }
    }
  ],
  "timestamp": "2026-01-17T15:30:45.123Z"
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean",
      "const": false
    },
    "error": {
      "type": "string",
      "description": "Error message describing what went wrong"
    },
    "error_code": {
      "type": "string",
      "description": "Machine-readable error code"
    }
  },
  "required": ["success", "error", "error_code"]
}
```

#### 401 Unauthorized
Returned when the Authorization header is missing or invalid.

#### 403 Forbidden
Returned when the user tries to access data belonging to another user.

#### 429 Too Many Requests
Returned when rate limiting is triggered.

#### 500 Internal Server Error
Returned when an unexpected server error occurs.

## Business Logic Flow

1. **Authentication**: Verify the user's JWT token and extract user_id
2. **Validation**: Validate the request body and parameters
3. **Rate Limiting**: Apply rate limiting based on user_id
4. **Conversation Retrieval/Create**: Get existing conversation or create new one
5. **Message Persistence**: Save the user's message to the database
6. **AI Processing**: Send the message to the OpenAI Agent for natural language processing
7. **MCP Tool Invocation**: Based on AI interpretation, invoke appropriate MCP tools
8. **Response Generation**: Generate AI response based on tool results
9. **Response Persistence**: Save the AI's response to the database
10. **Return Response**: Return the formatted response to the client

## Statelessness Requirements

- No session state stored on the server between requests
- All conversation context retrieved from database
- All user context retrieved from authentication token and database
- All task data retrieved from database via MCP tools
- Response contains all necessary information for client-side state management

## Security Considerations

- JWT token validation for every request
- User data isolation - users can only access their own data
- Input sanitization to prevent injection attacks
- Rate limiting to prevent abuse
- Message length limits to prevent denial-of-service

## Performance Considerations

- Database connection pooling
- Efficient indexing for quick data retrieval
- Caching of frequently accessed data where appropriate
- Asynchronous processing for long-running operations
- Timeout handling for AI service calls