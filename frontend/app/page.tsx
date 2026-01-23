/**
 * Beautiful Landing Page - AI Todo Application
 * Interactive particles background - No auth forms
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number }>>([]);

  // Generate particles on mount
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 60; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 5 + 2,
          duration: Math.random() * 20 + 10,
        });
      }
      setParticles(newParticles);
    };
    generateParticles();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 75%, #0a0a0a 100%)',
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
              background: 'rgba(59, 130, 246, 0.6)',
              borderRadius: '50%',
              animation: `float ${particle.duration}s infinite ease-in-out`,
              boxShadow: '0 0 15px rgba(59, 130, 246, 0.6)',
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-25px) translateX(15px) scale(1.2); opacity: 0.9; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header Navigation */}
        <nav style={{
          padding: '1.5rem 2rem',
          background: 'rgba(17, 17, 17, 0.7)',
          backdropFilter: 'blur(15px)',
          borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '900',
              background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-1px',
            }}>
              ✨ AI Todo
            </h1>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => router.push('/signin')}
                style={{
                  background: 'transparent',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(59, 130, 246, 0.5)',
                  fontWeight: '600',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                  e.currentTarget.style.borderColor = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => router.push('/signup')}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '1rem',
                  boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 25px rgba(59, 130, 246, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.4)';
                }}
              >
                Get Started
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <main style={{ padding: '6rem 2rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            {/* Main Hero Content */}
            <div style={{ marginBottom: '4rem' }}>
              <div style={{
                display: 'inline-block',
                padding: '0.5rem 1.5rem',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '50px',
                marginBottom: '2rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#60a5fa',
                letterSpacing: '0.5px',
              }}>
                🚀 AI-POWERED PRODUCTIVITY
              </div>

              <h2 style={{
                fontSize: '5rem',
                fontWeight: '900',
                marginBottom: '2rem',
                background: 'linear-gradient(135deg, #ffffff 0%, #93c5fd 50%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: '1.1',
                letterSpacing: '-3px',
              }}>
                Organize Your Life<br/>
                <span style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  with Intelligence
                </span>
              </h2>

              <p style={{
                fontSize: '1.5rem',
                color: '#9ca3af',
                maxWidth: '800px',
                margin: '0 auto 3rem',
                lineHeight: '1.8',
                fontWeight: '400',
              }}>
                Transform the way you manage tasks with AI-powered insights,
                smart prioritization, and beautiful design that makes productivity effortless.
              </p>

              {/* CTA Buttons */}
              <div style={{
                display: 'flex',
                gap: '1.5rem',
                justifyContent: 'center',
                marginBottom: '3rem',
              }}>
                <button
                  onClick={() => router.push('/signup')}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    padding: '1.25rem 3rem',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '1.25rem',
                    boxShadow: '0 10px 40px rgba(59, 130, 246, 0.5)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 15px 50px rgba(59, 130, 246, 0.7)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 40px rgba(59, 130, 246, 0.5)';
                  }}
                >
                  Start Free Today →
                </button>
                <button
                  onClick={() => router.push('/signin')}
                  style={{
                    background: 'transparent',
                    padding: '1.25rem 3rem',
                    borderRadius: '12px',
                    border: '2px solid #374151',
                    fontWeight: '700',
                    fontSize: '1.25rem',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#374151';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  Sign In
                </button>
              </div>

              {/* Trust Indicators */}
              <div style={{
                display: 'flex',
                gap: '3rem',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#6b7280',
                fontSize: '0.875rem',
                fontWeight: '500',
              }}>
                <div>✅ Free to start</div>
                <div>⚡ Lightning fast</div>
                <div>🔒 Secure & Private</div>
              </div>
            </div>

            {/* Features Grid */}
            <div style={{
              marginTop: '8rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
            }}>
              <div
                className="card"
                style={{
                  textAlign: 'center',
                  background: 'rgba(26, 26, 26, 0.7)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  padding: '3rem 2rem',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.borderColor = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                }}
              >
                <div style={{
                  fontSize: '4rem',
                  marginBottom: '1.5rem',
                }}>🤖</div>
                <h4 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>
                  AI-Powered Intelligence
                </h4>
                <p style={{ color: '#9ca3af', lineHeight: '1.7', fontSize: '1.0625rem' }}>
                  Smart task suggestions, automatic prioritization, and intelligent scheduling powered by advanced AI
                </p>
              </div>

              <div
                className="card"
                style={{
                  textAlign: 'center',
                  background: 'rgba(26, 26, 26, 0.7)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  padding: '3rem 2rem',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.borderColor = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                }}
              >
                <div style={{
                  fontSize: '4rem',
                  marginBottom: '1.5rem',
                }}>⚡</div>
                <h4 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>
                  Lightning Performance
                </h4>
                <p style={{ color: '#9ca3af', lineHeight: '1.7', fontSize: '1.0625rem' }}>
                  Blazing fast interface with real-time synchronization across all your devices instantly
                </p>
              </div>

              <div
                className="card"
                style={{
                  textAlign: 'center',
                  background: 'rgba(26, 26, 26, 0.7)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  padding: '3rem 2rem',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.borderColor = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                }}
              >
                <div style={{
                  fontSize: '4rem',
                  marginBottom: '1.5rem',
                }}>🎨</div>
                <h4 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>
                  Beautiful Experience
                </h4>
                <p style={{ color: '#9ca3af', lineHeight: '1.7', fontSize: '1.0625rem' }}>
                  Stunning dark theme with smooth animations and intuitive design that makes work enjoyable
                </p>
              </div>
            </div>

            {/* Stats Section */}
            <div style={{
              marginTop: '8rem',
              padding: '4rem 2rem',
              background: 'rgba(26, 26, 26, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '16px',
            }}>
              <h3 style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                marginBottom: '3rem',
              }}>
                Trusted by Productive People
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '3rem',
              }}>
                <div>
                  <div style={{
                    fontSize: '3rem',
                    fontWeight: '900',
                    color: '#3b82f6',
                    marginBottom: '0.5rem',
                  }}>10K+</div>
                  <div style={{ color: '#9ca3af', fontSize: '1.125rem' }}>Active Users</div>
                </div>
                <div>
                  <div style={{
                    fontSize: '3rem',
                    fontWeight: '900',
                    color: '#3b82f6',
                    marginBottom: '0.5rem',
                  }}>1M+</div>
                  <div style={{ color: '#9ca3af', fontSize: '1.125rem' }}>Tasks Completed</div>
                </div>
                <div>
                  <div style={{
                    fontSize: '3rem',
                    fontWeight: '900',
                    color: '#3b82f6',
                    marginBottom: '0.5rem',
                  }}>99.9%</div>
                  <div style={{ color: '#9ca3af', fontSize: '1.125rem' }}>Uptime</div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer style={{
          marginTop: '8rem',
          padding: '3rem 2rem',
          textAlign: 'center',
          borderTop: '1px solid rgba(59, 130, 246, 0.1)',
          color: '#6b7280',
          background: 'rgba(17, 17, 17, 0.5)',
        }}>
          <p style={{ fontSize: '1rem', marginBottom: '1rem' }}>
            © 2026 AI Todo App. Built with Next.js, AI & ❤️
          </p>
          <div style={{
            display: 'flex',
            gap: '2rem',
            justifyContent: 'center',
            fontSize: '0.875rem',
          }}>
            <a href="#" style={{ color: '#9ca3af', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
            >Privacy</a>
            <a href="#" style={{ color: '#9ca3af', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
            >Terms</a>
            <a href="#" style={{ color: '#9ca3af', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
            >Contact</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
