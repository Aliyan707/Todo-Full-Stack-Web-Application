'use client';

/**
 * DashboardHeader Component - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * Dashboard header with user display name and logout button.
 */

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Button from '@/components/shared/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import ChatPopup from '@/components/chat/ChatPopup';
import styles from '@/styles/components/DashboardHeader.module.css';

export default function DashboardHeader() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleLogout = () => {
    signOut();
    router.push('/');
  };

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.userInfo}>
            <h1 className={styles.greeting}>
              Welcome back, <span className={styles.userName}>{user?.displayName || 'User'}</span>
            </h1>
            <p className={styles.subtitle}>Organize your tasks and stay productive</p>
          </div>

          <div className={styles.actions}>
            <Button variant="primary" size="md" onClick={handleOpenChat} aria-label="AI Chat">
              AI Chat
            </Button>
            <Button variant="ghost" size="md" onClick={handleLogout} aria-label="Sign out">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <ChatPopup isOpen={isChatOpen} onClose={handleCloseChat} />
    </>
  );
}
