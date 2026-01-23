'use client';

/**
 * Modern Dashboard - AI Todo Application
 * Beautiful dark theme with sidebar and task management
 */

import { useState } from 'react';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Complete project proposal',
      description: 'Write and submit the Q1 project proposal',
      completed: false,
      priority: 'high',
      createdAt: new Date(),
    },
    {
      id: '2',
      title: 'Review pull requests',
      description: 'Check and approve pending PRs',
      completed: false,
      priority: 'medium',
      createdAt: new Date(),
    },
    {
      id: '3',
      title: 'Update documentation',
      description: 'Add API documentation for new endpoints',
      completed: true,
      priority: 'low',
      createdAt: new Date(),
    },
  ]);

  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' as const });
  const [showAddForm, setShowAddForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      completed: false,
      priority: newTask.priority,
      createdAt: new Date(),
    };

    setTasks([task, ...tasks]);
    setNewTask({ title: '', description: '', priority: 'medium' });
    setShowAddForm(false);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    high: tasks.filter(t => t.priority === 'high' && !t.completed).length,
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
      {/* Sidebar */}
      <aside
        className="sidebar"
        style={{
          width: sidebarOpen ? '280px' : '80px',
          transition: 'width 0.3s ease',
        }}
      >
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: sidebarOpen ? '1.5rem' : '1rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem',
          }}>
            {sidebarOpen ? 'AI Todo' : 'AI'}
          </h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'transparent',
              border: '1px solid #374151',
              padding: '0.5rem',
              fontSize: '1rem',
            }}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {sidebarOpen && (
          <>
            <nav style={{ marginBottom: '2rem' }}>
              <div style={{
                padding: '0.75rem 1rem',
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '8px',
                marginBottom: '0.5rem',
                borderLeft: '3px solid #3b82f6',
              }}>
                <span style={{ fontSize: '1.25rem', marginRight: '0.75rem' }}>📋</span>
                <span style={{ color: '#3b82f6', fontWeight: '500' }}>All Tasks</span>
              </div>
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#1f2937'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: '1.25rem', marginRight: '0.75rem' }}>⭐</span>
                <span>Important</span>
              </div>
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#1f2937'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: '1.25rem', marginRight: '0.75rem' }}>✅</span>
                <span>Completed</span>
              </div>
            </nav>

            <div style={{
              padding: '1rem',
              background: '#1a1a1a',
              borderRadius: '8px',
              border: '1px solid #2d3748',
            }}>
              <h3 style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1rem' }}>
                STATISTICS
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#d1d5db' }}>Total</span>
                  <span style={{ color: '#3b82f6', fontWeight: '600' }}>{stats.total}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#d1d5db' }}>Completed</span>
                  <span style={{ color: '#10b981', fontWeight: '600' }}>{stats.completed}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#d1d5db' }}>Pending</span>
                  <span style={{ color: '#f59e0b', fontWeight: '600' }}>{stats.pending}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#d1d5db' }}>High Priority</span>
                  <span style={{ color: '#ef4444', fontWeight: '600' }}>{stats.high}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </aside>

      {/* Main Content */}
      <main className="content" style={{ flex: 1, marginLeft: sidebarOpen ? '0' : '80px' }}>
        {/* Header */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '3rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid #1f2937',
        }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              My Tasks
            </h2>
            <p style={{ color: '#9ca3af' }}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              background: '#3b82f6',
              padding: '0.75rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>+</span>
            <span>Add Task</span>
          </button>
        </header>

        {/* Add Task Form */}
        {showAddForm && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Create New Task</h3>
            <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#d1d5db', fontWeight: '500' }}>
                  Task Title
                </label>
                <input
                  type="text"
                  placeholder="Enter task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  style={{ width: '100%', maxWidth: '100%' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#d1d5db', fontWeight: '500' }}>
                  Description
                </label>
                <textarea
                  placeholder="Add details about this task..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  style={{ width: '100%', minHeight: '100px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#d1d5db', fontWeight: '500' }}>
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                  style={{ width: '200px' }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit">
                  Create Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  style={{ background: '#374151' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tasks Grid */}
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {tasks.map(task => (
            <div
              key={task.id}
              className="card"
              style={{
                opacity: task.completed ? 0.6 : 1,
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  style={{
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    accentColor: '#3b82f6',
                    marginTop: '0.25rem',
                  }}
                />

                {/* Task Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      textDecoration: task.completed ? 'line-through' : 'none',
                    }}>
                      {task.title}
                    </h3>
                    <span
                      className="badge"
                      style={{
                        background: getPriorityColor(task.priority),
                        color: 'white',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                      }}
                    >
                      {task.priority}
                    </span>
                  </div>
                  {task.description && (
                    <p style={{ color: '#9ca3af', lineHeight: '1.6', marginBottom: '1rem' }}>
                      {task.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
                    <span>📅 {task.createdAt.toLocaleDateString()}</span>
                    {task.completed && <span>✅ Completed</span>}
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => deleteTask(task.id)}
                  style={{
                    background: 'transparent',
                    border: '1px solid #ef4444',
                    color: '#ef4444',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {tasks.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: '#6b7280',
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#9ca3af' }}>
                No tasks yet
              </h3>
              <p>Create your first task to get started!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
