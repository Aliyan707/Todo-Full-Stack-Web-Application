/**
 * useTasks Hook - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * Custom hook for task management with optimistic updates and error handling.
 */

import { useState, useEffect, useCallback } from 'react';
import { Task, TaskCreate, TaskUpdate } from '@/types/task';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask as deleteTaskAPI,
  toggleTaskCompletion,
} from '@/lib/api/tasks';
import { unwrapAPIResponse } from '@/lib/api/client';

interface UseTasksReturn {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  addTask: (taskData: TaskCreate) => Promise<void>;
  updateTaskData: (taskId: string, updates: TaskUpdate) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  markComplete: (taskId: string, isCompleted: boolean) => Promise<void>;
}

export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all tasks from API
   */
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getTasks();
      const data = unwrapAPIResponse(response);
      setTasks(data.tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
      console.error('Fetch tasks error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Add a new task with optimistic update
   */
  const addTask = useCallback(
    async (taskData: TaskCreate) => {
      // Create optimistic task
      const optimisticTask: Task = {
        id: `temp-${Date.now()}`, // Temporary ID
        userId: 'temp-user',
        title: taskData.title,
        description: taskData.description || null,
        isCompleted: false,
        completedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistic update
      setTasks((prev) => [optimisticTask, ...prev]);

      try {
        const response = await createTask(taskData);
        const createdTask = unwrapAPIResponse(response);

        // Replace optimistic task with real task
        setTasks((prev) =>
          prev.map((task) => (task.id === optimisticTask.id ? createdTask : task))
        );
      } catch (err) {
        // Rollback on failure
        setTasks((prev) => prev.filter((task) => task.id !== optimisticTask.id));
        setError(err instanceof Error ? err.message : 'Failed to create task');
        throw err;
      }
    },
    []
  );

  /**
   * Update task with optimistic update
   */
  const updateTaskData = useCallback(async (taskId: string, updates: TaskUpdate) => {
    // Store previous state for rollback using ref
    let previousTasks: Task[] = [];

    // Optimistic update
    setTasks((prev) => {
      previousTasks = prev; // Capture for rollback
      return prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : task
      );
    });

    try {
      const response = await updateTask(taskId, updates);
      const updatedTask = unwrapAPIResponse(response);

      // Replace with server response
      setTasks((prev) => prev.map((task) => (task.id === taskId ? updatedTask : task)));
    } catch (err) {
      // Rollback on failure
      setTasks(previousTasks);
      setError(err instanceof Error ? err.message : 'Failed to update task');
      throw err;
    }
  }, []);

  /**
   * Delete task with optimistic update
   */
  const deleteTask = useCallback(async (taskId: string) => {
    // Store task for rollback
    let taskToDelete: Task | undefined;

    // Optimistic update
    setTasks((prev) => {
      taskToDelete = prev.find((task) => task.id === taskId);
      if (!taskToDelete) return prev;
      return prev.filter((task) => task.id !== taskId);
    });

    if (!taskToDelete) return;

    try {
      await deleteTaskAPI(taskId);
    } catch (err) {
      // Rollback on failure
      setTasks((prev) => [...prev, taskToDelete!]);
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      throw err;
    }
  }, []);

  /**
   * Mark task as complete/incomplete with optimistic update
   */
  const markComplete = useCallback(
    async (taskId: string, isCompleted: boolean) => {
      // Store previous state for rollback
      let previousTasks: Task[] = [];

      // Optimistic update
      setTasks((prev) => {
        previousTasks = prev; // Capture for rollback
        return prev.map((task) =>
          task.id === taskId
            ? {
                ...task,
                isCompleted,
                completedAt: isCompleted ? new Date().toISOString() : null,
                updatedAt: new Date().toISOString(),
              }
            : task
        );
      });

      try {
        const response = await toggleTaskCompletion(taskId, isCompleted);
        const updatedTask = unwrapAPIResponse(response);

        // Replace with server response
        setTasks((prev) => prev.map((task) => (task.id === taskId ? updatedTask : task)));
      } catch (err) {
        // Rollback on failure
        setTasks(previousTasks);
        setError(err instanceof Error ? err.message : 'Failed to update task completion');
        throw err;
      }
    },
    []
  );

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    isLoading,
    error,
    fetchTasks,
    addTask,
    updateTaskData,
    deleteTask,
    markComplete,
  };
}
