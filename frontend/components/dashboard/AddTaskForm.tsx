'use client';

/**
 * AddTaskForm Component - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * Form for creating new tasks with title and description.
 */

import React, { useState, FormEvent } from 'react';
import Input from '@/components/shared/Input';
import Button from '@/components/shared/Button';
import styles from '@/styles/components/AddTaskForm.module.css';

interface AddTaskFormProps {
  onSubmit: (taskData: { title: string; description?: string }) => Promise<void>;
}

export default function AddTaskForm({ onSubmit }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: { title?: string; description?: string } = {};

    // Title validation
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > 200) {
      newErrors.title = 'Title must be 200 characters or less';
    }

    // Description validation (optional field)
    if (description && description.length > 5000) {
      newErrors.description = 'Description must be 5000 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
      });

      // Clear form on success
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Failed to create task:', error);
      // Error is handled by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formContent}>
        <Input
          type="text"
          label="Task Title"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          required
          disabled={isSubmitting}
          maxLength={200}
        />

        <div className={styles.textareaContainer}>
          <label htmlFor="task-description" className={styles.textareaLabel}>
            Description (Optional)
          </label>
          <textarea
            id="task-description"
            className={`${styles.textarea} ${errors.description ? styles.textareaError : ''}`}
            placeholder="Add more details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            maxLength={5000}
            rows={3}
          />
          {errors.description && (
            <span className={styles.errorMessage} role="alert">
              {errors.description}
            </span>
          )}
          <div className={styles.charCount}>
            {description.length} / 5000 characters
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting}
          className={styles.submitButton}
        >
          {isSubmitting ? 'Adding Task...' : 'Add Task'}
        </Button>
      </div>
    </form>
  );
}
