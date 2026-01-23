/**
 * Sign In Page - AI Todo Application
 * Interactive particles background with centered auth card
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number }>>([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Generate particles on mount
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 1.5,
          duration: Math.random() * 20 + 10,
        });
      }
      setParticles(newParticles);
    };
    generateParticles();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
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
              boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
        }
      `}</style>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '500px', padding: '2rem' }}>
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          style={{
            background: 'transparent',
            border: '1px solid #374151',
            padding: '0.625rem 1.25rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          ← Back to Home
        </button>

        {/* Sign In Card */}
        <div
          className="card"
          style={{
            padding: '3rem',
            background: 'rgba(26, 26, 26, 0.95)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔐</div>
            <h1 style={{
              fontSize: '2.25rem',
              fontWeight: '800',
              marginBottom: '0.75rem',
              color: '#f9fafb',
            }}>
              Welcome Back
            </h1>
            <p style={{
              color: '#9ca3af',
              fontSize: '1.0625rem',
            }}>
              Sign in to access your intelligent workspace
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.625rem',
                color: '#d1d5db',
                fontSize: '0.875rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  fontSize: '1rem',
                }}
                required
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.625rem',
                color: '#d1d5db',
                fontSize: '0.875rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  fontSize: '1rem',
                }}
                required
              />
              <div style={{
                marginTop: '0.75rem',
                textAlign: 'right',
              }}>
                <a href="#" style={{
                  color: '#3b82f6',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}>
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              style={{
                marginTop: '0.5rem',
                width: '100%',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                fontSize: '1.125rem',
                fontWeight: '700',
                padding: '1rem',
                boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)',
              }}
            >
              Sign In →
            </button>
          </form>

          <div style={{
            marginTop: '2rem',
            paddingTop: '2rem',
            borderTop: '1px solid #374151',
            textAlign: 'center',
          }}>
            <p style={{ color: '#9ca3af', fontSize: '0.9375rem' }}>
              Don't have an account?{' '}
              <span
                onClick={() => router.push('/signup')}
                style={{
                  color: '#3b82f6',
                  cursor: 'pointer',
                  fontWeight: '700',
                  textDecoration: 'underline',
                }}
              >
                Sign up free
              </span>
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div style={{
          marginTop: '2rem',
          display: 'flex',
          gap: '2rem',
          justifyContent: 'center',
          color: '#6b7280',
          fontSize: '0.8125rem',
          fontWeight: '500',
        }}>
          <div>🔒 Secure</div>
          <div>⚡ Fast</div>
          <div>🌐 Universal</div>
        </div>
      </div>
    </div>
  );
}
