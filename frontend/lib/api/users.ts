/**
 * User/Auth API Client - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * API methods for user authentication (register, login, logout, get user).
 * Matches contracts/auth.yaml endpoints.
 */

import { apiGet, apiPost } from './client';
import {
  User,
  UserCredentials,
  UserRegistration,
  AuthResponse,
} from '@/types/user';
import { APIResponse } from '@/types/api';

/**
 * Register a new user account
 * POST /api/auth/register
 */
export async function register(userData: UserRegistration): Promise<APIResponse<AuthResponse>> {
  return apiPost<AuthResponse>('/api/auth/register', userData);
}

/**
 * Sign in with email and password
 * POST /api/auth/login
 */
export async function login(credentials: UserCredentials): Promise<APIResponse<AuthResponse>> {
  return apiPost<AuthResponse>('/api/auth/login', credentials);
}

/**
 * Sign out (client-side token removal)
 * Note: There's no server-side logout endpoint with JWT auth.
 * The client simply removes the token from storage.
 */
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
}

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
export async function getCurrentUser(): Promise<APIResponse<User>> {
  return apiGet<User>('/api/auth/me');
}

/**
 * Refresh user data from the server
 * Useful after token validation or on app initialization
 * GET /api/auth/me
 */
export async function refreshUserData(): Promise<APIResponse<User>> {
  return getCurrentUser();
}
