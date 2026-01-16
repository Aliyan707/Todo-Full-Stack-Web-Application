/**
 * API Client Utility - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * Centralized API client with:
 * - JWT token injection
 * - Hugging Face Space support
 * - Automatic retry with exponential backoff
 * - Comprehensive error handling
 */

import { APIError, APIRequestOptions, APIResponse } from '@/types/api';
import { getAuthToken } from '@/lib/contexts/AuthContext';
import { apiConfig, getApiUrl } from '@/lib/config/api';

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable (network errors, 503, 502)
 */
function isRetryableError(status: number, error?: Error): boolean {
  // Network errors are retryable
  if (error && (error.name === 'TypeError' || error.message.includes('fetch'))) {
    return true;
  }
  // Service unavailable (HF Space waking up)
  if (status === 503 || status === 502 || status === 504) {
    return true;
  }
  return false;
}

/**
 * Generic API request function with JWT token injection and retry logic
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

  const url = getApiUrl(endpoint);
  let lastError: Error | undefined;
  let lastStatus = 0;

  // Retry loop with exponential backoff
  for (let attempt = 0; attempt < apiConfig.retryAttempts; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      lastStatus = response.status;

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

      // Check if we should retry
      if (!response.ok && isRetryableError(response.status) && attempt < apiConfig.retryAttempts - 1) {
        const delay = apiConfig.retryDelay * Math.pow(2, attempt);
        console.log(`[API] Retrying request (attempt ${attempt + 2}/${apiConfig.retryAttempts}) in ${delay}ms...`);
        await sleep(delay);
        continue;
      }

      return {
        data,
        error,
        status: response.status,
      };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Check if we should retry
      if (isRetryableError(0, lastError) && attempt < apiConfig.retryAttempts - 1) {
        const delay = apiConfig.retryDelay * Math.pow(2, attempt);
        console.log(`[API] Network error, retrying (attempt ${attempt + 2}/${apiConfig.retryAttempts}) in ${delay}ms...`);
        await sleep(delay);
        continue;
      }

      // Handle abort (timeout)
      if (lastError.name === 'AbortError') {
        console.error('[API] Request timed out:', endpoint);
        return {
          error: {
            error: 'Request Timeout',
            message: 'The request took too long. The API may be waking up - please try again.',
            code: 'INTERNAL_ERROR',
          },
          status: 408,
        };
      }

      // Network error
      console.error('[API] Request failed:', err);
      return {
        error: {
          error: 'Network Error',
          message: getNetworkErrorMessage(lastError),
          code: 'INTERNAL_ERROR',
        },
        status: 0,
      };
    }
  }

  // All retries exhausted
  return {
    error: {
      error: 'Service Unavailable',
      message: 'Unable to reach the API after multiple attempts. The Hugging Face Space may be sleeping.',
      code: 'INTERNAL_ERROR',
    },
    status: lastStatus || 503,
  };
}

/**
 * Get user-friendly network error message
 */
function getNetworkErrorMessage(error: Error): string {
  // Check for common network errors
  if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
    if (apiConfig.huggingFaceSpace) {
      return 'Cannot connect to the API. The Hugging Face Space may be sleeping or starting up. Please wait a moment and try again.';
    }
    return 'Cannot connect to the API. Please check your internet connection.';
  }

  if (error.message.includes('NetworkError')) {
    return 'Network error occurred. Please check your internet connection and try again.';
  }

  if (error.message.includes('CORS')) {
    return 'Cross-origin request blocked. Please contact support.';
  }

  return error.message || 'Failed to connect to API';
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

/**
 * Export API configuration for use in components
 */
export { apiConfig, ApiStatus } from '@/lib/config/api';
