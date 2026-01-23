/**
 * Modern Landing Page - AI Todo Application
 * Beautiful dark theme with signin/signup cards
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to dashboard for now
    router.push('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      {/* Header Navigation */}
      <nav style={{
        padding: '1.5rem 2rem',
        borderBottom: '1px solid #1f2937',
        background: '#111111',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            AI Todo App
          </h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setActiveTab('signin')}
              style={{
                background: activeTab === 'signin' ? '#3b82f6' : 'transparent',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '1px solid #374151',
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              style={{
                background: activeTab === 'signup' ? '#3b82f6' : 'transparent',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '1px solid #374151',
              }}
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Auth Cards */}
      <main style={{ padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Hero Content */}
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: '3.5rem',
              fontWeight: '800',
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, #f9fafb 0%, #9ca3af 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: '1.2',
            }}>
              Manage Tasks with AI
            </h2>
            <p style={{
              fontSize: '1.25rem',
              color: '#9ca3af',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6',
            }}>
              Intelligent todo management powered by AI. Organize, prioritize, and accomplish more with smart automation.
            </p>
          </div>

          {/* Auth Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '2rem',
            maxWidth: '900px',
            margin: '0 auto',
          }}>
            {/* Sign In Card */}
            <div
              className="card"
              style={{
                display: activeTab === 'signin' ? 'block' : 'none',
                padding: '2rem',
              }}
            >
              <h3 style={{
                fontSize: '1.875rem',
                fontWeight: '700',
                marginBottom: '0.5rem',
                color: '#f9fafb',
              }}>
                Welcome Back
              </h3>
              <p style={{
                color: '#9ca3af',
                marginBottom: '2rem',
              }}>
                Sign in to access your tasks
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#d1d5db',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#d1d5db',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                  }}>
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" style={{ marginTop: '0.5rem' }}>
                  Sign In
                </button>

                <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
                  Don't have an account?{' '}
                  <span
                    onClick={() => setActiveTab('signup')}
                    style={{ color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Sign up
                  </span>
                </p>
              </form>
            </div>

            {/* Sign Up Card */}
            <div
              className="card"
              style={{
                display: activeTab === 'signup' ? 'block' : 'none',
                padding: '2rem',
              }}
            >
              <h3 style={{
                fontSize: '1.875rem',
                fontWeight: '700',
                marginBottom: '0.5rem',
                color: '#f9fafb',
              }}>
                Create Account
              </h3>
              <p style={{
                color: '#9ca3af',
                marginBottom: '2rem',
              }}>
                Start your productivity journey today
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#d1d5db',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                  }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#d1d5db',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#d1d5db',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                  }}>
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                    Must be at least 8 characters with uppercase, lowercase, and numbers
                  </p>
                </div>

                <button type="submit" style={{ marginTop: '0.5rem' }}>
                  Create Account
                </button>

                <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
                  Already have an account?{' '}
                  <span
                    onClick={() => setActiveTab('signin')}
                    style={{ color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Sign in
                  </span>
                </p>
              </form>
            </div>
          </div>

          {/* Features Section */}
          <div style={{
            marginTop: '6rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            maxWidth: '1200px',
            margin: '6rem auto 0',
          }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem',
              }}>🤖</div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                AI-Powered
              </h4>
              <p style={{ color: '#9ca3af', lineHeight: '1.6' }}>
                Intelligent task suggestions and smart prioritization
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem',
              }}>⚡</div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                Lightning Fast
              </h4>
              <p style={{ color: '#9ca3af', lineHeight: '1.6' }}>
                Blazing fast performance with instant sync
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem',
              }}>🎨</div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                Beautiful Design
              </h4>
              <p style={{ color: '#9ca3af', lineHeight: '1.6' }}>
                Modern dark theme with smooth animations
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: '6rem',
        padding: '2rem',
        textAlign: 'center',
        borderTop: '1px solid #1f2937',
        color: '#6b7280',
      }}>
        <p>© 2026 AI Todo App. Built with Next.js & AI.</p>
      </footer>
    </div>
  );
}
