'use client';

/**
 * ClientErrorBoundary - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * Client-side wrapper for ErrorBoundary to use in server components.
 */

import ErrorBoundary from './ErrorBoundary';

export default function ClientErrorBoundary({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
