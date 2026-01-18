'use client';

/**
 * Chat Page - AI-Powered Natural Language Todo Interface
 * Feature: 001-ai-todo-specs
 *
 * Main page combining chat interface with task list display.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTasks } from '@/lib/hooks/useTasks';
import ChatInterface from '@/components/chat/ChatInterface';
import styles from './page.module.css';

export default function ChatPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { tasks, isLoading: tasksLoading, fetchTasks } = useTasks();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, authLoading, router]);

  // Refresh tasks periodically to sync with chat actions
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        fetchTasks();
      }, 5000); // Refresh every 5 seconds

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchTasks]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.chatSection}>
        <ChatInterface />
      </div>

      <div className={styles.tasksSection}>
        <div className={styles.tasksHeader}>
          <h3 className={styles.tasksTitle}>Your Tasks</h3>
          <button onClick={fetchTasks} className={styles.refreshButton} disabled={tasksLoading}>
            {tasksLoading ? '↻' : '⟳'} Refresh
          </button>
        </div>

        <div className={styles.tasksList}>
          {tasks.length === 0 ? (
            <div className={styles.emptyTasks}>
              <p>No tasks yet</p>
              <p className={styles.emptyHint}>Try asking the AI to create one!</p>
            </div>
          ) : (
            tasks.map((task, index) => (
              <div
                key={task.id}
                className={`${styles.taskItem} ${task.isCompleted ? styles.completed : ''}`}
              >
                <div className={styles.taskNumber}>{index + 1}</div>
                <div className={styles.taskContent}>
                  <div className={styles.taskTitle}>{task.title}</div>
                  {task.description && (
                    <div className={styles.taskDescription}>{task.description}</div>
                  )}
                </div>
                <div className={styles.taskStatus}>
                  {task.isCompleted ? '✓' : '○'}
                </div>
              </div>
            ))
          )}
        </div>

        {user && (
          <div className={styles.userInfo}>
            <p className={styles.userEmail}>{user.email}</p>
            <p className={styles.taskCount}>{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
          </div>
        )}
      </div>
    </div>
  );
}
