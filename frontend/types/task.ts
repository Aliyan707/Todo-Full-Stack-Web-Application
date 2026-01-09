/**
 * Task Type Definitions - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * TypeScript interfaces for Task entity (frontend types).
 * Maps to Task entity from data-model.md.
 */

/**
 * Task entity - represents a to-do task
 */
export interface Task {
  id: string;                  // UUID as string
  userId: string;              // UUID as string (owner)
  title: string;               // Task title (1-200 chars)
  description: string | null;  // Optional task description (max 5000 chars)
  isCompleted: boolean;        // Completion status
  completedAt: string | null;  // ISO 8601 date string or null
  createdAt: string;           // ISO 8601 date string
  updatedAt: string;           // ISO 8601 date string
}

/**
 * Task creation payload
 * Used when creating a new task
 */
export interface TaskCreate {
  title: string;               // Required, 1-200 chars
  description?: string | null; // Optional, max 5000 chars
}

/**
 * Task update payload
 * Used when updating an existing task (partial updates supported)
 */
export interface TaskUpdate {
  title?: string;              // Optional, 1-200 chars
  description?: string | null; // Optional, max 5000 chars
  isCompleted?: boolean;       // Optional, toggle completion status
}

/**
 * Task list response
 * Returned from GET /api/tasks endpoint
 */
export interface TaskListResponse {
  tasks: Task[];               // Array of tasks
  total: number;               // Total count of tasks
}

/**
 * Task filter options
 * Used for querying tasks
 */
export interface TaskFilters {
  completed?: boolean;         // Filter by completion status
  limit?: number;              // Maximum tasks to return (default 500)
  offset?: number;             // Pagination offset (default 0)
  sort?: 'createdAt:asc' | 'createdAt:desc' | 'updatedAt:asc' | 'updatedAt:desc';
}
