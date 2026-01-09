/**
 * Task API Client - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * API methods for task management (CRUD operations).
 * Matches contracts/tasks.yaml endpoints.
 */

import { apiGet, apiPost, apiPatch, apiPut, apiDelete } from './client';
import {
  Task,
  TaskCreate,
  TaskUpdate,
  TaskListResponse,
  TaskFilters,
} from '@/types/task';
import { APIResponse } from '@/types/api';

/**
 * Get all tasks for the authenticated user
 * GET /api/tasks
 */
export async function getTasks(filters?: TaskFilters): Promise<APIResponse<TaskListResponse>> {
  // Build query string from filters
  const params = new URLSearchParams();

  if (filters) {
    if (filters.completed !== undefined) {
      params.append('completed', String(filters.completed));
    }
    if (filters.limit !== undefined) {
      params.append('limit', String(filters.limit));
    }
    if (filters.offset !== undefined) {
      params.append('offset', String(filters.offset));
    }
    if (filters.sort !== undefined) {
      params.append('sort', filters.sort);
    }
  }

  const queryString = params.toString();
  const endpoint = queryString ? `/api/tasks?${queryString}` : '/api/tasks';

  return apiGet<TaskListResponse>(endpoint);
}

/**
 * Create a new task
 * POST /api/tasks
 */
export async function createTask(taskData: TaskCreate): Promise<APIResponse<Task>> {
  return apiPost<Task>('/api/tasks', taskData);
}

/**
 * Update an existing task
 * PUT /api/tasks/:id
 */
export async function updateTask(taskId: string, updates: TaskUpdate): Promise<APIResponse<Task>> {
  return apiPut<Task>(`/api/tasks/${taskId}`, updates);
}

/**
 * Delete a task
 * DELETE /api/tasks/:id
 */
export async function deleteTask(taskId: string): Promise<APIResponse<void>> {
  return apiDelete<void>(`/api/tasks/${taskId}`);
}

/**
 * Mark a task as complete/incomplete
 * Convenience method for updating isCompleted field
 * PUT /api/tasks/:id
 */
export async function toggleTaskCompletion(
  taskId: string,
  isCompleted: boolean
): Promise<APIResponse<Task>> {
  return apiPut<Task>(`/api/tasks/${taskId}`, { is_completed: isCompleted });
}

/**
 * Get a single task by ID
 * GET /api/tasks/:id
 */
export async function getTaskById(taskId: string): Promise<APIResponse<Task>> {
  return apiGet<Task>(`/api/tasks/${taskId}`);
}
