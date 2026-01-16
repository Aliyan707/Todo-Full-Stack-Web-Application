/**
 * TodoImagery Component - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * Displays To-Do app SVG illustration for authentication pages.
 */

import Image from 'next/image';
import styles from '@/styles/components/TodoImagery.module.css';

export default function TodoImagery() {
  return (
    <div className={styles.container}>
      <Image
        src="/images/todo-app-preview.svg"
        alt="To-Do app interface preview showing task list with checkmarks"
        width={400}
        height={300}
        className={styles.image}
        priority
      />
    </div>
  );
}
