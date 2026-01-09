# UI Components Specification: Phase II Frontend

**Version**: 1.0.0
**Framework**: Next.js 15 (App Router) + React + TypeScript + Tailwind CSS
**Authentication**: Better Auth
**Created**: 2026-01-07
**Related Feature**: `001-phase-ii-specs`

---

## Overview

This document defines all UI components for the Phase II Todo Application frontend, including authentication components (login/signup) and task management components (CRUD operations). All components follow Next.js 15 App Router patterns, use TypeScript for type safety, Tailwind CSS for styling, and integrate with the REST API and Better Auth.

**Component Architecture**:
- **Server Components** (default): Static content, data fetching, layouts
- **Client Components** ('use client'): Interactive elements, forms, event handlers
- **Composition**: Nested components for reusability and maintainability

---

## Authentication Components

### 1. LoginForm

Allows users to log in with email and password.

#### Component Type

**Client Component** (requires form submission and state management)

#### File Location

`frontend/components/auth/LoginForm.tsx`

#### Props Interface

```typescript
interface LoginFormProps {
  onSuccess?: (user: { id: string; email: string }) => void
  redirectTo?: string  // Where to redirect after successful login (default: '/dashboard')
}
```

#### State Management

```typescript
interface LoginState {
  email: string
  password: string
  isSubmitting: boolean
  error: string | null
}
```

#### Component Structure

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/auth'

export function LoginForm({ onSuccess, redirectTo = '/dashboard' }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Call Better Auth login
      const result = await auth.api.signIn.email({
        email,
        password
      })

      if (result.error) {
        setError(result.error.message || 'Invalid email or password')
        return
      }

      // Success
      onSuccess?.(result.data.user)
      router.push(redirectTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded" role="alert">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Email input */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          placeholder="you@example.com"
        />
      </div>

      {/* Password input */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isSubmitting}
          minLength={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          placeholder="••••••••"
        />
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}
```

#### Accessibility

- Semantic HTML (form, label, input, button)
- ARIA role="alert" for error messages
- Proper label associations (htmlFor + id)
- Keyboard navigation (tab order)
- Disabled state during submission (prevents double-submit)
- Focus management (auto-focus on error)

#### API Integration

- **Endpoint**: POST /api/auth/login
- **Request**: `{ email: string, password: string }`
- **Success Response**: `{ access_token: string, user: { id, email } }`
- **Error Handling**: 401 → "Invalid email or password", 422 → "Invalid input"

---

### 2. SignupForm

Allows users to create a new account.

#### Component Type

**Client Component** (requires form submission and state management)

#### File Location

`frontend/components/auth/SignupForm.tsx`

#### Props Interface

```typescript
interface SignupFormProps {
  onSuccess?: (user: { id: string; email: string }) => void
  redirectTo?: string  // Where to redirect after successful signup (default: '/dashboard')
}
```

#### State Management

```typescript
interface SignupState {
  email: string
  password: string
  confirmPassword: string
  isSubmitting: boolean
  error: string | null
  validationErrors: {
    email?: string
    password?: string
    confirmPassword?: string
  }
}
```

#### Validation Rules

- **Email**: Valid email format
- **Password**: Minimum 8 characters
- **Confirm Password**: Must match password
- Real-time validation on blur
- Display field-level errors

#### API Integration

- **Endpoint**: POST /api/auth/register
- **Request**: `{ email: string, password: string }`
- **Success Response**: `{ id, email, created_at }`
- **Error Handling**: 409 → "Email already registered", 400 → Validation errors

---

### 3. AuthGuard

Wrapper component that protects routes requiring authentication.

#### Component Type

**Client Component** (needs useEffect for auth check)

#### File Location

`frontend/components/auth/AuthGuard.tsx`

#### Props Interface

```typescript
interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode  // What to show while checking auth (default: loading spinner)
  redirectTo?: string  // Where to redirect if not authenticated (default: '/login')
}
```

#### Implementation

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/auth'

export function AuthGuard({ children, fallback, redirectTo = '/login' }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      try {
        const session = await auth.api.getSession()

        if (session) {
          setIsAuthenticated(true)
        } else {
          // No session - redirect to login
          const currentPath = window.location.pathname
          router.push(`${redirectTo}?returnUrl=${encodeURIComponent(currentPath)}`)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push(redirectTo)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, redirectTo])

  if (isLoading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null  // Will redirect via useEffect
  }

  return <>{children}</>
}
```

#### Usage Example

```tsx
// app/dashboard/page.tsx
import { AuthGuard } from '@/components/auth/AuthGuard'
import { TaskList } from '@/components/tasks/TaskList'

export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">My Tasks</h1>
        <TaskList />
      </div>
    </AuthGuard>
  )
}
```

---

## Task Management Components

### 4. TaskList

Displays all tasks for the authenticated user.

#### Component Type

**Server Component** (default) with Client Component children for interactivity

#### File Location

`frontend/components/tasks/TaskList.tsx`

#### Props Interface

```typescript
interface TaskListProps {
  initialFilter?: 'all' | 'completed' | 'incomplete'
}
```

#### Server Component (Data Fetching)

```tsx
// frontend/components/tasks/TaskList.tsx
import { apiClient } from '@/lib/api-client'
import { TaskListClient } from './TaskListClient'

interface Task {
  id: string
  title: string
  description: string | null
  completed: boolean
  user_id: string
  created_at: string
  updated_at: string
}

export async function TaskList({ initialFilter = 'all' }: TaskListProps) {
  // Server-side data fetching
  const data = await apiClient<{ tasks: Task[]; total: number }>('/api/tasks')

  return <TaskListClient initialTasks={data.tasks} total={data.total} />
}
```

#### Client Component (Interactivity)

```tsx
'use client'

import { useState } from 'react'
import { TaskItem } from './TaskItem'

interface TaskListClientProps {
  initialTasks: Task[]
  total: number
}

export function TaskListClient({ initialTasks, total }: TaskListClientProps) {
  const [tasks, setTasks] = useState(initialTasks)
  const [filter, setFilter] = useState<'all' | 'completed' | 'incomplete'>('all')

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed
    if (filter === 'incomplete') return !task.completed
    return true
  })

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t))
  }

  const handleTaskDelete = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId))
  }

  return (
    <div className="space-y-4">
      {/* Filter buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          All ({tasks.length})
        </button>
        <button
          onClick={() => setFilter('incomplete')}
          className={`px-4 py-2 rounded ${filter === 'incomplete' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Incomplete ({tasks.filter(t => !t.completed).length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded ${filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Completed ({tasks.filter(t => t.completed).length})
        </button>
      </div>

      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No tasks found.</p>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdate={handleTaskUpdate}
              onDelete={handleTaskDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

#### API Integration

- **Endpoint**: GET /api/tasks
- **Query Params**: `?completed=true/false` (optional)
- **Response**: `{ tasks: Task[], total: number, limit: number, offset: number }`

---

### 5. TaskItem

Displays a single task with edit/delete actions.

#### Component Type

**Client Component** (interactive actions)

#### File Location

`frontend/components/tasks/TaskItem.tsx`

#### Props Interface

```typescript
interface TaskItemProps {
  task: Task
  onUpdate: (task: Task) => void
  onDelete: (taskId: string) => void
}
```

#### State Management

```typescript
interface TaskItemState {
  isEditing: boolean
  isDeleting: boolean
}
```

#### Component Structure

- Checkbox to toggle completion
- Task title and description display
- Edit button (opens TaskForm in edit mode)
- Delete button (opens confirmation modal)
- Loading states during API calls

#### API Integration

- **Toggle Completion**: PUT /api/tasks/:id with `{ completed: !task.completed }`
- **Delete**: DELETE /api/tasks/:id

---

### 6. TaskForm

Form for creating or editing a task.

#### Component Type

**Client Component** (form submission)

#### File Location

`frontend/components/tasks/TaskForm.tsx`

#### Props Interface

```typescript
interface TaskFormProps {
  mode: 'create' | 'edit'
  initialData?: Partial<Task>  // For edit mode
  onSuccess?: (task: Task) => void
  onCancel?: () => void
}
```

#### State Management

```typescript
interface TaskFormState {
  title: string
  description: string
  completed: boolean
  isSubmitting: boolean
  error: string | null
  validationErrors: {
    title?: string
  }
}
```

#### Validation Rules

- **Title**: Required, 1-200 characters
- **Description**: Optional, max 10000 characters
- Real-time character count for title
- Display validation errors

#### API Integration

- **Create**: POST /api/tasks with `{ title, description, completed }`
- **Edit**: PUT /api/tasks/:id with `{ title?, description?, completed? }`

---

### 7. TaskDeleteConfirm

Confirmation modal for task deletion.

#### Component Type

**Client Component** (modal with actions)

#### File Location

`frontend/components/tasks/TaskDeleteConfirm.tsx`

#### Props Interface

```typescript
interface TaskDeleteConfirmProps {
  task: Task
  isOpen: boolean
  onConfirm: () => Promise<void>
  onCancel: () => void
}
```

#### Component Structure

```tsx
'use client'

export function TaskDeleteConfirm({ task, isOpen, onConfirm, onCancel }: TaskDeleteConfirmProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Delete Task</h2>
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete "{task.title}"? This action cannot be undone.
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
```

#### Accessibility

- Focus trap (keyboard navigation stays within modal)
- ESC key to cancel
- ARIA role="dialog"
- aria-labelledby for title
- Focus management (auto-focus cancel button)

---

## Component Hierarchy

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx → LoginForm
│   └── signup/
│       └── page.tsx → SignupForm
│
└── dashboard/
    └── page.tsx → AuthGuard
        └── TaskList (Server Component)
            └── TaskListClient (Client Component)
                ├── TaskItem (per task)
                │   ├── TaskForm (edit mode)
                │   └── TaskDeleteConfirm (delete)
                └── TaskForm (create mode)
```

---

## Styling Guidelines (Tailwind CSS)

### Color Palette

| Purpose | Class | Hex |
|---------|-------|-----|
| Primary | bg-blue-600 | #2563EB |
| Primary Hover | bg-blue-700 | #1D4ED8 |
| Success | bg-green-600 | #16A34A |
| Error | bg-red-600 | #DC2626 |
| Warning | bg-yellow-500 | #EAB308 |
| Neutral | bg-gray-200 | #E5E7EB |
| Text Primary | text-gray-900 | #111827 |
| Text Secondary | text-gray-600 | #4B5563 |

### Typography

- **Headings**: font-bold
  - H1: text-2xl (24px)
  - H2: text-xl (20px)
  - H3: text-lg (18px)
- **Body**: text-base (16px)
- **Small**: text-sm (14px)

### Spacing

- Container: max-w-7xl mx-auto px-4
- Component Spacing: space-y-4 (1rem / 16px)
- Input Padding: px-3 py-2
- Button Padding: px-4 py-2

### Responsive Breakpoints

- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px

**Mobile-First Approach**: Design for mobile, enhance for desktop

```tsx
// Example: Stack on mobile, grid on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

---

## Error Handling

### API Error Scenarios

| Status Code | Scenario | Component Action |
|-------------|----------|------------------|
| 401 | Token expired/invalid | Clear session, redirect to /login |
| 403 | Insufficient permissions | Show "Access denied" message |
| 404 | Task not found | Show "Task not found" message |
| 422 | Validation error | Show field-level validation errors |
| 500 | Server error | Show "Something went wrong, please try again" |

### Error Display Pattern

```tsx
{error && (
  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded" role="alert">
    <p className="font-medium">Error</p>
    <p className="text-sm">{error}</p>
  </div>
)}
```

---

## Loading States

### Button Loading

```tsx
<button disabled={isSubmitting}>
  {isSubmitting ? (
    <>
      <span className="animate-spin inline-block mr-2">⏳</span>
      Loading...
    </>
  ) : (
    'Submit'
  )}
</button>
```

### Page Loading (Suspense)

```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react'
import { TaskList } from '@/components/tasks/TaskList'

function TaskListSkeleton() {
  return <div className="animate-pulse">Loading tasks...</div>
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<TaskListSkeleton />}>
      <TaskList />
    </Suspense>
  )
}
```

---

## TypeScript Interfaces

### Shared Types

```typescript
// lib/types.ts

export interface User {
  id: string
  email: string
  created_at: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  completed: boolean
  user_id: string
  created_at: string
  updated_at: string
}

export interface TaskCreate {
  title: string
  description?: string
  completed?: boolean
}

export interface TaskUpdate {
  title?: string
  description?: string | null
  completed?: boolean
}

export interface ApiError {
  error: string
  detail?: Record<string, string>
}

export interface TaskListResponse {
  tasks: Task[]
  total: number
  limit: number
  offset: number
}
```

---

**End of UI Components Specification**

**Related Documents**:
- `specs/api/rest-endpoints.md` - API endpoints (consumed by these components)
- `specs/skills/auth-bridge.md` - JWT authentication (used by AuthGuard)
- `specs/database/schema.md` - Data structure (matches TypeScript interfaces)
- `specs/001-phase-ii-specs/spec.md` - Master specification document

**Change Log**:
- 2026-01-07: v1.0.0 - Initial UI components specification for Phase II
