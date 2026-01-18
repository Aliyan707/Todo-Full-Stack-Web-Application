# MCP Server Specification: AI-Powered Todo Interface

**Created**: 2026-01-17
**Feature**: AI-Powered Natural Language Todo Interface
**Branch**: 001-ai-todo-specs

## Overview

This specification defines the Model Context Protocol (MCP) tool definitions for task management operations. These tools will be exposed via the Official MCP SDK and callable by AI agents as per the protocol requirements.

## MCP Tool Definitions

### add_task Tool

**Purpose**: Creates a new task in the user's todo list based on natural language input

**Tool Name**: `add_task`

**Description**: Adds a new task to the user's todo list with the specified title and optional details. Parses natural language input to extract task information.

**Parameters**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "Unique identifier of the user creating the task"
    },
    "title": {
      "type": "string",
      "description": "Title of the task (1-255 characters)",
      "minLength": 1,
      "maxLength": 255
    },
    "description": {
      "type": "string",
      "description": "Detailed description of the task (optional)",
      "maxLength": 1000
    },
    "due_date": {
      "type": "string",
      "format": "date-time",
      "description": "Due date for the task in ISO 8601 format (optional)"
    },
    "priority": {
      "type": "string",
      "enum": ["low", "medium", "high"],
      "description": "Priority level of the task (default: medium)"
    }
  },
  "required": ["user_id", "title"]
}
```

**Returns**:
```json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean",
      "description": "Whether the operation was successful"
    },
    "task_id": {
      "type": "string",
      "description": "ID of the created task"
    },
    "message": {
      "type": "string",
      "description": "Human-readable message about the result"
    }
  }
}
```

**Behavior**:
- Creates a new task in the database with provided details
- Sets status to "pending" by default
- Returns the ID of the created task
- Validates that user_id corresponds to an authenticated user

### list_tasks Tool

**Purpose**: Retrieves a list of tasks for the specified user with optional filtering

**Tool Name**: `list_tasks`

**Description**: Gets a list of tasks for the user with optional filtering by status, priority, or date range.

**Parameters**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "Unique identifier of the user whose tasks to retrieve"
    },
    "status_filter": {
      "type": "string",
      "enum": ["all", "pending", "in_progress", "completed"],
      "description": "Filter tasks by status (default: all)"
    },
    "priority_filter": {
      "type": "string",
      "enum": ["all", "low", "medium", "high"],
      "description": "Filter tasks by priority (default: all)"
    },
    "limit": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100,
      "description": "Maximum number of tasks to return (default: 50)"
    }
  },
  "required": ["user_id"]
}
```

**Returns**:
```json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean",
      "description": "Whether the operation was successful"
    },
    "tasks": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "Task identifier"
          },
          "title": {
            "type": "string",
            "description": "Task title"
          },
          "description": {
            "type": "string",
            "description": "Task description"
          },
          "status": {
            "type": "string",
            "enum": ["pending", "in_progress", "completed"]
          },
          "priority": {
            "type": "string",
            "enum": ["low", "medium", "high"]
          },
          "due_date": {
            "type": "string",
            "format": "date-time"
          },
          "created_at": {
            "type": "string",
            "format": "date-time"
          }
        }
      }
    },
    "total_count": {
      "type": "integer",
      "description": "Total number of tasks matching the filters"
    }
  }
}
```

**Behavior**:
- Retrieves tasks associated with the specified user
- Applies filters if provided
- Limits results as specified
- Returns tasks in descending order of creation date

### complete_task Tool

**Purpose**: Marks a specific task as completed

**Tool Name**: `complete_task`

**Description**: Updates the status of a task to "completed" and sets the completion timestamp.

**Parameters**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "Unique identifier of the user who owns the task"
    },
    "task_id": {
      "type": "string",
      "description": "ID of the task to mark as completed"
    }
  },
  "required": ["user_id", "task_id"]
}
```

**Returns**:
```json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean",
      "description": "Whether the operation was successful"
    },
    "message": {
      "type": "string",
      "description": "Human-readable message about the result"
    }
  }
}
```

**Behavior**:
- Verifies that the task belongs to the specified user
- Updates the task status to "completed"
- Sets the completed_at timestamp to current time
- Returns confirmation of the operation

### delete_task Tool

**Purpose**: Removes a task from the user's todo list

**Tool Name**: `delete_task`

**Description**: Permanently deletes a task from the database if it belongs to the user.

**Parameters**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "Unique identifier of the user who owns the task"
    },
    "task_id": {
      "type": "string",
      "description": "ID of the task to delete"
    }
  },
  "required": ["user_id", "task_id"]
}
```

**Returns**:
```json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean",
      "description": "Whether the operation was successful"
    },
    "message": {
      "type": "string",
      "description": "Human-readable message about the result"
    }
  }
}
```

**Behavior**:
- Verifies that the task belongs to the specified user
- Deletes the task from the database
- Returns confirmation of the deletion

### update_task Tool

**Purpose**: Modifies an existing task's details

**Tool Name**: `update_task`

**Description**: Updates specific fields of an existing task with new values.

**Parameters**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "Unique identifier of the user who owns the task"
    },
    "task_id": {
      "type": "string",
      "description": "ID of the task to update"
    },
    "title": {
      "type": "string",
      "description": "New title for the task (optional)",
      "minLength": 1,
      "maxLength": 255
    },
    "description": {
      "type": "string",
      "description": "New description for the task (optional)",
      "maxLength": 1000
    },
    "status": {
      "type": "string",
      "enum": ["pending", "in_progress", "completed"],
      "description": "New status for the task (optional)"
    },
    "priority": {
      "type": "string",
      "enum": ["low", "medium", "high"],
      "description": "New priority for the task (optional)"
    },
    "due_date": {
      "type": "string",
      "format": "date-time",
      "description": "New due date for the task (optional)"
    }
  },
  "required": ["user_id", "task_id"]
}
```

**Returns**:
```json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean",
      "description": "Whether the operation was successful"
    },
    "message": {
      "type": "string",
      "description": "Human-readable message about the result"
    }
  }
}
```

**Behavior**:
- Verifies that the task belongs to the specified user
- Updates only the fields that are provided in the request
- Preserves unchanged fields
- Returns confirmation of the update

## MCP Protocol Compliance

- All tools follow the official MCP specification
- Stateless operation (no server-side session state)
- All state persisted in Neon PostgreSQL
- Proper error handling with appropriate status codes
- Authentication and authorization enforced at the application level