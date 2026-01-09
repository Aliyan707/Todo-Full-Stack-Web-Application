/**
 * JWT Authentication Management
 * Simple localStorage-based token management for FastAPI backend
 *
 * Note: We're using a simplified approach without Better Auth library
 * since we're managing JWT tokens directly from the backend.
 */

/**
 * Get the JWT authentication token from the session
 * This token is used for authenticating with the backend API
 *
 * @returns JWT token string or null if not authenticated
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    // In a real implementation, this would extract the JWT from Better Auth session
    // For now, we'll use localStorage as a fallback (client-side only)
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

/**
 * Store JWT token in client storage
 * Called after successful login/registration
 *
 * @param token - JWT token from backend
 */
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
}

/**
 * Clear authentication token
 * Called during logout
 */
export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
}

/**
 * Check if user is authenticated
 *
 * @returns true if user has valid token
 */
export function isAuthenticated(): boolean {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    return token !== null && token.length > 0;
  }
  return false;
}
