/**
 * useApiHealth Hook - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * React hook for monitoring Hugging Face Space API health status.
 * Provides real-time status updates with automatic retry logic.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiStatus, checkApiHealth } from '@/lib/config/api';

/**
 * Hook configuration options
 */
interface UseApiHealthOptions {
  /** Enable automatic health checks */
  autoCheck?: boolean;
  /** Interval between health checks in ms (default: 30000) */
  checkInterval?: number;
  /** Initial check delay in ms (default: 0) */
  initialDelay?: number;
  /** Whether to show waking up state for HF Spaces */
  showWakingState?: boolean;
}

/**
 * Hook return type
 */
interface UseApiHealthReturn {
  /** Current API status */
  status: ApiStatus;
  /** Human-readable status message */
  message: string;
  /** Last response time in ms (if available) */
  responseTime?: number;
  /** Last health check timestamp */
  lastChecked: Date | null;
  /** Whether a check is currently in progress */
  isChecking: boolean;
  /** Whether the API is considered available */
  isAvailable: boolean;
  /** Whether the API is waking up (HF Space specific) */
  isWakingUp: boolean;
  /** Manually trigger a health check */
  checkHealth: () => Promise<void>;
  /** Wait for the API to become available */
  waitForAvailable: () => Promise<boolean>;
}

/**
 * Hook for monitoring API health status
 *
 * @example
 * ```tsx
 * const { status, message, isAvailable, checkHealth } = useApiHealth();
 *
 * if (!isAvailable) {
 *   return <div>API is {status}: {message}</div>;
 * }
 * ```
 */
export function useApiHealth(options: UseApiHealthOptions = {}): UseApiHealthReturn {
  const {
    autoCheck = true,
    checkInterval = 30000,
    initialDelay = 0,
    showWakingState = true,
  } = options;

  const [status, setStatus] = useState<ApiStatus>(ApiStatus.Unknown);
  const [message, setMessage] = useState<string>('Checking API status...');
  const [responseTime, setResponseTime] = useState<number | undefined>(undefined);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const isMounted = useRef(true);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Perform a single health check
   */
  const checkHealth = useCallback(async (): Promise<void> => {
    if (isChecking) return;

    setIsChecking(true);

    try {
      const result = await checkApiHealth();

      if (!isMounted.current) return;

      setStatus(result.status);
      setMessage(result.message);
      setResponseTime(result.responseTime);
      setLastChecked(result.lastChecked);
    } catch (error) {
      if (!isMounted.current) return;

      setStatus(ApiStatus.Error);
      setMessage('Failed to check API health');
      setLastChecked(new Date());
    } finally {
      if (isMounted.current) {
        setIsChecking(false);
      }
    }
  }, [isChecking]);

  /**
   * Wait for API to become available
   * Useful when the HF Space is waking up
   */
  const waitForAvailable = useCallback(async (): Promise<boolean> => {
    const maxAttempts = 20;
    const delayMs = 3000;

    setIsChecking(true);
    setStatus(ApiStatus.Connecting);
    setMessage('Waiting for API to become available...');

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (!isMounted.current) return false;

      try {
        const result = await checkApiHealth();

        if (!isMounted.current) return false;

        setStatus(result.status);
        setMessage(result.message);
        setResponseTime(result.responseTime);
        setLastChecked(result.lastChecked);

        if (result.status === ApiStatus.Online) {
          setIsChecking(false);
          return true;
        }

        // Update message for HF Space waking up
        if (showWakingState && result.status === ApiStatus.Starting) {
          setMessage(`API is waking up... (attempt ${attempt + 1}/${maxAttempts})`);
        } else if (result.status === ApiStatus.Offline) {
          setMessage(`Waiting for API... (attempt ${attempt + 1}/${maxAttempts})`);
        }
      } catch {
        // Continue trying
      }

      // Wait before next attempt
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    if (isMounted.current) {
      setIsChecking(false);
      setStatus(ApiStatus.Offline);
      setMessage('API did not become available. Please try again later.');
    }

    return false;
  }, [showWakingState]);

  // Initial health check
  useEffect(() => {
    isMounted.current = true;

    if (autoCheck) {
      const timeoutId = setTimeout(() => {
        checkHealth();
      }, initialDelay);

      return () => {
        clearTimeout(timeoutId);
      };
    }

    return () => {
      isMounted.current = false;
    };
  }, [autoCheck, initialDelay, checkHealth]);

  // Periodic health checks
  useEffect(() => {
    if (!autoCheck || checkInterval <= 0) return;

    const intervalId = setInterval(() => {
      if (!isChecking) {
        checkHealth();
      }
    }, checkInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [autoCheck, checkInterval, isChecking, checkHealth]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, []);

  return {
    status,
    message,
    responseTime,
    lastChecked,
    isChecking,
    isAvailable: status === ApiStatus.Online,
    isWakingUp: status === ApiStatus.Starting || status === ApiStatus.Connecting,
    checkHealth,
    waitForAvailable,
  };
}

export default useApiHealth;
