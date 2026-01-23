'use client';

/**
 * Beautiful Dashboard - AI Todo Application
 * Interactive particles background with modern layout
 */

import { useState, useEffect } from 'react';

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

  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number }>>([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' as const });
  const [showAddForm, setShowAddForm] = useState(false);

  // Generate particles on mount
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 40; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          duration: Math.random() * 25 + 15,
        });
      }
      setParticles(newParticles);
    };
    generateParticles();
  }, []);

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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated Particles Background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}>
        {particles.map(particle => (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: 'rgba(59, 130, 246, 0.4)',
              borderRadius: '50%',
              animation: `float ${particle.duration}s infinite ease-in-out`,
              boxShadow: '0 0 8px rgba(59, 130, 246, 0.3)',
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          50% { transform: translateY(-15px) translateX(8px); opacity: 0.6; }
        }
      `}</style>

      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Top Navigation */}
        <nav style={{
          padding: '1.25rem 2rem',
          borderBottom: '1px solid rgba(59, 130, 246, 0.1)',
          background: 'rgba(17, 17, 17, 0.8)',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
            }}>
              ✨ AI Todo Dashboard
            </h1>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                background: 'transparent',
                border: '1px solid #374151',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              ← Back to Home
            </button>
          </div>
        </nav>

        {/* Dashboard Content - Centered Layout */}
        <main style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '3rem 2rem',
        }}>
          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}>
            <div className="card" style={{
              background: 'rgba(26, 26, 26, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              padding: '1.75rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Total Tasks
                  </p>
                  <h3 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#3b82f6' }}>
                    {stats.total}
                  </h3>
                </div>
                <div style={{ fontSize: '3rem' }}>📋</div>
              </div>
            </div>

            <div className="card" style={{
              background: 'rgba(26, 26, 26, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              padding: '1.75rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Completed
                  </p>
                  <h3 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#10b981' }}>
                    {stats.completed}
                  </h3>
                </div>
                <div style={{ fontSize: '3rem' }}>✅</div>
              </div>
            </div>

            <div className="card" style={{
              background: 'rgba(26, 26, 26, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              padding: '1.75rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Pending
                  </p>
                  <h3 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#f59e0b' }}>
                    {stats.pending}
                  </h3>
                </div>
                <div style={{ fontSize: '3rem' }}>⏳</div>
              </div>
            </div>

            <div className="card" style={{
              background: 'rgba(26, 26, 26, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              padding: '1.75rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                    High Priority
                  </p>
                  <h3 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#ef4444' }}>
                    {stats.high}
                  </h3>
                </div>
                <div style={{ fontSize: '3rem' }}>🔥</div>
              </div>
            </div>
          </div>

          {/* Header with Add Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2.5rem',
          }}>
            <div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                My Tasks
              </h2>
              <p style={{ color: '#9ca3af', fontSize: '1rem' }}>
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
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                padding: '0.875rem 1.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                fontSize: '1rem',
                fontWeight: '600',
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>+</span>
              <span>New Task</span>
            </button>
          </div>

          {/* Add Task Form */}
          {showAddForm && (
            <div className="card" style={{
              marginBottom: '2.5rem',
              background: 'rgba(26, 26, 26, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              padding: '2.5rem',
            }}>
              <h3 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '2rem' }}>
                ✨ Create New Task
              </h3>
              <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.625rem',
                    color: '#d1d5db',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Task Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter task title..."
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    style={{ width: '100%', maxWidth: '100%', fontSize: '1rem' }}
                    required
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.625rem',
                    color: '#d1d5db',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Description
                  </label>
                  <textarea
                    placeholder="Add details about this task..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    style={{ width: '100%', minHeight: '100px', fontSize: '1rem' }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.625rem',
                    color: '#d1d5db',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Priority Level
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    style={{ width: '250px', fontSize: '1rem' }}
                  >
                    <option value="low">🟢 Low Priority</option>
                    <option value="medium">🟡 Medium Priority</option>
                    <option value="high">🔴 High Priority</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button
                    type="submit"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      fontWeight: '600',
                    }}
                  >
                    Create Task
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    style={{
                      background: '#374151',
                      fontWeight: '600',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tasks List */}
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {tasks.map(task => (
              <div
                key={task.id}
                className="card"
                style={{
                  opacity: task.completed ? 0.7 : 1,
                  background: 'rgba(26, 26, 26, 0.9)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${task.completed ? 'rgba(107, 114, 128, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`,
                  padding: '2rem',
                }}
              >
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    style={{
                      width: '28px',
                      height: '28px',
                      cursor: 'pointer',
                      accentColor: '#3b82f6',
                      marginTop: '0.25rem',
                    }}
                  />

                  {/* Task Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                      <h3 style={{
                        fontSize: '1.375rem',
                        fontWeight: '700',
                        textDecoration: task.completed ? 'line-through' : 'none',
                        color: task.completed ? '#9ca3af' : '#f9fafb',
                      }}>
                        {task.title}
                      </h3>
                      <span
                        className="badge"
                        style={{
                          background: getPriorityColor(task.priority),
                          color: 'white',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          padding: '0.375rem 0.875rem',
                        }}
                      >
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p style={{
                        color: '#9ca3af',
                        lineHeight: '1.7',
                        marginBottom: '1.25rem',
                        fontSize: '1rem',
                      }}>
                        {task.description}
                      </p>
                    )}
                    <div style={{
                      display: 'flex',
                      gap: '1.5rem',
                      alignItems: 'center',
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      fontWeight: '500',
                    }}>
                      <span>📅 {task.createdAt.toLocaleDateString()}</span>
                      {task.completed && <span style={{ color: '#10b981' }}>✅ Completed</span>}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteTask(task.id)}
                    style={{
                      background: 'transparent',
                      border: '1px solid #ef4444',
                      color: '#ef4444',
                      padding: '0.625rem 1.25rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
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
                padding: '5rem 2rem',
                color: '#6b7280',
              }}>
                <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>📋</div>
                <h3 style={{ fontSize: '1.75rem', marginBottom: '0.75rem', color: '#9ca3af', fontWeight: '700' }}>
                  No tasks yet
                </h3>
                <p style={{ fontSize: '1.125rem' }}>Create your first task to get started on your productivity journey!</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
