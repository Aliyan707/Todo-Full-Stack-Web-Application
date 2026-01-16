/**
 * Loading Component - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * Loading spinner with dark green theme and accessibility.
 */

import styles from '@/styles/components/Loading.module.css';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export default function Loading({ message = 'Loading, please wait', fullScreen = false }: LoadingProps) {
  const containerClass = fullScreen ? styles.fullScreen : styles.inline;

  return (
    <div className={containerClass} role="status" aria-live="polite" aria-busy="true">
      <div className={styles.spinner}>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
      </div>
      <p className={styles.message}>{message}</p>
      <span className="sr-only">{message}</span>
    </div>
  );
}
