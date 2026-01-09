'use client';

/**
 * ErrorBoundary Component - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * Catches React errors and displays user-friendly error message.
 */

import React, { Component, ReactNode } from 'react';
import Button from './Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-background)',
            padding: 'var(--space-xl)',
          }}
        >
          <div
            style={{
              maxWidth: '600px',
              width: '100%',
              padding: 'var(--space-2xl)',
              backgroundColor: 'var(--color-surface)',
              borderRadius: '16px',
              border: '1px solid var(--color-border)',
              textAlign: 'center',
            }}
          >
            {/* Error icon */}
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              style={{ margin: '0 auto var(--space-xl)' }}
            >
              <circle cx="40" cy="40" r="38" stroke="var(--color-error)" strokeWidth="2" />
              <path
                d="M40 20V45M40 55V60"
                stroke="var(--color-error)"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>

            <h1
              style={{
                fontSize: '1.875rem',
                fontWeight: 700,
                color: 'var(--color-text)',
                margin: '0 0 var(--space-md)',
              }}
            >
              Oops! Something went wrong
            </h1>

            <p
              style={{
                fontSize: '1rem',
                color: 'var(--color-text-muted)',
                margin: '0 0 var(--space-lg)',
                lineHeight: 1.6,
              }}
            >
              We encountered an unexpected error. Please try again or contact support if the problem
              persists.
            </p>

            {this.state.error && process.env.NODE_ENV === 'development' && (
              <div
                style={{
                  padding: 'var(--space-md)',
                  backgroundColor: 'var(--color-primary-dark)',
                  borderRadius: '8px',
                  marginBottom: 'var(--space-lg)',
                  textAlign: 'left',
                }}
              >
                <code
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-error)',
                    wordBreak: 'break-word',
                  }}
                >
                  {this.state.error.toString()}
                </code>
              </div>
            )}

            <Button variant="primary" size="lg" onClick={this.handleReset}>
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
