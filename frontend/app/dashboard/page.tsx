'use client';

/**
 * Beautiful Dashboard - AI Todo Application
 * Enhanced UX with animations, notifications, and smooth interactions
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

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
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
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'ai'; message: string }>>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');

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

  // Toast notification system
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      showToast('Please enter a task title', 'error');
      return;
    }

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
    showToast(`Task "${task.title}" created successfully! 🎉`, 'success');
  };

  const toggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
    if (task) {
      showToast(
        task.completed ? `Task "${task.title}" reopened` : `Task "${task.title}" completed! ✅`,
        'success'
      );
    }
  };

  const deleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    setTasks(tasks.filter(task => task.id !== id));
    setDeleteConfirm(null);
    if (task) {
      showToast(`Task "${task.title}" deleted`, 'info');
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage.toLowerCase();
    const newHistory = [...chatHistory, { role: 'user' as const, message: chatMessage }];
    setChatHistory(newHistory);
    setChatMessage('');

    setTimeout(() => {
      let aiResponse = '';

      if (userMessage.includes('create') || userMessage.includes('add') || userMessage.includes('new task')) {
        const taskTitle = chatMessage.replace(/create|add|new task|task/gi, '').trim();
        if (taskTitle) {
          const newTask: Task = {
            id: Date.now().toString(),
            title: taskTitle || 'New Task',
            description: 'Created by AI Assistant',
            completed: false,
            priority: 'medium',
            createdAt: new Date(),
          };
          setTasks(prev => [newTask, ...prev]);
          aiResponse = `✅ Task created: "${taskTitle}". Added to your list with medium priority.`;
          showToast('AI created a task for you!', 'success');
        } else {
          aiResponse = 'Please specify the task title. Example: "Create project proposal"';
        }
      }
      else if (userMessage.includes('list') || userMessage.includes('show') || userMessage.includes('my tasks')) {
        const pendingTasks = tasks.filter(t => !t.completed);
        if (pendingTasks.length > 0) {
          aiResponse = `📋 You have ${pendingTasks.length} pending tasks:\n\n${pendingTasks.slice(0, 5).map((t, i) =>
            `${i + 1}. ${t.title} (${t.priority} priority)`
          ).join('\n')}`;
        } else {
          aiResponse = '🎉 Great! You have no pending tasks.';
        }
      }
      else if (userMessage.includes('stat') || userMessage.includes('progress') || userMessage.includes('summary')) {
        const completed = tasks.filter(t => t.completed).length;
        const pending = tasks.filter(t => !t.completed).length;
        const highPriority = tasks.filter(t => t.priority === 'high' && !t.completed).length;
        aiResponse = `📊 Statistics:\n\n✅ Completed: ${completed}\n⏳ Pending: ${pending}\n🔥 High Priority: ${highPriority}\n📋 Total: ${tasks.length}`;
      }
      else if (userMessage.includes('complete') || userMessage.includes('done') || userMessage.includes('finish')) {
        const incompleteTasks = tasks.filter(t => !t.completed);
        if (incompleteTasks.length > 0) {
          const taskToComplete = incompleteTasks[0];
          setTasks(tasks.map(t =>
            t.id === taskToComplete.id ? { ...t, completed: true } : t
          ));
          aiResponse = `✅ Marked "${taskToComplete.title}" as completed! 🎉`;
          showToast('Task completed!', 'success');
        } else {
          aiResponse = 'All tasks are already completed! 🎉';
        }
      }
      else if (userMessage.includes('delete') || userMessage.includes('remove')) {
        if (tasks.length > 0) {
          const lastTask = tasks[0];
          setTasks(tasks.filter(t => t.id !== lastTask.id));
          aiResponse = `🗑️ Deleted task: "${lastTask.title}"`;
          showToast('Task deleted', 'info');
        } else {
          aiResponse = 'No tasks to delete.';
        }
      }
      else if (userMessage.includes('priority') || userMessage.includes('important')) {
        const highPriorityTasks = tasks.filter(t => t.priority === 'high' && !t.completed);
        if (highPriorityTasks.length > 0) {
          aiResponse = `🔥 High Priority (${highPriorityTasks.length}):\n\n${highPriorityTasks.map((t, i) =>
            `${i + 1}. ${t.title}`
          ).join('\n')}`;
        } else {
          aiResponse = '✨ No high priority tasks!';
        }
      }
      else if (userMessage.includes('help') || userMessage.includes('what can you do')) {
        aiResponse = `🤖 I can help you:\n\n✨ "Create [task]" - Add task\n📋 "List tasks" - Show all\n✅ "Complete task" - Mark done\n🗑️ "Delete task" - Remove\n🔥 "Show priority" - High priority\n📊 "Show stats" - Progress`;
      }
      else {
        aiResponse = `I'm your AI assistant! 🤖\n\nTry:\n• "Create meeting notes"\n• "Show my tasks"\n• "Complete task"\n• "Show stats"`;
      }

      setChatHistory(prev => [...prev, { role: 'ai', message: aiResponse }]);
    }, 500);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

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
      {/* Animated Particles */}
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
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Toast Notifications */}
      <div style={{
        position: 'fixed',
        top: '2rem',
        right: '2rem',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              background: toast.type === 'success' ? 'rgba(16, 185, 129, 0.95)' :
                         toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' :
                         'rgba(59, 130, 246, 0.95)',
              backdropFilter: 'blur(10px)',
              padding: '1rem 1.5rem',
              borderRadius: '12px',
              color: 'white',
              fontWeight: '600',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
              animation: 'slideIn 0.3s ease-out',
              minWidth: '300px',
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>

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
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#374151';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              ← Back to Home
            </button>
          </div>
        </nav>

        {/* Dashboard Content */}
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
            {[
              { label: 'Total Tasks', value: stats.total, icon: '📋', color: 'rgba(59, 130, 246, 0.2)' },
              { label: 'Completed', value: stats.completed, icon: '✅', color: 'rgba(16, 185, 129, 0.2)' },
              { label: 'Pending', value: stats.pending, icon: '⏳', color: 'rgba(245, 158, 11, 0.2)' },
              { label: 'High Priority', value: stats.high, icon: '🔥', color: 'rgba(239, 68, 68, 0.2)' },
            ].map((stat, index) => (
              <div
                key={index}
                className="card"
                style={{
                  background: 'rgba(26, 26, 26, 0.9)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${stat.color}`,
                  padding: '1.75rem',
                  animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`,
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = `0 15px 40px ${stat.color}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.4)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                      {stat.label}
                    </p>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#3b82f6' }}>
                      {stat.value}
                    </h3>
                  </div>
                  <div style={{ fontSize: '3rem' }}>{stat.icon}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Search and Filter Bar */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
          }}>
            <input
              type="text"
              placeholder="🔍 Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                minWidth: '250px',
                background: 'rgba(26, 26, 26, 0.9)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                padding: '0.875rem 1.25rem',
                borderRadius: '10px',
                fontSize: '1rem',
              }}
            />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              style={{
                background: 'rgba(26, 26, 26, 0.9)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                padding: '0.875rem 1.25rem',
                borderRadius: '10px',
                fontSize: '1rem',
                minWidth: '180px',
              }}
            >
              <option value="all">All Priorities</option>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
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
                boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(59, 130, 246, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.4)';
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
              animation: 'fadeIn 0.3s ease-out',
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
                    Task Title *
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
                    placeholder="Add details..."
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
            {filteredTasks.map((task, index) => (
              <div
                key={task.id}
                className="card"
                style={{
                  opacity: task.completed ? 0.7 : 1,
                  background: 'rgba(26, 26, 26, 0.9)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${task.completed ? 'rgba(107, 114, 128, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`,
                  padding: '2rem',
                  animation: `fadeIn 0.4s ease-out ${index * 0.05}s both`,
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  if (!task.completed) {
                    e.currentTarget.style.transform = 'translateX(8px)';
                    e.currentTarget.style.borderColor = '#3b82f6';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.borderColor = task.completed ? 'rgba(107, 114, 128, 0.2)' : 'rgba(59, 130, 246, 0.2)';
                }}
              >
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
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

                  {deleteConfirm === task.id ? (
                    <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                      <button
                        onClick={() => deleteTask(task.id)}
                        style={{
                          background: '#ef4444',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                        }}
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        style={{
                          background: '#374151',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(task.id)}
                      style={{
                        background: 'transparent',
                        border: '1px solid #ef4444',
                        color: '#ef4444',
                        padding: '0.625rem 1.25rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#ef4444';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#ef4444';
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}

            {filteredTasks.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '5rem 2rem',
                color: '#6b7280',
                animation: 'fadeIn 0.5s ease-out',
              }}>
                <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>
                  {searchQuery || filterPriority !== 'all' ? '🔍' : '📋'}
                </div>
                <h3 style={{ fontSize: '1.75rem', marginBottom: '0.75rem', color: '#9ca3af', fontWeight: '700' }}>
                  {searchQuery || filterPriority !== 'all' ? 'No tasks found' : 'No tasks yet'}
                </h3>
                <p style={{ fontSize: '1.125rem' }}>
                  {searchQuery || filterPriority !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Create your first task to get started!'}
                </p>
              </div>
            )}
          </div>
        </main>

        {/* AI Chatbot Button */}
        <button
          onClick={() => setShowChatbot(!showChatbot)}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            border: 'none',
            boxShadow: '0 10px 40px rgba(59, 130, 246, 0.6)',
            fontSize: '1.75rem',
            cursor: 'pointer',
            zIndex: 1000,
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.15) rotate(10deg)';
            e.currentTarget.style.boxShadow = '0 15px 50px rgba(59, 130, 246, 0.8)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
            e.currentTarget.style.boxShadow = '0 10px 40px rgba(59, 130, 246, 0.6)';
          }}
        >
          {showChatbot ? '✕' : '🤖'}
        </button>

        {/* Chatbot Modal */}
        {showChatbot && (
          <div style={{
            position: 'fixed',
            bottom: '6rem',
            right: '2rem',
            width: '400px',
            height: '550px',
            background: 'rgba(26, 26, 26, 0.98)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideIn 0.3s ease-out',
          }}>
            <div style={{
              padding: '1.25rem',
              borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
              background: 'rgba(59, 130, 246, 0.1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ fontSize: '2rem' }}>🤖</div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                    AI Assistant
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>
                    Always ready to help
                  </p>
                </div>
              </div>
            </div>

            <div style={{
              flex: 1,
              padding: '1.25rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}>
              {chatHistory.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem 1rem',
                  color: '#6b7280',
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👋</div>
                  <p style={{ fontSize: '0.9375rem', lineHeight: '1.6' }}>
                    Hi! I'm your AI assistant. Ask me anything about your tasks!
                  </p>
                </div>
              )}

              {chatHistory.map((chat, index) => (
                <div
                  key={index}
                  style={{
                    alignSelf: chat.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    animation: 'fadeIn 0.3s ease-out',
                  }}
                >
                  <div style={{
                    padding: '0.875rem 1.125rem',
                    borderRadius: '12px',
                    background: chat.role === 'user'
                      ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                      : 'rgba(55, 65, 81, 0.5)',
                    fontSize: '0.9375rem',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {chat.message}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    marginTop: '0.375rem',
                    textAlign: chat.role === 'user' ? 'right' : 'left',
                  }}>
                    {chat.role === 'user' ? 'You' : 'AI'}
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleChatSubmit}
              style={{
                padding: '1rem',
                borderTop: '1px solid rgba(59, 130, 246, 0.2)',
                background: 'rgba(17, 17, 17, 0.5)',
              }}
            >
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Ask me anything..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  style={{
                    flex: 1,
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    fontSize: '0.9375rem',
                    color: '#e5e7eb',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1.25rem',
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  →
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
