'use client';

/**
 * Input Component - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * Reusable input component with dark green theme styling.
 */

import React, { useId } from 'react';
import styles from '@/styles/components/Input.module.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  type = 'text',
  label,
  error,
  className = '',
  required = false,
  value,
  defaultValue,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = props.id || generatedId;

  const inputClassNames = [
    styles.input,
    error ? styles.error : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Determine if this is a controlled input (value is explicitly provided)
  const isControlled = value !== undefined;

  return (
    <div className={styles.container}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input
        {...props}
        id={inputId}
        type={type}
        className={inputClassNames}
        required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...(isControlled ? { value: value ?? '' } : { defaultValue })}
      />
      {error && (
        <span id={`${inputId}-error`} className={styles.errorMessage} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
