'use client';

/**
 * Dashboard Page - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * Main dashboard for task management with CRUD operations.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTasks } from '@/lib/hooks/useTasks';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import AddTaskForm from '@/components/dashboard/AddTaskForm';
import TaskList from '@/components/dashboard/TaskList';
import EditTaskModal from '@/components/dashboard/EditTaskModal';
import FloatingChatButton from '@/components/chat/FloatingChatButton';
import { Task } from '@/types/task';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { tasks, isLoading, error, addTask, updateTaskData, deleteTask, markComplete } =
    useTasks();

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, authLoading, router]);

  // Don't render anything while checking authentication
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text)' }}>Loading...</p>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleAddTask = async (taskData: { title: string; description?: string }) => {
    try {
      await addTask(taskData);
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (
    taskId: string,
    updates: { title: string; description?: string }
  ) => {
    try {
      await updateTaskData(taskId, updates);
      setIsEditModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleToggleComplete = async (taskId: string, isCompleted: boolean) => {
    try {
      await markComplete(taskId, isCompleted);
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      <DashboardHeader />

      <main style={{ paddingTop: 'var(--space-2xl)' }}>
        {error && (
          <div
            style={{
              maxWidth: '800px',
              margin: '0 auto var(--space-lg)',
              padding: 'var(--space-md)',
              backgroundColor: 'rgba(231, 76, 60, 0.1)',
              border: '1px solid var(--color-error)',
              borderRadius: '8px',
              color: 'var(--color-error)',
            }}
            role="alert"
          >
            {error}
          </div>
        )}

        <AddTaskForm onSubmit={handleAddTask} />

        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          onTaskComplete={handleToggleComplete}
          onTaskEdit={handleEditTask}
          onTaskDelete={handleDeleteTask}
        />
      </main>

      <EditTaskModal
        task={editingTask}
        isOpen={isEditModalOpen}
        onClose={handleCloseEdit}
        onSave={handleSaveEdit}
      />

      <FloatingChatButton />
    </div>
  );
}
