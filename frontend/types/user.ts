/**
 * User Type Definitions - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * TypeScript interfaces for User entity (frontend types).
 * Maps to User entity from data-model.md.
 */

/**
 * User entity - represents an authenticated user account
 */
export interface User {
  id: string;                  // UUID as string
  email: string;               // User's email address
  displayName: string;         // User's display name (camelCase for TypeScript)
  createdAt: string;           // ISO 8601 date string
  updatedAt: string;           // ISO 8601 date string
}

/**
 * User registration payload
 * Used when creating a new user account
 */
export interface UserRegistration {
  email: string;               // Must be valid email format
  password: string;            // Min 8 chars, must contain uppercase, lowercase, number, special char
  displayName: string;         // Min 1 char, max 100 chars
}

/**
 * User login credentials
 * Used when signing in
 */
export interface UserCredentials {
  email: string;
  password: string;
}

/**
 * Authentication response
 * Returned from login/register endpoints
 */
export interface AuthResponse {
  user: User;
  token?: string;               // JWT authentication token (legacy)
  access_token?: string;        // JWT authentication token (Better Auth format)
  token_type?: string;          // Token type (usually "bearer")
  expiresAt?: string;           // ISO 8601 date string (7 days from issuance)
}

/**
 * Session information
 * Stored client-side for authentication state
 */
export interface Session {
  id: string;                  // UUID as string
  userId: string;              // UUID as string
  token: string;               // JWT token
  expiresAt: string;           // ISO 8601 date string
  createdAt: string;           // ISO 8601 date string
}

/**
 * Auth token (simplified for client storage)
 */
export interface AuthToken {
  token: string;
  expiresAt: string;
}
