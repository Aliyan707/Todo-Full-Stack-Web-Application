/**
 * useAuth Hook - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * Custom hook for accessing authentication context.
 */

import { useContext } from 'react';
import { AuthContext, AuthContextType } from '@/lib/contexts/AuthContext';

/**
 * Hook to access authentication state and methods
 * @returns AuthContextType object with user, isAuthenticated, isLoading, signIn, signUp, signOut
 * @throws Error if used outside of AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
