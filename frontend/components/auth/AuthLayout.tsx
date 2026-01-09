'use client';

/**
 * AuthLayout Component - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * Split-screen layout for authentication pages.
 * Left side: Sign In, Right side: Sign Up
 */

import React from 'react';
import styles from '@/styles/components/AuthLayout.module.css';

interface AuthLayoutProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
}

export default function AuthLayout({ leftContent, rightContent }: AuthLayoutProps) {
  return (
    <div className={styles.layout}>
      <div className={styles.leftPanel}>{leftContent}</div>
      <div className={styles.rightPanel}>{rightContent}</div>
    </div>
  );
}
