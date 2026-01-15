'use client';

/**
 * SignInForm Component - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * Sign-in form with email/password validation and Better Auth integration.
 */

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/shared/Input';
import Button from '@/components/shared/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import styles from '@/styles/components/SignInForm.module.css';

export default function SignInForm() {
  const router = useRouter();
  const { signIn, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>(
    {}
  );

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      await signIn({ email, password });
      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Sign in failed. Please try again.',
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h2 className={styles.heading}>Welcome Back</h2>
        <p className={styles.subheading}>Sign in to continue to your dashboard</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
            autoComplete="email"
            disabled={isLoading}
          />

          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
            autoComplete="current-password"
            disabled={isLoading}
          />

          {errors.general && (
            <div className={styles.generalError} role="alert">
              {errors.general}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isLoading}
            className={styles.submitButton}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className={styles.footer}>
          Don't have an account?{' '}
          <a href="/auth/signup" className={styles.link}>
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
