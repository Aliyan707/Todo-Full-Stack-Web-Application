'use client';

/**
 * Button Component - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * Reusable button component with dark green theme variants.
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from '@/styles/components/Button.module.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  disabled = false,
  ...props
}: ButtonProps) {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    disabled ? styles.disabled : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classNames} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
