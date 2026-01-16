'use client';

/**
 * Authentication Context - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * Provides authentication state and methods across the application.
 * Uses centralized API configuration for Hugging Face Space integration.
 */

import { createContext, useState, useEffect, ReactNode } from 'react';
import { User, UserCredentials, UserRegistration, AuthResponse } from '@/types/user';
import { getApiUrl } from '@/lib/config/api';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (credentials: UserCredentials) => Promise<void>;
  signUp: (registration: UserRegistration) => Promise<void>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser) as User;

          // Check if token is expired
          const tokenData = parseJWT(storedToken);
          if (tokenData && tokenData.exp && tokenData.exp * 1000 > Date.now()) {
            setUser(parsedUser);
          } else {
            // Token expired, clear storage
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (credentials: UserCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      // Use centralized API config for proper HuggingFace Space URL handling
      const response = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        let errorMessage = 'Sign in failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          // Response is not JSON (e.g., "Internal Server Error")
          errorMessage = `Server error (${response.status}): Please try again later`;
        }
        throw new Error(errorMessage);
      }

      const authResponse: AuthResponse = await response.json();

      // Store token and user data
      const token = authResponse.access_token || authResponse.token;
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      }
      localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user));
      setUser(authResponse.user);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (registration: UserRegistration): Promise<void> => {
    setIsLoading(true);
    try {
      // Step 1: Register the user (using centralized API config)
      const registerResponse = await fetch(getApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registration.email,
          password: registration.password,
        }),
      });

      if (!registerResponse.ok) {
        let errorMessage = 'Sign up failed';
        try {
          const errorData = await registerResponse.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          // Response is not JSON (e.g., "Internal Server Error")
          errorMessage = `Server error (${registerResponse.status}): Please try again later`;
        }
        throw new Error(errorMessage);
      }

      // Step 2: Auto-login after successful registration
      const loginResponse = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registration.email,
          password: registration.password,
        }),
      });

      if (!loginResponse.ok) {
        let errorMessage = 'Auto-login failed after registration';
        try {
          const errorData = await loginResponse.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          errorMessage = `Server error (${loginResponse.status}): Please try again later`;
        }
        throw new Error(errorMessage);
      }

      const authResponse: AuthResponse = await loginResponse.json();

      // Store token and user data
      const token = authResponse.access_token || authResponse.token;
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      }
      localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user));
      setUser(authResponse.user);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = (): void => {
    // Clear stored auth data
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  // Don't render children until initial auth check completes to prevent blink
  if (isLoading) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Utility function to parse JWT token
function parseJWT(token: string): { exp?: number } | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to parse JWT:', error);
    return null;
  }
}

// Export function to get token (for API client)
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}
