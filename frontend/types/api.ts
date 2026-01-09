/**
 * API Type Definitions - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * TypeScript interfaces for API responses and error handling.
 */

/**
 * Standard API error response
 * Matches ErrorResponse schema from contracts/auth.yaml and contracts/tasks.yaml
 */
export interface APIError {
  error: string;               // Error title
  message: string;             // Human-readable error message
  code: ErrorCode;             // Machine-readable error code
  details?: Record<string, unknown>; // Optional additional error details
}

/**
 * Error codes from API contracts
 */
export type ErrorCode =
  // Auth errors
  | 'INVALID_EMAIL'
  | 'WEAK_PASSWORD'
  | 'MISSING_FIELD'
  | 'EMAIL_EXISTS'
  | 'INVALID_CREDENTIALS'
  | 'RATE_LIMIT_EXCEEDED'
  | 'NO_TOKEN'
  | 'INVALID_TOKEN'
  | 'EXPIRED_TOKEN'
  // Task errors
  | 'TITLE_TOO_LONG'
  | 'DESCRIPTION_TOO_LONG'
  | 'EMPTY_TITLE'
  | 'TASK_NOT_FOUND'
  | 'UNAUTHORIZED'
  // General errors
  | 'INTERNAL_ERROR';

/**
 * Generic API response wrapper
 */
export interface APIResponse<T> {
  data?: T;
  error?: APIError;
  status: number;
}

/**
 * API request options
 */
export interface APIRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  token?: string;              // JWT token for authenticated requests
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  limit?: number;              // Items per page
  offset?: number;             // Skip items
}

/**
 * Sort parameters
 */
export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}
