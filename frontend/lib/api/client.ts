/**
 * API Client Utility - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * Centralized API client with JWT token injection and error handling.
 */

import { APIError, APIRequestOptions, APIResponse } from '@/types/api';
import { getAuthToken } from '@/lib/contexts/AuthContext';

// Base API URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Generic API request function with JWT token injection
 */
async function apiRequest<T>(
  endpoint: string,
  options: APIRequestOptions = {}
): Promise<APIResponse<T>> {
  const { method = 'GET', headers = {}, body, token } = options;

  // Get JWT token from auth context or parameter
  const authToken = token || getAuthToken();

  // Build headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add Authorization header if token exists
  if (authToken) {
    requestHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  // Build fetch options
  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders,
  };

  // Add body if present (and not GET request)
  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, fetchOptions);

    // Parse response body
    let data: T | undefined;
    let error: APIError | undefined;

    // Handle 204 No Content responses
    if (response.status === 204) {
      data = undefined as T;
    } else {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const jsonData = await response.json();

        if (response.ok) {
          data = jsonData as T;
        } else {
          // API returned an error response
          error = jsonData as APIError;
        }
      }
    }

    // Handle non-OK responses without JSON body
    if (!response.ok && !error) {
      error = {
        error: response.statusText || 'Request failed',
        message: `HTTP ${response.status}: ${response.statusText}`,
        code: 'INTERNAL_ERROR',
      };
    }

    return {
      data,
      error,
      status: response.status,
    };
  } catch (err) {
    // Network error or other fetch failure
    console.error('API request failed:', err);

    return {
      error: {
        error: 'Network Error',
        message: err instanceof Error ? err.message : 'Failed to connect to API',
        code: 'INTERNAL_ERROR',
      },
      status: 0,
    };
  }
}

/**
 * GET request
 */
export async function apiGet<T>(
  endpoint: string,
  options?: APIRequestOptions
): Promise<APIResponse<T>> {
  return apiRequest<T>(endpoint, { ...options, method: 'GET' });
}

/**
 * POST request
 */
export async function apiPost<T>(
  endpoint: string,
  body?: unknown,
  options?: APIRequestOptions
): Promise<APIResponse<T>> {
  return apiRequest<T>(endpoint, { ...options, method: 'POST', body });
}

/**
 * PATCH request
 */
export async function apiPatch<T>(
  endpoint: string,
  body?: unknown,
  options?: APIRequestOptions
): Promise<APIResponse<T>> {
  return apiRequest<T>(endpoint, { ...options, method: 'PATCH', body });
}

/**
 * PUT request
 */
export async function apiPut<T>(
  endpoint: string,
  body?: unknown,
  options?: APIRequestOptions
): Promise<APIResponse<T>> {
  return apiRequest<T>(endpoint, { ...options, method: 'PUT', body });
}

/**
 * DELETE request
 */
export async function apiDelete<T>(
  endpoint: string,
  options?: APIRequestOptions
): Promise<APIResponse<T>> {
  return apiRequest<T>(endpoint, { ...options, method: 'DELETE' });
}

/**
 * Helper to check if API response has an error
 */
export function isAPIError<T>(response: APIResponse<T>): response is APIResponse<T> & { error: APIError } {
  return response.error !== undefined;
}

/**
 * Helper to extract data from API response or throw error
 */
export function unwrapAPIResponse<T>(response: APIResponse<T>): T {
  if (isAPIError(response)) {
    throw new Error(response.error.message);
  }

  if (response.data === undefined) {
    throw new Error('API response missing data');
  }

  return response.data;
}
