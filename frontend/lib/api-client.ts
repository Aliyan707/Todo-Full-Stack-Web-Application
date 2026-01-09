/**
 * API Client Module
 * Centralized fetch wrapper with JWT authentication and error handling
 */

import { getAuthToken } from './auth';
import type { ApiError } from './types';

// API base URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Custom error class for API errors
 */
export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/**
 * Generic API client with automatic JWT authentication
 *
 * @param endpoint - API endpoint path (e.g., '/api/tasks')
 * @param options - Fetch options (method, body, headers, etc.)
 * @returns Parsed JSON response
 * @throws ApiClientError with user-friendly messages
 */
export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    // Get JWT token for authentication
    const token = await getAuthToken();

    // Build headers with authentication
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Merge with custom headers from options
    const customHeaders = options?.headers;
    if (customHeaders) {
      if (customHeaders instanceof Headers) {
        customHeaders.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(customHeaders)) {
        customHeaders.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, customHeaders);
      }
    }

    // Make the API request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle different error status codes
    if (!response.ok) {
      await handleApiError(response);
    }

    // Handle 204 No Content (DELETE operations)
    if (response.status === 204) {
      return {} as T;
    }

    // Parse and return JSON response
    const data = await response.json();
    return data as T;
  } catch (error) {
    // Re-throw ApiClientError as-is
    if (error instanceof ApiClientError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError) {
      throw new ApiClientError(
        'Connection failed. Please check your network connection.',
        0
      );
    }

    // Handle unexpected errors
    throw new ApiClientError(
      'An unexpected error occurred. Please try again.',
      500
    );
  }
}

/**
 * Handle API error responses with user-friendly messages
 *
 * @param response - Fetch Response object
 * @throws ApiClientError with appropriate message
 */
async function handleApiError(response: Response): Promise<never> {
  const status = response.status;
  let errorMessage = 'An error occurred';
  let errorData: unknown;

  // Try to parse error response body
  try {
    errorData = await response.json();
    const apiError = errorData as ApiError;

    // Extract error message from FastAPI error format
    if (typeof apiError.detail === 'string') {
      errorMessage = apiError.detail;
    } else if (Array.isArray(apiError.detail)) {
      // Validation errors from Pydantic
      errorMessage = apiError.detail
        .map((err) => err.msg)
        .join(', ');
    }
  } catch {
    // Use status text if JSON parsing fails
    errorMessage = response.statusText || 'An error occurred';
  }

  // Handle specific HTTP status codes
  switch (status) {
    case 401:
      // Unauthorized - redirect to login
      if (typeof window !== 'undefined') {
        const returnUrl = encodeURIComponent(window.location.pathname);
        window.location.href = `/login?returnUrl=${returnUrl}`;
      }
      throw new ApiClientError('Session expired. Please log in again.', status, errorData);

    case 403:
      throw new ApiClientError('Access denied. You do not have permission to perform this action.', status, errorData);

    case 404:
      throw new ApiClientError('The requested resource was not found.', status, errorData);

    case 422:
      // Validation error - use extracted message
      throw new ApiClientError(errorMessage || 'Validation error. Please check your input.', status, errorData);

    case 500:
      throw new ApiClientError('Server error. Please try again later.', status, errorData);

    case 503:
      throw new ApiClientError('Service temporarily unavailable. Please try again later.', status, errorData);

    default:
      throw new ApiClientError(errorMessage, status, errorData);
  }
}

/**
 * API client wrapper for GET requests
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  return apiClient<T>(endpoint, { method: 'GET' });
}

/**
 * API client wrapper for POST requests
 */
export async function apiPost<T>(endpoint: string, data?: unknown): Promise<T> {
  return apiClient<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * API client wrapper for PUT requests
 */
export async function apiPut<T>(endpoint: string, data?: unknown): Promise<T> {
  return apiClient<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * API client wrapper for DELETE requests
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  return apiClient<T>(endpoint, { method: 'DELETE' });
}
