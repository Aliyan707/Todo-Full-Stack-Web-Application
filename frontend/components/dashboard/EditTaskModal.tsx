'use client';

/**
 * EditTaskModal Component - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * Modal for editing existing tasks.
 */

import { useState, useEffect, FormEvent } from 'react';
import Modal from '@/components/shared/Modal';
import Input from '@/components/shared/Input';
import Button from '@/components/shared/Button';
import { Task } from '@/types/task';
import styles from '@/styles/components/EditTaskModal.module.css';

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskId: string, updates: { title: string; description?: string }) => Promise<void>;
}

export default function EditTaskModal({ task, isOpen, onClose, onSave }: EditTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form with task data when modal opens
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setErrors({});
    }
  }, [task]);

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

    if (!task) return;

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      await onSave(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
      });

      // Close modal on success
      onClose();
    } catch (error) {
      console.error('Failed to update task:', error);
      // Error is handled by the parent component
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
    }
  };

  if (!task) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Task">
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          type="text"
          label="Task Title"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          required
          disabled={isSaving}
          maxLength={200}
        />

        <div className={styles.textareaContainer}>
          <label htmlFor="edit-task-description" className={styles.textareaLabel}>
            Description (Optional)
          </label>
          <textarea
            id="edit-task-description"
            className={`${styles.textarea} ${errors.description ? styles.textareaError : ''}`}
            placeholder="Add more details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSaving}
            maxLength={5000}
            rows={4}
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

        <div className={styles.actions}>
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
