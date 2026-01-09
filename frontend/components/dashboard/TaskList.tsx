'use client';

/**
 * TaskList Component - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * List container for tasks with empty state and loading skeleton.
 */

import React from 'react';
import { Task } from '@/types/task';
import TaskItem from './TaskItem';
import styles from '@/styles/components/TaskList.module.css';

interface TaskListProps {
  tasks: Task[];
  isLoading?: boolean;
  onTaskComplete: (taskId: string, isCompleted: boolean) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
}

export default function TaskList({
  tasks,
  isLoading = false,
  onTaskComplete,
  onTaskEdit,
  onTaskDelete,
}: TaskListProps) {
  // Loading skeleton
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSkeleton}>
          {[...Array(3)].map((_, index) => (
            <div key={index} className={styles.skeletonItem}>
              <div className={styles.skeletonCheckbox}></div>
              <div className={styles.skeletonContent}>
                <div className={styles.skeletonTitle}></div>
                <div className={styles.skeletonDescription}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (tasks.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            className={styles.emptyIcon}
          >
            <circle cx="60" cy="60" r="50" stroke="currentColor" strokeWidth="2" opacity="0.2" />
            <path
              d="M40 60L50 70L80 40"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.4"
            />
          </svg>
          <h3 className={styles.emptyTitle}>No tasks yet</h3>
          <p className={styles.emptyMessage}>
            Add your first task to get started on your productivity journey!
          </p>
        </div>
      </div>
    );
  }

  // Task list
  return (
    <div className={styles.container}>
      <div className={styles.taskList}>
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className={styles.taskItemWrapper}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <TaskItem
              task={task}
              onComplete={onTaskComplete}
              onEdit={onTaskEdit}
              onDelete={onTaskDelete}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
