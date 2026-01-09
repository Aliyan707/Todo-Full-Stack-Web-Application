/**
 * TypeScript type definitions matching backend Pydantic models
 * These types mirror the FastAPI backend schemas exactly to prevent drift
 */

// User entity - matches backend User model
export interface User {
  id: string;            // UUID from backend
  email: string;         // Email address
  created_at: string;    // ISO 8601 datetime string
}

// Task priority levels
export type TaskPriority = 'low' | 'medium' | 'high';

// Task entity - matches backend Task model (extended with priority)
export interface Task {
  id: string;            // UUID
  title: string;         // Max 200 characters
  description: string;   // Can be empty string
  completed: boolean;    // Task completion status
  priority?: TaskPriority; // Optional priority level
  user_id: string;       // UUID of owner
  created_at: string;    // ISO 8601 datetime string
  updated_at: string;    // ISO 8601 datetime string
}

// Authentication response - matches backend token response
export interface AuthResponse {
  access_token: string;  // JWT token
  token_type: string;    // "bearer"
  user: User;            // User information
}

// Task creation request - matches backend TaskCreate schema (extended with priority)
export interface TaskCreateRequest {
  title: string;         // Required, max 200 chars
  description?: string;  // Optional
  completed?: boolean;   // Optional, defaults to false
  priority?: TaskPriority; // Optional priority level
}

// Task update request - matches backend TaskUpdate schema (extended with priority)
export interface TaskUpdateRequest {
  title?: string;        // Optional
  description?: string;  // Optional
  completed?: boolean;   // Optional
  priority?: TaskPriority; // Optional priority level
}

// Task list response - matches backend pagination response
export interface TaskListResponse {
  tasks: Task[];         // Array of tasks
  total: number;         // Total count
  limit: number;         // Page size
  offset: number;        // Starting position
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Registration data
export interface RegisterData {
  email: string;
  password: string;
}

// API Error response
export interface ApiError {
  detail: string | { msg: string; type: string }[];
  status?: number;
}

// Component prop types
export interface TaskFormProps {
  onSubmit: (task: TaskCreateRequest) => Promise<void>;
  initialData?: Partial<Task>;
  mode?: 'create' | 'edit';
  onCancel?: () => void;
}

export interface TaskItemProps {
  task: Task;
  onUpdate: (taskId: string, data: TaskUpdateRequest) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

export interface TaskDeleteConfirmProps {
  isOpen: boolean;
  taskTitle: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export interface AuthGuardProps {
  children: React.ReactNode;
}
