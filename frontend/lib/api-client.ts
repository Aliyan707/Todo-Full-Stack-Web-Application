/**
 * API Client Module
 * Centralized fetch wrapper with JWT authentication and error handling
 * Supports Hugging Face Space deployment with automatic retry
 */

import { getAuthToken } from './auth';
import type { ApiError } from './types';
import { apiConfig, getApiUrl } from './config/api';

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
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
function isRetryableStatus(status: number): boolean {
  return status === 502 || status === 503 || status === 504;
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
  const url = getApiUrl(endpoint);
  let lastError: Error | undefined;
  let lastStatus = 0;

  for (let attempt = 0; attempt < apiConfig.retryAttempts; attempt++) {
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

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout);

      // Make the API request
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      lastStatus = response.status;

      // Check if we should retry
      if (!response.ok && isRetryableStatus(response.status) && attempt < apiConfig.retryAttempts - 1) {
        const delay = apiConfig.retryDelay * Math.pow(2, attempt);
        console.log(`[API] Retrying request (attempt ${attempt + 2}/${apiConfig.retryAttempts}) in ${delay}ms...`);
        await sleep(delay);
        continue;
      }

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
      lastError = error instanceof Error ? error : new Error(String(error));

      // Re-throw ApiClientError as-is (don't retry)
      if (error instanceof ApiClientError) {
        throw error;
      }

      // Check if we should retry network errors
      if (attempt < apiConfig.retryAttempts - 1) {
        const delay = apiConfig.retryDelay * Math.pow(2, attempt);
        console.log(`[API] Network error, retrying (attempt ${attempt + 2}/${apiConfig.retryAttempts}) in ${delay}ms...`);
        await sleep(delay);
        continue;
      }

      // Handle abort (timeout)
      if (lastError.name === 'AbortError') {
        throw new ApiClientError(
          'Request timed out. The server may be waking up - please try again.',
          408
        );
      }

      // Handle network errors
      if (lastError instanceof TypeError) {
        const message = apiConfig.huggingFaceSpace
          ? 'Cannot connect to API. The Hugging Face Space may be sleeping or starting up. Please wait a moment and try again.'
          : 'Connection failed. Please check your network connection.';
        throw new ApiClientError(message, 0);
      }

      // Handle unexpected errors
      throw new ApiClientError(
        'An unexpected error occurred. Please try again.',
        500
      );
    }
  }

  // All retries exhausted
  throw new ApiClientError(
    'Unable to reach the API after multiple attempts. The server may be sleeping.',
    lastStatus || 503
  );
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
        window.location.href = `/auth?returnUrl=${returnUrl}`;
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
      throw new ApiClientError(
        apiConfig.huggingFaceSpace
          ? 'The Hugging Face Space is starting up. Please wait a moment and try again.'
          : 'Service temporarily unavailable. Please try again later.',
        status,
        errorData
      );

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

/**
 * Export API configuration for use in components
 */
export { apiConfig } from './config/api';
