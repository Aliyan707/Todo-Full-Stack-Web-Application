'use client';

/**
 * TaskItem Component - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * Individual task card with checkbox, title, description, and action buttons.
 */

import { useState } from 'react';
import { Task } from '@/types/task';
import styles from '@/styles/components/TaskItem.module.css';

interface TaskItemProps {
  task: Task;
  onComplete: (taskId: string, isCompleted: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskItem({ task, onComplete, onEdit, onDelete }: TaskItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleCheckboxChange = () => {
    onComplete(task.id, !task.isCompleted);
  };

  const handleEdit = () => {
    onEdit(task);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
    }
  };

  return (
    <div
      className={`${styles.taskItem} ${task.isCompleted ? styles.completed : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Checkbox */}
      <label className={styles.checkboxContainer}>
        <input
          type="checkbox"
          checked={task.isCompleted}
          onChange={handleCheckboxChange}
          className={styles.checkbox}
          aria-label={`Mark task "${task.title}" as ${task.isCompleted ? 'incomplete' : 'complete'}`}
        />
        <span className={styles.checkmark}></span>
      </label>

      {/* Task content */}
      <div className={styles.content}>
        <h3 className={styles.title}>{task.title}</h3>
        {task.description && <p className={styles.description}>{task.description}</p>}
        <div className={styles.meta}>
          <span className={styles.date}>
            Created: {new Date(task.createdAt).toLocaleDateString()}
          </span>
          {task.completedAt && (
            <span className={styles.date}>
              Completed: {new Date(task.completedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Action buttons - visible on hover */}
      <div className={`${styles.actions} ${isHovered ? styles.actionsVisible : ''}`}>
        <button
          onClick={handleEdit}
          className={styles.actionButton}
          aria-label={`Edit task "${task.title}"`}
          title="Edit task"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
            <path
              d="M14 2L18 6L6 18H2V14L14 2Z"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          className={`${styles.actionButton} ${styles.deleteButton}`}
          aria-label={`Delete task "${task.title}"`}
          title="Delete task"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
            <path
              d="M3 5H17M8 5V3H12V5M15 5V17C15 17.5304 14.7893 18.0391 14.4142 18.4142C14.0391 18.7893 13.5304 19 13 19H7C6.46957 19 5.96086 18.7893 5.58579 18.4142C5.21071 18.0391 5 17.5304 5 17V5H15Z"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
