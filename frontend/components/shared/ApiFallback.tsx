/**
 * API Fallback Component - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * Displayed when the Hugging Face Space API is unavailable.
 * Provides user feedback and retry functionality.
 */

'use client';

import { useState, useEffect, type CSSProperties, type ReactNode } from 'react';
import { ApiStatus } from '@/lib/config/api';
import { useApiHealth } from '@/lib/hooks/useApiHealth';

interface ApiFallbackProps {
  /** Content to show when API is available */
  children: ReactNode;
  /** Custom loading message */
  loadingMessage?: string;
  /** Whether to automatically wait for API */
  autoWait?: boolean;
}

export default function ApiFallback({
  children,
  loadingMessage = 'Connecting to server...',
  autoWait = true,
}: ApiFallbackProps) {
  const {
    status,
    message,
    isChecking,
    isAvailable,
    isWakingUp,
    waitForAvailable,
    checkHealth,
  } = useApiHealth({
    autoCheck: true,
    checkInterval: 15000,
    showWakingState: true,
  });

  const [isWaiting, setIsWaiting] = useState(false);
  const [waitAttempt, setWaitAttempt] = useState(0);

  // Auto-wait when component mounts and API is not available
  useEffect(() => {
    if (autoWait && !isAvailable && !isWaiting && status !== ApiStatus.Unknown) {
      handleWaitForApi();
    }
  }, [status, autoWait, isAvailable, isWaiting]);

  const handleWaitForApi = async () => {
    setIsWaiting(true);
    setWaitAttempt((prev) => prev + 1);
    try {
      await waitForAvailable();
    } finally {
      setIsWaiting(false);
    }
  };

  const handleRetry = async () => {
    await checkHealth();
  };

  // Show children when API is available
  if (isAvailable) {
    return <>{children}</>;
  }

  // Container styles
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
    padding: '40px 20px',
    textAlign: 'center',
    backgroundColor: 'var(--color-surface, rgba(0, 0, 0, 0.2))',
    borderRadius: '12px',
    margin: '20px',
  };

  const iconStyle: CSSProperties = {
    fontSize: '48px',
    marginBottom: '20px',
  };

  const titleStyle: CSSProperties = {
    fontSize: '24px',
    fontWeight: 600,
    color: 'var(--color-text, #ffffff)',
    marginBottom: '12px',
  };

  const messageStyle: CSSProperties = {
    fontSize: '16px',
    color: 'var(--color-text-secondary, #aaaaaa)',
    marginBottom: '24px',
    maxWidth: '400px',
  };

  const spinnerStyle: CSSProperties = {
    width: '40px',
    height: '40px',
    border: '3px solid var(--color-primary-light, #2d6a4f)',
    borderTopColor: 'var(--color-primary, #1a4d2e)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  };

  const buttonStyle: CSSProperties = {
    padding: '12px 24px',
    backgroundColor: 'var(--color-primary, #1a4d2e)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  };

  const secondaryButtonStyle: CSSProperties = {
    ...buttonStyle,
    backgroundColor: 'transparent',
    border: '1px solid var(--color-primary, #1a4d2e)',
    marginLeft: '12px',
  };

  const progressStyle: CSSProperties = {
    width: '200px',
    height: '4px',
    backgroundColor: 'var(--color-surface-light, rgba(255, 255, 255, 0.1))',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '16px',
  };

  const progressBarStyle: CSSProperties = {
    height: '100%',
    backgroundColor: 'var(--color-primary, #1a4d2e)',
    animation: 'progress 2s ease-in-out infinite',
  };

  // Determine which state to show
  if (isWaiting || isWakingUp || isChecking) {
    return (
      <div style={containerStyle} role="status" aria-live="polite">
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes progress {
            0% { width: 0%; margin-left: 0%; }
            50% { width: 50%; margin-left: 25%; }
            100% { width: 0%; margin-left: 100%; }
          }
        `}</style>
        <div style={spinnerStyle} aria-hidden="true" />
        <h2 style={titleStyle}>
          {isWakingUp ? 'Waking Up Server' : loadingMessage}
        </h2>
        <div style={progressStyle}>
          <div style={progressBarStyle} />
        </div>
        <p style={messageStyle}>
          {message}
          {waitAttempt > 1 && (
            <span style={{ display: 'block', marginTop: '8px', fontSize: '14px' }}>
              Attempt {waitAttempt} - This may take up to a minute...
            </span>
          )}
        </p>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary, #888)' }}>
          Free Hugging Face Spaces sleep after inactivity. Please wait while it starts up.
        </p>
      </div>
    );
  }

  // Offline or error state
  return (
    <div style={containerStyle} role="alert">
      <div style={iconStyle} aria-hidden="true">
        !
      </div>
      <h2 style={titleStyle}>
        {status === ApiStatus.Error ? 'Connection Error' : 'Server Unavailable'}
      </h2>
      <p style={messageStyle}>{message}</p>
      <div>
        <button
          style={buttonStyle}
          onClick={handleWaitForApi}
          disabled={isWaiting}
        >
          Wake Up Server
        </button>
        <button
          style={secondaryButtonStyle}
          onClick={handleRetry}
          disabled={isChecking}
        >
          Check Status
        </button>
      </div>
      <p
        style={{
          fontSize: '12px',
          color: 'var(--color-text-secondary, #666)',
          marginTop: '20px',
        }}
      >
        Having trouble? The server may be experiencing high load or maintenance.
      </p>
    </div>
  );
}
