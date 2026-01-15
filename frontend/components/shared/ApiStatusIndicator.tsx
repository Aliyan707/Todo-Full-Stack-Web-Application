/**
 * API Status Indicator Component - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * Visual indicator for Hugging Face Space API status.
 * Shows connection status, loading states, and error messages.
 */

'use client';

import { useEffect, type CSSProperties } from 'react';
import { ApiStatus } from '@/lib/config/api';
import { useApiHealth } from '@/lib/hooks/useApiHealth';

interface ApiStatusIndicatorProps {
  /** Show detailed status information */
  showDetails?: boolean;
  /** Callback when API becomes available */
  onAvailable?: () => void;
  /** Custom class name */
  className?: string;
}

const STATUS_COLORS: Record<ApiStatus, string> = {
  [ApiStatus.Unknown]: '#888888',
  [ApiStatus.Connecting]: '#f39c12',
  [ApiStatus.Online]: '#2ecc71',
  [ApiStatus.Offline]: '#e74c3c',
  [ApiStatus.Error]: '#e74c3c',
  [ApiStatus.Starting]: '#f39c12',
};

const STATUS_LABELS: Record<ApiStatus, string> = {
  [ApiStatus.Unknown]: 'Unknown',
  [ApiStatus.Connecting]: 'Connecting',
  [ApiStatus.Online]: 'Online',
  [ApiStatus.Offline]: 'Offline',
  [ApiStatus.Error]: 'Error',
  [ApiStatus.Starting]: 'Starting',
};

export default function ApiStatusIndicator({
  showDetails = false,
  onAvailable,
  className = '',
}: ApiStatusIndicatorProps) {
  const {
    status,
    message,
    responseTime,
    isChecking,
    isAvailable,
    isWakingUp,
    checkHealth,
    waitForAvailable,
  } = useApiHealth({
    autoCheck: true,
    checkInterval: 30000,
  });

  // Notify when API becomes available
  useEffect(() => {
    if (isAvailable && onAvailable) {
      onAvailable();
    }
  }, [isAvailable, onAvailable]);

  const handleRetry = async () => {
    if (isWakingUp) {
      await waitForAvailable();
    } else {
      await checkHealth();
    }
  };

  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: showDetails ? '12px 16px' : '6px 12px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '8px',
    fontSize: showDetails ? '14px' : '12px',
  };

  const dotStyle: CSSProperties = {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: STATUS_COLORS[status],
    animation: isChecking || isWakingUp ? 'pulse 1.5s ease-in-out infinite' : 'none',
  };

  const labelStyle: CSSProperties = {
    color: STATUS_COLORS[status],
    fontWeight: 500,
  };

  const buttonStyle: CSSProperties = {
    padding: '4px 8px',
    backgroundColor: 'var(--color-primary, #1a4d2e)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    marginLeft: '8px',
  };

  return (
    <div className={className} style={containerStyle}>
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
      <div style={dotStyle} aria-hidden="true" />
      <span style={labelStyle}>{STATUS_LABELS[status]}</span>
      {showDetails && (
        <>
          <span style={{ color: 'var(--color-text-secondary, #888)' }}>|</span>
          <span style={{ color: 'var(--color-text-secondary, #aaa)' }}>
            {message}
          </span>
          {responseTime !== undefined && status === ApiStatus.Online && (
            <span style={{ color: 'var(--color-text-secondary, #888)' }}>
              ({responseTime}ms)
            </span>
          )}
          {(status === ApiStatus.Offline || status === ApiStatus.Error) && (
            <button
              style={buttonStyle}
              onClick={handleRetry}
              disabled={isChecking}
            >
              {isChecking ? 'Checking...' : 'Retry'}
            </button>
          )}
        </>
      )}
      <span className="sr-only">
        API Status: {STATUS_LABELS[status]}. {message}
      </span>
    </div>
  );
}

/**
 * Compact API status dot for headers/navigation
 */
export function ApiStatusDot({ className = '' }: { className?: string }) {
  const { status, isChecking } = useApiHealth({
    autoCheck: true,
    checkInterval: 60000,
  });

  const dotStyle: CSSProperties = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: STATUS_COLORS[status],
    animation: isChecking ? 'pulse 1.5s ease-in-out infinite' : 'none',
  };

  return (
    <div
      className={className}
      style={dotStyle}
      title={`API: ${STATUS_LABELS[status]}`}
      aria-label={`API status: ${STATUS_LABELS[status]}`}
    />
  );
}
